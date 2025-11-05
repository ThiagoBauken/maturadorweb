
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X, Image, FileVideo, FileAudio } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface MediaUploaderProps {
  mediaType: 'image' | 'video' | 'audio' | 'sticker';
  onMediaChange: (file: File | null) => void;
  currentMedia?: string | null;
}

export function MediaUploader({
  mediaType,
  onMediaChange,
  currentMedia = null
}: MediaUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentMedia);
  
  const getAcceptedTypes = () => {
    switch (mediaType) {
      case 'image':
        return { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] };
      case 'video':
        return { 'video/*': ['.mp4', '.mov', '.avi', '.webm'] };
      case 'audio':
        return { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] };
      case 'sticker':
        return { 'image/*': ['.webp', '.png'] };
      default:
        return {};
    }
  };
  
  const getMaxSize = () => {
    switch (mediaType) {
      case 'image': return 5 * 1024 * 1024; // 5MB
      case 'video': return 16 * 1024 * 1024; // 16MB
      case 'audio': return 16 * 1024 * 1024; // 16MB
      case 'sticker': return 500 * 1024; // 500KB
      default: return 5 * 1024 * 1024;
    }
  };
  
  const getMediaIcon = () => {
    switch (mediaType) {
      case 'image': return <Image className="h-8 w-8 text-muted-foreground" />;
      case 'video': return <FileVideo className="h-8 w-8 text-muted-foreground" />;
      case 'audio': return <FileAudio className="h-8 w-8 text-muted-foreground" />;
      case 'sticker': return <Image className="h-8 w-8 text-muted-foreground" />;
      default: return <Upload className="h-8 w-8 text-muted-foreground" />;
    }
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: getAcceptedTypes(),
    maxSize: getMaxSize(),
    maxFiles: 1,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          toast.error(`File is too large. Max size is ${getMaxSize() / (1024 * 1024)}MB.`);
        } else {
          toast.error(error.message);
        }
        return;
      }
      
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onMediaChange(file);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  });
  
  const handleClearMedia = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onMediaChange(null);
  };
  
  const renderPreview = () => {
    if (!previewUrl) return null;
    
    switch (mediaType) {
      case 'image':
      case 'sticker':
        return (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Media preview" 
              className="w-full h-32 object-contain rounded-md bg-muted"
            />
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleClearMedia}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'video':
        return (
          <div className="relative">
            <video 
              src={previewUrl} 
              controls 
              className="w-full h-32 rounded-md bg-muted"
            />
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleClearMedia}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'audio':
        return (
          <div className="relative">
            <audio 
              src={previewUrl} 
              controls 
              className="w-full mt-2"
            />
            <Button 
              variant="destructive" 
              size="sm" 
              className="mt-2"
              onClick={handleClearMedia}
            >
              <X className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>{mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}</Label>
      
      {!previewUrl ? (
        <div 
          {...getRootProps()} 
          className="border-2 border-dashed rounded-md p-4 text-center hover:border-primary/50 cursor-pointer transition-colors"
        >
          <input {...getInputProps()} />
          {getMediaIcon()}
          <p className="text-sm mt-2">
            Drag & drop or click to select {mediaType}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {getMaxSize() / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        renderPreview()
      )}
    </div>
  );
}
