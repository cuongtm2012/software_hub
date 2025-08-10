import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";

// Cloudflare R2 Storage Client Configuration
export const r2Client = new S3Client({
  region: "auto", // Cloudflare R2 uses 'auto' as region
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "https://your-account-id.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});

export class R2StorageNotFoundError extends Error {
  constructor() {
    super("Object not found in R2 storage");
    this.name = "R2StorageNotFoundError";
    Object.setPrototypeOf(this, R2StorageNotFoundError.prototype);
  }
}

// Cloudflare R2 Storage Service
export class R2StorageService {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "softwarehub-uploads";
  }

  // Generate a presigned URL for file upload
  async getUploadUrl(fileKey: string, contentType: string = "application/octet-stream"): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(r2Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return signedUrl;
    } catch (error) {
      console.error("Error generating R2 upload URL:", error);
      throw new Error("Failed to generate upload URL");
    }
  }

  // Generate a presigned URL for file download
  async getDownloadUrl(fileKey: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const signedUrl = await getSignedUrl(r2Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return signedUrl;
    } catch (error) {
      console.error("Error generating R2 download URL:", error);
      throw new Error("Failed to generate download URL");
    }
  }

  // Generate file upload URL for documents
  async getDocumentUploadUrl(fileExtension: string = ""): Promise<{ uploadUrl: string; fileKey: string }> {
    const fileKey = `documents/${randomUUID()}${fileExtension}`;
    const uploadUrl = await this.getUploadUrl(fileKey);
    
    return {
      uploadUrl,
      fileKey,
    };
  }

  // Generate file upload URL for seller verification documents
  async getVerificationDocumentUploadUrl(userId: number, fileExtension: string = ""): Promise<{ uploadUrl: string; fileKey: string }> {
    const fileKey = `verification-documents/${userId}/${randomUUID()}${fileExtension}`;
    const uploadUrl = await this.getUploadUrl(fileKey);
    
    return {
      uploadUrl,
      fileKey,
    };
  }

  // Generate file upload URL for product images
  async getProductImageUploadUrl(productId?: number, fileExtension: string = ""): Promise<{ uploadUrl: string; fileKey: string }> {
    const fileKey = productId 
      ? `product-images/${productId}/${randomUUID()}${fileExtension}`
      : `product-images/temp/${randomUUID()}${fileExtension}`;
    const uploadUrl = await this.getUploadUrl(fileKey);
    
    return {
      uploadUrl,
      fileKey,
    };
  }

  // Download file from R2 and stream to response
  async downloadFile(fileKey: string, res: Response): Promise<void> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await r2Client.send(command);
      
      if (!response.Body) {
        throw new R2StorageNotFoundError();
      }

      // Set appropriate headers
      res.set({
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length": response.ContentLength?.toString() || "0",
        "Cache-Control": "private, max-age=3600",
      });

      // Stream the file to the response
      if (response.Body instanceof ReadableStream) {
        const reader = response.Body.getReader();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } finally {
          reader.releaseLock();
        }
      }

      res.end();
    } catch (error) {
      console.error("Error downloading file from R2:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  // Delete file from R2
  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await r2Client.send(command);
      return true;
    } catch (error) {
      console.error("Error deleting file from R2:", error);
      return false;
    }
  }

  // Get public URL for a file (if bucket is configured for public access)
  getPublicUrl(fileKey: string): string {
    const endpoint = process.env.CLOUDFLARE_R2_PUBLIC_ENDPOINT || process.env.CLOUDFLARE_R2_ENDPOINT;
    return `${endpoint}/${this.bucketName}/${fileKey}`;
  }

  // Validate R2 configuration
  validateConfiguration(): { valid: boolean; missingVars: string[] } {
    const requiredVars = [
      "CLOUDFLARE_R2_ENDPOINT",
      "CLOUDFLARE_R2_ACCESS_KEY_ID", 
      "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
      "CLOUDFLARE_R2_BUCKET_NAME"
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    return {
      valid: missingVars.length === 0,
      missingVars
    };
  }
}