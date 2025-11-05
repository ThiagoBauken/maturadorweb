
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/common/file-upload';
import { ImageIcon, VideoIcon, XIcon, UploadIcon, AlertCircle } from 'lucide-react';
import { useBulkSender } from '../hooks/useBulkSender';
import { toast } from 'sonner';

export function MediaAttachment() {
  const { 
    mediaUrl,
    mediaType,
    mediaOnly,
    setMediaUrl,
    setMediaType,
    setMediaOnly,
    messageText,
    messageTemplates
  } = useBulkSender();
  
  const [activeTab, setActiveTab] = useState<string>(mediaType && mediaType !== 'none' ? mediaType : 'image');
  
  // Check if there's message content
  const hasMessageContent = messageTemplates.some(msg => msg.trim().length > 0);
  
  const handleMediaUpload = (file: File) => {
    const fileType = file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' : 'none';
                    
    if (fileType === 'none') {
      toast.error('Unsupported file type. Please upload an image or video.');
      return;
    }
    
    // In a real app, you would upload this file to your server
    // For now, let's create a local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setMediaUrl(objectUrl);
    setMediaType(fileType as 'image' | 'video');
    
    toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`);
  };
  
  const handleRemoveMedia = () => {
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl); // Clean up the object URL
    }
    setMediaUrl('');
    setMediaType('none');
    setMediaOnly(false);
    toast.success('Media removed');
  };
  
  const toggleMediaOnly = (value: boolean) => {
    if (value && !mediaUrl) {
      toast.error('Please upload media first');
      return;
    }
    
    // If enabling media-only but there's no media content, show a warning
    if (value && !hasMessageContent && !mediaUrl) {
      toast.warning('Your message has no content. Please add text or upload media.');
      return;
    }
    
    setMediaOnly(value);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Attachment</CardTitle>
        <CardDescription>
          Add an image or video to your message
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="image" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="pt-4">
            <FileUpload
              acceptedTypes={['jpg', 'jpeg', 'png', 'gif']}
              maxSizeInMB={5}
              onFileSelect={handleMediaUpload}
              buttonText="Upload Image"
              dragInactiveText="or drag and drop image here"
            />
          </TabsContent>
          
          <TabsContent value="video" className="pt-4">
            <FileUpload
              acceptedTypes={['mp4', 'mov', 'avi']}
              maxSizeInMB={10}
              onFileSelect={handleMediaUpload}
              buttonText="Upload Video"
              dragInactiveText="or drag and drop video here"
            />
          </TabsContent>
        </Tabs>
        
        {!mediaUrl && !hasMessageContent && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Your message has no content. Please add text or upload media to continue.</p>
          </div>
        )}
        
        {mediaUrl && (
          <div className="border rounded-md p-4 space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Media Preview</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRemoveMedia}
                className="h-8 w-8 p-0 text-muted-foreground"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {mediaType === 'image' && (
              <div className="border rounded-md overflow-hidden bg-muted">
                <img src={mediaUrl} alt="Preview" className="w-full h-auto object-contain max-h-[200px]" />
              </div>
            )}
            
            {mediaType === 'video' && (
              <div className="border rounded-md overflow-hidden bg-muted">
                <video src={mediaUrl} controls className="w-full h-auto max-h-[200px]" />
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="media-only" className="text-sm">Send without text</Label>
                <p className="text-xs text-muted-foreground">Only send the media without any message text</p>
              </div>
              <Switch 
                id="media-only" 
                checked={mediaOnly} 
                onCheckedChange={toggleMediaOnly}
                disabled={!mediaUrl}
              />
            </div>
            
            {mediaOnly && messageText && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-700">
                Your message text will not be sent when "Send without text" is enabled.
              </div>
            )}
          </div>
        )}
        
        {!mediaUrl && (
          <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center text-muted-foreground">
            <UploadIcon className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">No media selected</p>
            <p className="text-xs">Upload an image or video to attach to your message</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
