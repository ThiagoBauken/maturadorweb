
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, FilePlus, Save, Send } from 'lucide-react';
import { useBulkSender } from '../hooks/useBulkSender';

type Step = 'message' | 'recipients' | 'options' | 'send' | 'history' | 'live';

interface HeaderActionsProps {
  currentStep: Step;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isNewProjectDialogOpen: boolean;
  setIsNewProjectDialogOpen: (open: boolean) => void;
  canProceed: () => boolean;
}

export function HeaderActions({
  currentStep,
  goToNextStep,
  goToPreviousStep,
  isNewProjectDialogOpen,
  setIsNewProjectDialogOpen,
  canProceed
}: HeaderActionsProps) {
  const {
    selectedContacts,
    scheduleEnabled,
    warmerMode,
    sendingInProgress,
    sendingPaused,
    handleSendMessage,
    handlePauseSending,
    handleResumeSending,
    handleCancelSending,
    handleSaveConfig,
    createWarmer,
    messageTemplates,
    mediaUrl,
    mediaType,
    mediaOnly
  } = useBulkSender();

  const isFirstStep = currentStep === 'message';
  const isLastStep = currentStep === 'send';
  const isHistoryStep = currentStep === 'history';
  const isLiveStep = currentStep === 'live';

  // Check if we have message content or only media
  const hasMessageContent = messageTemplates.some(msg => msg.trim().length > 0);
  const hasMedia = mediaUrl && mediaType !== 'none';
  const hasContent = hasMessageContent || hasMedia;

  if (isHistoryStep) {
    return (
      <div className="flex gap-2 z-[110] relative">
        <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(true)}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>
    );
  }

  if (isLiveStep) {
    return (
      <div className="flex gap-2 z-[110] relative">
        {sendingPaused ? (
          <Button onClick={handleResumeSending} variant="default">
            <CheckCircle className="mr-2 h-4 w-4" />
            Resume Sending
          </Button>
        ) : (
          <Button onClick={handlePauseSending} variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Pause Sending
          </Button>
        )}
        
        <Button onClick={handleCancelSending} variant="destructive">
          Cancel
        </Button>
      </div>
    );
  }

  if (sendingInProgress) {
    return (
      <div className="flex gap-2 z-[110] relative">
        <Button onClick={() => {}} variant="outline">
          View Live Status
        </Button>
        
        {sendingPaused ? (
          <Button onClick={handleResumeSending} variant="default">
            <CheckCircle className="mr-2 h-4 w-4" />
            Resume Sending
          </Button>
        ) : (
          <Button onClick={handlePauseSending} variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Pause Sending
          </Button>
        )}
        
        <Button onClick={handleCancelSending} variant="destructive">
          Cancel
        </Button>
      </div>
    );
  }

  const handleSendClick = () => {
    // Let the send go through even if only media content is available
    if (selectedContacts.length === 0) {
      // Only validate recipients, not message content
      return;
    }
    
    handleSendMessage();
  };

  return (
    <div className="flex gap-2 z-[110] relative">
      {!isFirstStep && (
        <Button variant="outline" onClick={goToPreviousStep}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}
      
      {isLastStep ? (
        <>
          <Button 
            onClick={handleSendClick} 
            disabled={selectedContacts.length === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            {scheduleEnabled ? 'Schedule Messages' : 'Send Messages'}
          </Button>
          
          <Button variant="outline" onClick={handleSaveConfig}>
            <Save className="mr-2 h-4 w-4" />
            Save Config
          </Button>
        </>
      ) : (
        <>
          <Button 
            onClick={goToNextStep} 
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {isFirstStep && (
            <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(true)}>
              <FilePlus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          )}
        </>
      )}
    </div>
  );
};
