# Cloudflare R2 Storage Configuration Guide

This guide explains how to set up Cloudflare R2 storage for the SoftwareHub file upload functionality.

## Overview

The application now supports Cloudflare R2 storage as the primary file storage solution, with fallback to the existing object storage system. R2 provides:

- Cost-effective file storage
- Global CDN distribution
- S3-compatible API
- High availability and durability

## Required Environment Variables

Add these environment variables to your `.env` file or Replit secrets:

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=softwarehub-uploads
CLOUDFLARE_R2_PUBLIC_ENDPOINT=https://your-custom-domain.com  # Optional: for public file access
```

## Setting Up Cloudflare R2

### 1. Create an R2 Bucket

1. Log in to your Cloudflare dashboard
2. Go to R2 Object Storage
3. Create a new bucket named `softwarehub-uploads` (or your preferred name)
4. Configure CORS settings if needed for direct browser uploads

### 2. Generate API Credentials

1. Go to "Manage R2 API tokens" in your Cloudflare dashboard
2. Create a new R2 token with the following permissions:
   - Object Read
   - Object Write
   - Object Delete
3. Specify the bucket you created above
4. Copy the generated credentials

### 3. Configure Environment Variables

Add the credentials to your environment:

- **Account ID**: Found in your Cloudflare dashboard sidebar
- **Access Key ID**: From the API token creation
- **Secret Access Key**: From the API token creation
- **Endpoint**: `https://[account-id].r2.cloudflarestorage.com`

## File Organization

The R2 storage service organizes files in the following structure:

```
bucket-name/
├── documents/                    # General document uploads
│   └── [uuid].[extension]
├── verification-documents/       # Seller verification documents
│   └── [user-id]/
│       └── [uuid].[extension]
└── product-images/              # Product images
    ├── [product-id]/
    │   └── [uuid].[extension]
    └── temp/                    # Temporary uploads
        └── [uuid].[extension]
```

## API Endpoints

The following endpoints are available for R2 operations:

### Upload URL Generation
```
POST /api/r2/upload-url
{
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "uploadType": "verification-documents" // or "documents", "product-images"
}
```

### Download URL Generation
```
POST /api/r2/download-url
{
  "fileKey": "verification-documents/123/uuid.pdf"
}
```

### File Download
```
GET /api/r2/file/[fileKey]
```

### File Deletion
```
DELETE /api/r2/file/[fileKey]
```

## Features

### 1. Document Upload Component

The `R2DocumentUploader` component provides:

- Drag & drop file upload
- Progress tracking
- File validation (type, size)
- Real-time upload status
- Error handling and retry functionality

### 2. Seller Registration Integration

The seller registration form now uses R2 storage for verification documents:

- Automatic file organization by user ID
- Secure presigned URL uploads
- Fallback to legacy storage if R2 is not configured

### 3. Validation and Security

- File type validation (PDF, JPG, PNG)
- File size limits (configurable, default 10MB)
- User authentication required for all operations
- Presigned URLs with expiration (1 hour)

## Troubleshooting

### Configuration Issues

If you see "R2 storage not configured" errors:

1. Verify all environment variables are set correctly
2. Check that the bucket name matches your actual R2 bucket
3. Ensure API credentials have the correct permissions

### Upload Failures

Common causes of upload failures:

1. **CORS Issues**: Configure CORS in your R2 bucket settings
2. **File Size**: Check the file doesn't exceed the 10MB limit
3. **File Type**: Ensure the file type is supported (PDF, JPG, PNG)
4. **Network**: Check network connectivity and firewall settings

### Debugging

Enable debug logging by checking the browser console. The uploader provides detailed logs for:

- Upload URL generation
- File upload progress
- Download URL generation
- Error details

## Cost Optimization

R2 pricing is based on:

- Storage: $0.015 per GB per month
- Operations: $4.50 per million Class A operations (writes)
- Data transfer: Free egress (no charges for downloads)

To optimize costs:

1. Implement file cleanup for temporary uploads
2. Use appropriate file compression
3. Monitor storage usage regularly

## Migration from Legacy Storage

To migrate existing files:

1. Keep the legacy ObjectUploader as fallback
2. Update file references to use R2 URLs
3. Gradually migrate old files using a background process
4. Update database records to reflect new file locations

## Security Considerations

- All uploads require user authentication
- Presigned URLs have short expiration times
- File access is controlled by user permissions
- Sensitive documents are stored in user-specific directories