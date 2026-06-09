import { Router, Request, Response, NextFunction } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { uploadRateLimiter } from "../middleware/rate-limit.js";
import {
  createSignedUploadUrl,
  createSignedDownloadUrl,
  isStorageConfigured,
} from "../lib/supabase-storage.js";

const router = Router();

router.post("/upload-url", uploadRateLimiter, isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName, contentType, uploadType = "general" } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: "fileName is required" });
    }

    if (!isStorageConfigured()) {
      return res.status(503).json({ error: "Storage service not configured" });
    }

    const result = await createSignedUploadUrl(fileName, uploadType);
    if (!result) {
      return res.status(500).json({ error: "Failed to create upload URL" });
    }

    res.json({
      uploadUrl: result.uploadUrl,
      fileKey: result.fileKey,
      downloadUrl: result.publicUrl,
      contentType,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/download/:fileKey(*)", isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileKey = req.params.fileKey;
    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    const url = await createSignedDownloadUrl(fileKey);
    if (!url) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ downloadUrl: url });
  } catch (error) {
    next(error);
  }
});

export default router;
