
import { MessageSection } from './MessageSection';
import { RecipientsSection } from './RecipientsSection';
import { SendingOptions } from './SendingOptions';
import { ReviewContent } from './ReviewContent';
import { SendingHistory } from './SendingHistory';
import { LiveSending } from './LiveSending';
import { useBulkSender } from '../hooks/useBulkSender';

interface StepContentProps {
  step?: string;
  currentStep?: string; // Support both formats
}

export function StepContent({ step, currentStep }: StepContentProps) {
  const { currentSendingId } = useBulkSender();
  
  // Use currentStep if provided, otherwise use step
  const activeStep = currentStep || step || 'message';
  
  switch (activeStep) {
    case 'message':
      return <MessageSection />;
    case 'recipients':
      return <RecipientsSection />;
    case 'options':
      return <SendingOptions />;
    case 'send':
      return <ReviewContent />;
    case 'history':
      return <SendingHistory />;
    case 'live':
      return <LiveSending currentSendingId={currentSendingId || ''} />;
    default:
      return <MessageSection />;
  }
}
