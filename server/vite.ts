import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { getGoogleSiteVerificationToken } from "./lib/gsc-settings.js";
import { injectGoogleSiteVerification } from "./lib/inject-html-meta.js";

// Don't import vite at top level - it will be dynamically imported in setupVite

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamic imports to avoid loading vite in production
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfig = (await import("../vite.config")).default;

  const viteLogger = createLogger();

  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: string, options: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const gscToken = await getGoogleSiteVerificationToken();
      template = injectGoogleSiteVerification(template, gscToken);
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Monolith deploy: client + server both under dist/ (dist/index.html, dist/server/)
  const monolithDistPath = path.resolve(import.meta.dirname, "..");
  const localDistPath = path.resolve(import.meta.dirname, "..", "client", "dist");

  const distPath = fs.existsSync(path.join(monolithDistPath, "index.html"))
    ? monolithDistPath
    : localDistPath;

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory. Tried:\n- ${monolithDistPath}\n- ${localDistPath}\nMake sure to build the client first`,
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  const indexPath = path.resolve(distPath, "index.html");

  // fall through to index.html if the file doesn't exist
  app.use("*", async (_req, res, next) => {
    try {
      let html = await fs.promises.readFile(indexPath, "utf-8");
      const gscToken = await getGoogleSiteVerificationToken();
      html = injectGoogleSiteVerification(html, gscToken);
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (error) {
      next(error);
    }
  });
}
