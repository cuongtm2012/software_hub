import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  FileText
} from "lucide-react";

interface UploadedFile {
  fileKey: string;
  originalName: string;
  downloadUrl: string;
}

interface DocumentUploadState {
  isUploading: boolean;
  fileName: string | null;
  uploaded: boolean;
  error: string | null;
}

interface VerificationDocumentUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  className?: string;
}

const REQUIRED_DOCUMENTS = [
  {
    id: 'national_id_front',
    title: 'Front side of your National ID card',
    description: 'Clear photo of the front side'
  },
  {
    id: 'national_id_back', 
    title: 'Back side of your National ID card',
    description: 'Clear photo of the back side'
  },
  {
    id: 'bank_account_details',
    title: 'Screenshot/photo of your bank account details',
    description: 'Bank statement or account details'
  }
];

export function VerificationDocumentUploader({ 
  onFilesUploaded, 
  className = "" 
}: VerificationDocumentUploaderProps) {
  const [documentStates, setDocumentStates] = useState<Record<string, DocumentUploadState>>({
    national_id_front: { isUploading: false, fileName: null, uploaded: false, error: null },
    national_id_back: { isUploading: false, fileName: null, uploaded: false, error: null },
    bank_account_details: { isUploading: false, fileName: null, uploaded: false, error: null }
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, documentId }: { file: File; documentId: string }) => {
      // Set uploading state
      setDocumentStates(prev => ({
        ...prev,
        [documentId]: { ...prev[documentId], isUploading: true, error: null }
      }));

      try {
        // Get upload URL from server
        const response = await fetch("/api/r2/upload-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
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

        // Upload file directly to R2
        const uploadToR2 = await fetch(uploadResponse.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
          mode: 'cors',
        });

        if (!uploadToR2.ok) {
          const errorText = await uploadToR2.text();
          throw new Error(`Upload failed: ${uploadToR2.status} ${uploadToR2.statusText}`);
        }

        // Get download URL
        const downloadResp = await fetch("/api/r2/download-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fileKey: uploadResponse.fileKey
          }),
        });

        if (!downloadResp.ok) {
          const errorData = await downloadResp.json();
          throw new Error(errorData.error || `HTTP ${downloadResp.status}: ${downloadResp.statusText}`);
        }

        const downloadResponse = await downloadResp.json() as { downloadUrl: string };

        const uploadedFile: UploadedFile = {
          fileKey: uploadResponse.fileKey,
          originalName: file.name,
          downloadUrl: downloadResponse.downloadUrl
        };

        // Update state
        setDocumentStates(prev => ({
          ...prev,
          [documentId]: { 
            isUploading: false, 
            fileName: file.name, 
            uploaded: true, 
            error: null 
          }
        }));

        setUploadedFiles(prev => [...prev, uploadedFile]);

        return uploadedFile;

      } catch (error) {
        setDocumentStates(prev => ({
          ...prev,
          [documentId]: { 
            ...prev[documentId], 
            isUploading: false, 
            error: error instanceof Error ? error.message : 'Upload failed'
          }
        }));
        throw error;
      }
    },
    onSuccess: (result) => {
      toast({
        title: "Upload Complete",
        description: `${result.originalName} uploaded successfully`,
      });
      
      onFilesUploaded(uploadedFiles.concat([result]));
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createUploadHandler = (documentId: string) => {
    return useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid File Type",
            description: "Please upload PDF, JPG, or PNG files only.",
            variant: "destructive",
          });
          return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: "File Too Large",
            description: "File size must be less than 10MB.",
            variant: "destructive",
          });
          return;
        }

        uploadMutation.mutate({ file, documentId });
      }
    }, [documentId]);
  };

  return (
    <Card className={`${className} bg-white border border-gray-200 shadow-sm`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Verification Documents</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Storage Ready</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Upload the following 3 documents for verification (Allowed formats: PDF, JPG, PNG · Max size: 10MB each):
        </p>

        <div className="space-y-4">
          {REQUIRED_DOCUMENTS.map((doc) => {
            const state = documentStates[doc.id];
            
            const { getRootProps, getInputProps } = useDropzone({
              onDrop: createUploadHandler(doc.id),
              accept: {
                'image/jpeg': [],
                'image/jpg': [],
                'image/png': [],
                'application/pdf': []
              },
              maxFiles: 1,
              disabled: state.isUploading || state.uploaded
            });

            return (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-800">{doc.title}</h4>
                  <p className="text-xs text-gray-500">{doc.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div {...getRootProps()} className="flex-1 mr-4">
                    <input {...getInputProps()} />
                    <Button 
                      type="button"
                      disabled={state.isUploading || state.uploaded}
                      variant={state.uploaded ? "outline" : "default"}
                      className={`${state.uploaded ? 'border-green-500 text-green-700' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    >
                      <Upload className="mr-2" size={14} />
                      {state.isUploading ? 'Uploading...' : state.uploaded ? 'Uploaded' : 'Upload'}
                    </Button>
                  </div>
                  
                  <div className="flex-1 flex items-center">
                    {state.uploaded && state.fileName && (
                      <div className="flex items-center space-x-2">
                        <FileText className="text-green-600" size={16} />
                        <span className="text-sm text-green-800 font-medium truncate">
                          {state.fileName}
                        </span>
                        <CheckCircle className="text-green-600" size={16} />
                      </div>
                    )}
                    
                    {state.error && (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="text-red-600" size={16} />
                        <span className="text-sm text-red-600">Upload failed</span>
                      </div>
                    )}
                  </div>
                </div>

                {state.error && (
                  <Alert className="mt-2 border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700 text-sm">
                      {state.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Upload Progress
            </span>
            <span className="text-sm text-gray-600">
              {Object.values(documentStates).filter(s => s.uploaded).length} / 3 completed
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.values(documentStates).filter(s => s.uploaded).length / 3) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}