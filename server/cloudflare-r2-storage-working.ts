import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

export interface R2FileMetadata {
  filename: string;
  originalName: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
  etag?: string;
}

export interface R2UploadResult {
  key: string;
  url: string;
  metadata: R2FileMetadata;
}

export class CloudflareR2Storage {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Validate required environment variables
    let accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    
    // If CLOUDFLARE_ACCOUNT_ID is missing, extract from endpoint
    if (!accountId && process.env.CLOUDFLARE_R2_ENDPOINT) {
      const endpointMatch = process.env.CLOUDFLARE_R2_ENDPOINT.match(/https:\/\/([a-f0-9]+)\.r2\.cloudflarestorage\.com/);
      if (endpointMatch) {
        accountId = endpointMatch[1];
        console.log(`✅ Extracted Account ID from endpoint: ${accountId.slice(0,8)}...`);
      }
    }
    
    let accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'ocr-documents';

    // Debug credentials
    console.log(`🔍 R2 Credentials Debug:`);
    console.log(` Account ID: ${accountId ? accountId.slice(0,8)+'...' : 'missing'}`);
    console.log(` Access Key ID length: ${accessKeyId.length} (should be 32)`);
    console.log(` Secret Key length: ${secretAccessKey?.length || 0}`);
    console.log(` Bucket: ${this.bucketName}`);

    // Fix access key if it has extra character
    if (accessKeyId.length === 33) {
      console.log(`⚠️ Access key has 33 chars, trimming to 32...`);
      accessKeyId = accessKeyId.slice(0, 32);
      console.log(`✅ Trimmed access key length: ${accessKeyId.length}`);
    }

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing required Cloudflare R2 environment variables: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    }

    // Initialize S3 client configured for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto', // Cloudflare R2 uses 'auto' region
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey,
      },
      // Force path-style addressing for R2 compatibility
      forcePathStyle: true,
    });

    console.log(`✅ Cloudflare R2 Storage initialized for bucket: ${this.bucketName}`);
  }

  /**
   * Upload a file to Cloudflare R2 with multipart upload support
   */
  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    originalName: string,
    contentType: string,
    onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void
  ): Promise<R2UploadResult> {
    try {
      // Generate unique key with timestamp prefix to avoid conflicts
      const timestamp = Date.now();
      const key = `${timestamp}-${filename}`;

      console.log(`📤 Uploading file to R2: ${key} (${fileBuffer.length} bytes)`);

      // Use Upload for multipart uploads with progress tracking
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
          Metadata: {
            originalName,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Track upload progress if callback provided
      if (onProgress) {
        upload.on('httpUploadProgress', (progress) => {
          const percentage = progress.total ? Math.round((progress.loaded! / progress.total) * 100) : 0;
          onProgress({
            loaded: progress.loaded || 0,
            total: progress.total || fileBuffer.length,
            percentage,
          });
        });
      }

      const result = await upload.done();

      const metadata: R2FileMetadata = {
        filename: key,
        originalName,
        size: fileBuffer.length,
        contentType,
        uploadedAt: new Date(),
        etag: result.ETag?.replace(/"/g, ''), // Remove quotes from ETag
      };

      console.log(`✅ File uploaded successfully to R2: ${key}`);

      return {
        key,
        url: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${this.bucketName}/${key}`,
        metadata,
      };
    } catch (error) {
      console.error('❌ R2 upload failed:', error);
      throw new Error(`Failed to upload file to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a presigned URL for direct upload (optional advanced feature)
   */
  async generatePresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      console.log(`✅ Generated presigned upload URL for: ${key}`);
      return presignedUrl;
    } catch (error) {
      console.error('❌ Presigned URL generation failed:', error);
      throw new Error(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if R2 connection is working
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing R2 connection...');
      console.log(`🔍 Bucket URL: https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${this.bucketName}`);

      // Try to list objects (without prefix to avoid errors if bucket is empty)
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);
      console.log('✅ R2 connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ R2 connection test failed:', error);
      
      // Enhanced error diagnostics
      if (error.Code === 'Unauthorized' || error.message?.includes('Unauthorized')) {
        console.log('💡 Troubleshooting: The bucket exists but API token lacks permissions');
        console.log('💡 Please verify the R2 API token has "Object Read and Write" permissions for bucket:', this.bucketName);
        console.log('💡 Or try creating a new token with full R2 permissions');
      } else if (error.Code === 'NoSuchBucket') {
        console.log('💡 Bucket does not exist, please create it in Cloudflare dashboard:', this.bucketName);
      }
      
      return false;
    }
  }
}

// Export singleton instance (conditional initialization)
let r2Storage: CloudflareR2Storage | null = null;

export function getR2Storage(): CloudflareR2Storage | null {
  if (!r2Storage) {
    try {
      r2Storage = new CloudflareR2Storage();
    } catch (error) {
      console.warn('R2 storage not available:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
  return r2Storage;
}