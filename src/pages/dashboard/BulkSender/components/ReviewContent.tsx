
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBulkSender } from '../hooks/useBulkSender';
import { Send, FileCheck, Users, Clock, Calendar, Image, Video, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStepNavigation } from '../hooks/useStepNavigation';
import { toast } from 'sonner';

export function ReviewContent() {
  const {
    messageTemplates,
    messageVariation,
    selectedContacts,
    minInterval,
    maxInterval,
    useRandomInterval,
    scheduleEnabled,
    scheduleDate,
    scheduleTime,
    handleSendMessage,
    mediaUrl,
    mediaType,
    mediaOnly,
    projectName
  } = useBulkSender();
  
  const { goToStep } = useStepNavigation();

  const hasMessageContent = messageTemplates.some(msg => msg.trim().length > 0);
  const hasMedia = mediaUrl && mediaType !== 'none';
  const hasContent = hasMessageContent || hasMedia;

  const MediaIcon = mediaType === 'image' ? Image : Video;

  const handleSend = () => {
    if (!hasContent) {
      toast.error('Please add text or media content before sending');
      goToStep('message');
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient');
      goToStep('recipients');
      return;
    }
    
    handleSendMessage();
  };

  const handleAddContent = () => {
    goToStep('message');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review and Send</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {projectName && (
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertDescription className="flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Project name: <span className="font-semibold">{projectName}</span>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Message Content</h3>
              <div className="p-4 border rounded-md bg-muted/50">
                {hasMessageContent ? (
                  <div>
                    <p className="font-medium">Main message:</p>
                    <p className="whitespace-pre-wrap mb-4">{messageTemplates[0]}</p>
                    
                    {messageVariation && messageTemplates.length > 1 && (
                      <div>
                        <p className="font-medium">Variations: {messageTemplates.length - 1}</p>
                        <p className="text-muted-foreground text-sm">Message variations will be used randomly</p>
                      </div>
                    )}
                  </div>
                ) : hasMedia && mediaOnly ? (
                  <div className="flex items-center gap-2">
                    <MediaIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Media only message</p>
                      <p className="text-muted-foreground">{mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} will be sent without text</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-amber-600 p-3 rounded-md bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-medium">No message content</p>
                    </div>
                    <p className="text-sm mb-3">Please add text or media content before sending</p>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={handleAddContent}
                      className="text-white bg-amber-600 hover:bg-amber-700 mb-2"
                    >
                      Add Content
                    </Button>
                  </div>
                )}
                
                {hasMedia && !mediaOnly && (
                  <div className="mt-4 flex items-center gap-2">
                    <MediaIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Media attachment:</p>
                      <p className="text-muted-foreground">{mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} will be sent with text</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Recipients</h3>
              <div className="p-4 border rounded-md bg-muted/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {selectedContacts.length > 0 ? (
                      <p className="font-medium">{selectedContacts.length} recipients</p>
                    ) : (
                      <p className="text-amber-600 font-medium">No recipients selected</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => goToStep('recipients')}
                  >
                    {selectedContacts.length === 0 ? 'Add Recipients' : 'Edit'}
                  </Button>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6 mb-2">Timing</h3>
              <div className="p-4 border rounded-md bg-muted/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <p className="font-medium">
                      {useRandomInterval 
                        ? `Random interval: ${minInterval}-${maxInterval} seconds` 
                        : `Fixed interval: ${minInterval} seconds`}
                    </p>
                  </div>
                  
                  {scheduleEnabled ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p className="font-medium">
                        Scheduled for: {scheduleDate} at {scheduleTime}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p className="font-medium">
                        Sending will start immediately
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button 
              onClick={handleSend} 
              className="gap-2"
              size="lg"
              disabled={!hasContent || selectedContacts.length === 0}
            >
              <Send className="h-4 w-4" />
              {scheduleEnabled ? 'Schedule Messages' : 'Send Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
