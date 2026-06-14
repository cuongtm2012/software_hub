import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes.js";
import { serveStatic, log } from "./vite.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import { initializeChatSocket } from "./socket/chat-socket.js";
import { initializeMonolithQueue } from "./lib/monolith-queue.js";

// Initialize database connection first
import { storage } from "./storage.js";

async function initializeDatabase() {
  try {
    console.log('Initializing database connection...');
    await storage.initialize();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function waitForExternalServices(timeout = 60000) {
  console.log('Waiting for external services to be ready...');
  const startTime = Date.now();

  const services = [
    { name: 'Email Service', url: process.env.EMAIL_SERVICE_URL || 'http://email-service:3001' },
    { name: 'Chat Service', url: process.env.CHAT_SERVICE_URL || 'http://chat-service:3002' },
    { name: 'Notification Service', url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3003' }
  ];

  while (Date.now() - startTime < timeout) {
    let allServicesReady = true;

    for (const service of services) {
      try {
        const response = await fetch(`${service.url}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          allServicesReady = false;
          break;
        }

      } catch (error) {
        allServicesReady = false;
        break;
      }
    }

    if (allServicesReady) {
      console.log('All external services are ready');
      return;
    }

    console.log('Waiting for external services...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.warn('Some external services may not be ready, continuing startup...');
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log('Starting SoftwareHub application...');

    // Initialize database first
    await initializeDatabase();

    // Initialize Firebase Admin SDK for push notifications
    try {
      const { initializeFirebaseAdmin } = await import("./lib/firebase-admin.js");
      initializeFirebaseAdmin();
    } catch (error) {
      console.warn('Firebase Admin SDK initialization skipped:', error);
    }

    // Monolith-first: wait for separate microservices only when explicitly enabled.
    if (process.env.SKIP_EXTERNAL_SERVICE_WAIT === 'true') {
      console.log('Skipping external microservice wait (SKIP_EXTERNAL_SERVICE_WAIT=true)');
    } else if (process.env.ENABLE_EXTERNAL_SERVICES === 'true') {
      await waitForExternalServices();
    } else {
      console.log('Monolith mode: skipping external microservice wait');
    }

    // Register routes after database is ready
    const server = await registerRoutes(app);
    initializeChatSocket(server);
    try {
      await initializeMonolithQueue();
    } catch (error) {
      console.warn("Monolith queue initialization skipped (Redis unavailable):", error);
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Application error:', err);
      res.status(status).json({ message });
    });

    // Health check endpoint (MUST be before serveStatic catch-all)
    app.get('/health', async (_req, res) => {
      const { isSupabaseConfigured, isSupabaseAdminHealthy } = await import("./lib/supabase.js");
      const supabaseAuth = isSupabaseConfigured();
      const supabaseAuthVerify = supabaseAuth ? await isSupabaseAdminHealthy() : false;
      res.json({
        status: 'ok',
        service: 'softwarehub-app',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        supabaseAuth,
        supabaseAuthVerify,
      });
    });

    // Setup Vite or static serving
    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
      // Dynamic import to avoid bundling Vite in production
      const { setupVite } = await import("./vite.js");
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = Number(process.env.PORT || 5000);
    server.listen(port, () => {
      log(`SoftwareHub application serving on port ${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`Database: Connected`);
    });

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
})();
