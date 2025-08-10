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
          // Upload with explicit Content-Type header as required by AWS SDK
          const uploadToR2 = await fetch(uploadResponse.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
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
    <Card className={`${className} bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <CloudUpload className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Document Upload</h3>
              <p className="text-sm text-gray-500">Secure cloud storage with Cloudflare R2</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Storage Ready</span>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${
            isDragActive 
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02] shadow-lg' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50/50 hover:shadow-md'
          }`}
        >
          <input {...getInputProps()} />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600"></div>
          
          <div className="relative z-10">
            <div className={`mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragActive 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg scale-110' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100'
            }`}>
              <CloudUpload className={`transition-colors duration-300 ${
                isDragActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
              }`} size={32} />
            </div>
            
            <h4 className="text-2xl font-bold text-gray-800 mb-3">
              {isDragActive ? 'Drop your files here' : 'Upload Documents'}
            </h4>
            <p className="text-gray-600 mb-6 text-lg">
              {isDragActive ? 'Release to upload...' : 'Drag & drop files here, or click to browse'}
            </p>
            
            {/* File Type Indicators */}
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/70 border border-blue-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileImage className="text-blue-600" size={20} />
                </div>
                <span className="text-sm font-medium text-gray-700">Images</span>
                <span className="text-xs text-gray-500">JPG, PNG</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-white/70 border border-red-100 shadow-sm">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-red-600" size={20} />
                </div>
                <span className="text-sm font-medium text-gray-700">Documents</span>
                <span className="text-xs text-gray-500">PDF</span>
              </div>
            </div>
            
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <FolderOpen className="mr-3" size={18} />
              Choose Files
            </Button>
            
            <p className="text-xs text-gray-500 mt-6 leading-relaxed">
              Supported formats: {acceptedTypes.map(type => {
                if (type.includes('pdf')) return 'PDF';
                if (type.includes('jpeg') || type.includes('jpg')) return 'JPG';
                if (type.includes('png')) return 'PNG';
                return type.split('/')[1].toUpperCase();
              }).join(', ')} • Maximum size: {maxSizeInMB}MB per file • Up to {maxFiles} files
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-gray-800">Uploaded Files</h4>
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{files.length}</span>
                <span className="text-gray-400">/</span>
                <span className="text-sm text-gray-500">{maxFiles}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="bg-white/70 border border-gray-200/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        {getFileIcon(fileItem.file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="font-semibold text-gray-800 truncate">
                            {fileItem.file.name}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs font-medium ${
                              fileItem.file.type === 'application/pdf' 
                                ? 'border-red-200 text-red-700 bg-red-50' 
                                : 'border-blue-200 text-blue-700 bg-blue-50'
                            }`}
                          >
                            {fileItem.file.type === 'application/pdf' ? 'PDF' : 'Image'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        
                        {/* Progress Bar */}
                        {fileItem.status === 'uploading' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-blue-600">Uploading...</span>
                              <span className="text-xs text-gray-500">{fileItem.uploadProgress}%</span>
                            </div>
                            <Progress value={fileItem.uploadProgress} className="h-2 bg-gray-200" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {getStatusIcon(fileItem.status)}
                      
                      {fileItem.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryUpload(fileItem.id)}
                          className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          <Upload className="mr-2" size={14} />
                          Retry
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileItem.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
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
          <Alert className="mt-6 border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <AlertDescription className="text-green-800 font-medium">
                Files uploaded successfully to secure cloud storage
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Error Alert */}
        {files.some(f => f.status === 'failed') && (
          <Alert className="mt-6 border-0 bg-gradient-to-r from-red-50 to-rose-50 shadow-lg rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <AlertDescription className="text-red-800 font-medium">
                Some files failed to upload. Please try again or check your connection.
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}