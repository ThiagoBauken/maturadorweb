
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, X, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type AcceptedFileType = 'csv' | 'xlsx' | 'json' | 'txt' | 'vcf' | 'jpg' | 'jpeg' | 'png' | 'gif' | 'mp4' | 'mov' | 'avi';

export interface FileUploadProps {
  acceptedTypes?: AcceptedFileType[];
  maxSizeInMB?: number;
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  className?: string;
  buttonText?: string;
  dragActiveText?: string;
  dragInactiveText?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  acceptedTypes = ['csv', 'xlsx', 'json'],
  maxSizeInMB = 5,
  onFileSelect,
  onFileClear,
  className = '',
  buttonText = 'Select a file',
  dragActiveText = 'Drop file here',
  dragInactiveText = 'or drag and drop file here',
  disabled = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptString = acceptedTypes.map(type => `.${type}`).join(',');
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeInBytes) {
      setError(`File size exceeds the limit of ${maxSizeInMB}MB`);
      return false;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() as AcceptedFileType;
    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Allowed types: ${acceptedTypes.join(', ')}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
      toast.success(`File '${file.name}' uploaded successfully`);
    } else {
      toast.error(error || 'Invalid file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileClear) {
      onFileClear();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Input
        type="file"
        ref={fileInputRef}
        accept={acceptString}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        data-testid="file-input"
      />
      
      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={!disabled ? handleDrop : undefined}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div className="space-y-1">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                disabled={disabled}
              >
                {buttonText}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isDragging ? dragActiveText : dragInactiveText}
              </p>
              <p className="text-xs text-muted-foreground">
                Max size: {maxSizeInMB}MB. Accepted formats: {acceptedTypes.join(', ')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-secondary/20">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium truncate max-w-[180px] md:max-w-[300px]">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClearFile}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
