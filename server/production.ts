import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration for test login
import session from 'express-session';
import { randomBytes } from 'crypto';

// Initialize database connection first
import { storage } from "./storage";

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

const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');

// Use memory store for production to avoid session store hanging issues
const MemoryStore = session.MemoryStore;

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore(), // Use memory store instead of PostgreSQL store
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: false // Set to false for Docker environment
  }
}));

// Logging middleware
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

      console.log(`${new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })} [express] ${logLine}`);
    }
  });

  next();
});

// Production static file serving (no Vite)
function serveStatic(app: express.Express) {
  const distPath = path.resolve(process.cwd(), "client", "dist");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  try {
    await initializeDatabase();
    await waitForExternalServices();
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Only serve static files in production (no Vite dependency)
  serveStatic(app);

  // ALWAYS serve the app on port 5000
  const port = 5000;
  server.listen(port, () => {
    console.log(`${new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit", 
      second: "2-digit",
      hour12: true,
    })} [express] serving on port ${port}`);
  });
})();