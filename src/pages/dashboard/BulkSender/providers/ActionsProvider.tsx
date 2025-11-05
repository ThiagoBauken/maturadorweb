
import { ReactNode, createContext, useContext } from 'react';
import { useBulkSenderActions } from '../hooks/context/useBulkSenderActions';
import { NavigateFunction, useNavigate } from 'react-router-dom';

interface ActionsContextType {
  handleSendMessage: () => void;
  handlePauseSending: () => void;
  handleResumeSending: () => void;
  handleCancelSending: () => void;
  handleImportFromVerifier: () => string[];
  handleSaveConfig: () => void;
  createWarmer: () => void;
}

interface ActionsProviderProps {
  children: ReactNode;
  messageTemplatesHook: any;
  sendingOptionsHook: any;
  sendingHistoryHook: any;
  selectedContacts: string[];
  sendingProcessHook: any;
  configurationsHook: any;
  projectName?: string;
  recipientListHook?: any;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export function ActionsProvider({ 
  children,
  messageTemplatesHook,
  sendingOptionsHook,
  sendingHistoryHook,
  selectedContacts,
  sendingProcessHook,
  configurationsHook,
  projectName,
  recipientListHook
}: ActionsProviderProps) {
  const navigate = useNavigate();
  
  const actions = useBulkSenderActions({
    messageTemplatesHook,
    sendingOptionsHook,
    sendingHistoryHook,
    selectedContacts,
    sendingProcessHook,
    configurationsHook,
    navigate,
    projectName,
    recipientListHook
  });
  
  return (
    <ActionsContext.Provider value={actions}>
      {children}
    </ActionsContext.Provider>
  );
}

export function useActionsContext() {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error('useActionsContext must be used within a ActionsProvider');
  }
  return context;
}
