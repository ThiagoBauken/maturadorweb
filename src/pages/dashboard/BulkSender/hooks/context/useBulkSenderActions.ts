
import { NavigateFunction } from 'react-router-dom';
import { useMessageActions } from '../actions/useMessageActions';
import { useSendingControls } from '../actions/useSendingControls';
import { useImportActions } from '../actions/useImportActions';
import { useConfigurationActions } from '../actions/useConfigurationActions';
import { useWarmerActions } from '../actions/useWarmerActions';
import { toast } from 'sonner';

interface ActionHookProps {
  messageTemplatesHook: any;
  sendingOptionsHook: any;
  sendingHistoryHook: any;
  selectedContacts: string[];
  sendingProcessHook: any;
  configurationsHook: any;
  navigate: NavigateFunction;
  projectName?: string;
  recipientListHook?: any;
  setSelectedContacts?: (contacts: string[]) => void; // Make optional
}

export function useBulkSenderActions({
  messageTemplatesHook,
  sendingOptionsHook,
  sendingHistoryHook,
  selectedContacts,
  setSelectedContacts,
  sendingProcessHook,
  configurationsHook,
  navigate,
  projectName = '',
  recipientListHook
}: ActionHookProps) {
  
  // Use the more focused hooks
  const messageActions = useMessageActions({
    messageTemplatesHook,
    sendingOptionsHook,
    sendingHistoryHook,
    selectedContacts,
    sendingProcessHook,
    projectName,
    recipientListHook,
    navigate
  });
  
  const sendingControls = useSendingControls({
    sendingHistoryHook,
    sendingProcessHook,
    sendingOptionsHook,
    navigate
  });
  
  const importActions = useImportActions({
    navigate,
    setSelectedContacts: setSelectedContacts || (() => {})
  });
  
  const configurationActions = useConfigurationActions({
    configurationsHook,
    sendingOptionsHook,
    messageTemplatesHook
  });
  
  const warmerActions = useWarmerActions({
    selectedContacts,
    messageTemplatesHook,
    sendingOptionsHook,
    navigate
  });
  
  // Wrapper for the handleSendMessage function to validate only required fields
  const handleSendMessageWithValidation = () => {
    // Only check if there are recipients selected
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    
    // Proceed with sending - message content is optional
    messageActions.handleSendMessage();
    
    // Navigate to dashboard after sending
    toast.success('Message sent successfully! Redirecting to dashboard...');
    setTimeout(() => {
      navigate('/dashboard?tab=live');
    }, 1500);
  };
  
  // Combine all the actions into a single object
  return {
    handleSendMessage: handleSendMessageWithValidation,
    handlePauseSending: sendingControls.handlePauseSending,
    handleResumeSending: sendingControls.handleResumeSending,
    handleCancelSending: sendingControls.handleCancelSending,
    handleImportFromVerifier: importActions.handleImportFromVerifier,
    handleSaveConfig: configurationActions.handleSaveConfig,
    createWarmer: warmerActions.createWarmer
  };
}
