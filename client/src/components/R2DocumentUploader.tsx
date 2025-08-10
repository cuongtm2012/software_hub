import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  CloudUpload, 
  FolderOpen, 
  FileImage, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Upload, 
  AlertCircle, 
  Clock, 
  X, 
  AlertTriangle 
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DocumentFile {
  file: File;
  id: string;
  uploadProgress: number;
  status: 'uploading' | 'uploaded' | 'failed';
  downloadUrl?: string;
  fileKey?: string;
}

interface R2DocumentUploaderProps {
  onFilesUploaded: (files: { fileKey: string; originalName: string; downloadUrl: string }[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeInMB?: number;
  className?: string;
}

export function R2DocumentUploader({ 
  onFilesUploaded, 
  maxFiles = 10, 
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  maxSizeInMB = 10,
  className = ""
}: R2DocumentUploaderProps) {
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileId = Date.now().toString() + Math.random().toString(36).substring(7);
      
      // Add file to state with uploading status
      setFiles(prev => [...prev, {
        file,
        id: fileId,
        uploadProgress: 0,
        status: 'uploading'
      }]);

      try {
        // Get upload URL from server
        const response = await fetch("/api/r2/upload-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for session cookies
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            uploadType: 'verification-documents'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const uploadResponse = await response.json() as { uploadUrl: string; fileKey: string };

        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, uploadProgress: 25 } : f
        ));

        // Upload file directly to R2
        console.log('Attempting direct upload to R2:', uploadResponse.uploadUrl);
        console.log('File details:', { name: file.name, type: file.type, size: file.size });
        
        try {
          // Try upload without explicit Content-Type header first (let browser set it)
          const uploadToR2 = await fetch(uploadResponse.uploadUrl, {
            method: 'PUT',
            body: file,
            mode: 'cors',
          });

          console.log('Upload response status:', uploadToR2.status, uploadToR2.statusText);
          console.log('Upload response headers:', Object.fromEntries(uploadToR2.headers.entries()));

          if (!uploadToR2.ok) {
            const errorText = await uploadToR2.text();
            console.error(`R2 upload failed: ${uploadToR2.status} ${uploadToR2.statusText}`, errorText);
            throw new Error(`Upload failed: ${uploadToR2.status} ${uploadToR2.statusText} - ${errorText}`);
          }

          console.log('R2 upload successful!');
        } catch (fetchError) {
          console.error('Fetch error details:', fetchError);
          if (fetchError instanceof TypeError) {
            console.error('Network or CORS error - check browser network tab for details');
            throw new Error('Network error: Check if CORS is properly configured in R2 bucket settings');
          }
          throw fetchError;
        }

        // Update progress
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, uploadProgress: 75 } : f
        ));

        // Get download URL
        const downloadResp = await fetch("/api/r2/download-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for session cookies
          body: JSON.stringify({
            fileKey: uploadResponse.fileKey
          }),
        });

        if (!downloadResp.ok) {
          const errorData = await downloadResp.json();
          throw new Error(errorData.error || `HTTP ${downloadResp.status}: ${downloadResp.statusText}`);
        }

        const downloadResponse = await downloadResp.json() as { downloadUrl: string };

        // Update file with completed status
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { 
            ...f, 
            uploadProgress: 100, 
            status: 'uploaded',
            downloadUrl: downloadResponse.downloadUrl,
            fileKey: uploadResponse.fileKey
          } : f
        ));

        return {
          fileKey: uploadResponse.fileKey,
          originalName: file.name,
          downloadUrl: downloadResponse.downloadUrl
        };

      } catch (error) {
        console.error('Upload failed:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'failed' } : f
        ));
        throw error;
      }
    },
    onSuccess: (result) => {
      toast({
        title: "Upload Complete",
        description: `${result.originalName} uploaded successfully`,
      });
      
      // Notify parent component
      const uploadedFiles = files
        .filter(f => f.status === 'uploaded')
        .map(f => ({
          fileKey: f.fileKey!,
          originalName: f.file.name,
          downloadUrl: f.downloadUrl!
        }))
        .concat([result]);
      
      onFilesUploaded(uploadedFiles);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check file count limit
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    acceptedFiles.forEach((file) => {
      // Check file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds ${maxSizeInMB}MB limit`,
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported format`,
          variant: "destructive",
        });
        return;
      }

      uploadMutation.mutate(file);
    });
  }, [uploadMutation, toast, files.length, maxFiles, maxSizeInMB, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      if (type === 'image/jpeg' || type === 'image/jpg') {
        acc['image/jpeg'] = ['.jpg', '.jpeg'];
      } else if (type === 'image/png') {
        acc['image/png'] = ['.png'];
      } else if (type === 'application/pdf') {
        acc['application/pdf'] = ['.pdf'];
      }
      return acc;
    }, {} as Record<string, string[]>),
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    
    // Update parent component with remaining uploaded files
    const remainingUploaded = files
      .filter(f => f.id !== fileId && f.status === 'uploaded')
      .map(f => ({
        fileKey: f.fileKey!,
        originalName: f.file.name,
        downloadUrl: f.downloadUrl!
      }));
    
    onFilesUploaded(remainingUploaded);
  };

  const retryUpload = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      uploadMutation.mutate(file.file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="text-red-500" size={20} />;
    }
    return <FileImage className="text-blue-500" size={20} />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'uploading':
        return <Loader2 className="text-blue-500 animate-spin" size={16} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Document Upload</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">R2 Storage Ready</span>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudUpload className="mx-auto text-gray-400 mb-4" size={48} />
          <h4 className="text-lg font-medium text-gray-700 mb-2">Upload Documents</h4>
          <p className="text-sm text-gray-500 mb-4">
            {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Supported formats: {acceptedTypes.map(type => {
              if (type.includes('pdf')) return 'PDF';
              if (type.includes('jpeg') || type.includes('jpg')) return 'JPG';
              if (type.includes('png')) return 'PNG';
              return type.split('/')[1].toUpperCase();
            }).join(', ')} • Max size: {maxSizeInMB}MB • Max files: {maxFiles}
          </p>
          
          <div className="flex items-center justify-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <FileImage className="text-blue-500" size={20} />
              <span className="text-xs text-gray-600">Images</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="text-red-500" size={20} />
              <span className="text-xs text-gray-600">PDFs</span>
            </div>
          </div>
          
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FolderOpen className="mr-2" size={16} />
            Select Files
          </Button>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium mb-4">Uploaded Files ({files.length}/{maxFiles})</h4>
            
            <div className="space-y-3">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFileIcon(fileItem.file)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {fileItem.file.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {fileItem.file.type === 'application/pdf' ? 'PDF' : 'Image'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        
                        {/* Progress Bar */}
                        {fileItem.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={fileItem.uploadProgress} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">{fileItem.uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(fileItem.status)}
                      
                      {fileItem.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload(fileItem.id)}
                        >
                          <Upload className="mr-1" size={12} />
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileItem.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {files.some(f => f.status === 'uploaded') && (
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Files uploaded successfully to Cloudflare R2 storage.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {files.some(f => f.status === 'failed') && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              Some files failed to upload. Please try again or check your connection.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}