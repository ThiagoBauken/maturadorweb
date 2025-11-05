
import { toast } from 'sonner';

interface SendingControlsProps {
  sendingHistoryHook: any;
  sendingProcessHook: any;
  sendingOptionsHook: any;
  navigate: (path: string) => void;
}

export function useSendingControls({
  sendingHistoryHook,
  sendingProcessHook,
  sendingOptionsHook,
  navigate
}: SendingControlsProps) {
  
  const handlePauseSending = () => {
    sendingHistoryHook.setSendingPaused(true);
    toast.info('Sending has been paused. You can resume it later.');
  };
  
  const handleResumeSending = () => {
    if (!sendingHistoryHook.currentSendingId) return;
    
    sendingHistoryHook.setSendingPaused(false);
    sendingHistoryHook.updateSendingHistory(sendingHistoryHook.currentSendingId, { status: 'in-progress' });
    sendingProcessHook.startSendingMessages(sendingHistoryHook.currentSendingId, sendingOptionsHook.maxDailyMessages);
    toast.info('Sending has been resumed.');
  };
  
  const handleCancelSending = () => {
    if (!sendingHistoryHook.currentSendingId) return;
    
    const confirmation = window.confirm('Are you sure you want to cancel the current sending operation? This cannot be undone.');
    if (!confirmation) return;
    
    sendingHistoryHook.updateSendingHistory(sendingHistoryHook.currentSendingId, { 
      status: 'failed',
      endTime: new Date().toISOString()
    });
    
    sendingHistoryHook.setSendingInProgress(false);
    sendingHistoryHook.setSendingPaused(false);
    sendingHistoryHook.setCurrentSendingId(null);
    toast.error('Sending operation has been cancelled.');
  };
  
  return {
    handlePauseSending,
    handleResumeSending,
    handleCancelSending
  };
}
