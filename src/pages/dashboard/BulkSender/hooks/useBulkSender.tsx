
import { useContext } from 'react';
import { BulkSenderContext } from './context/BulkSenderContext';
import { BulkSenderProvider } from './context/BulkSenderProvider';
import { BulkSenderContextType } from './types';
import { useMessagingContext } from '../providers/MessagingProvider';
import { useSendingOptionsContext } from '../providers/SendingOptionsProvider';
import { useSendingHistoryContext } from '../providers/SendingHistoryProvider';
import { useConfigurationContext } from '../providers/ConfigurationProvider';
import { useDraftsContext } from '../providers/DraftsProvider';
import { useActionsContext } from '../providers/ActionsProvider';
import { useRealTimeMessagingContext } from '../providers/RealTimeMessagingProvider';

export const useBulkSender = () => {
  // Get the base context
  const baseContext = useContext(BulkSenderContext);
  
  if (!baseContext) {
    throw new Error('useBulkSender must be used within a BulkSenderProvider');
  }
  
  // Get contexts from individual providers (will throw errors if used outside providers)
  try {
    const messagingContext = useMessagingContext();
    const sendingOptionsContext = useSendingOptionsContext();
    const sendingHistoryContext = useSendingHistoryContext();
    const configurationContext = useConfigurationContext();
    const draftsContext = useDraftsContext();
    const actionsContext = useActionsContext();
    const realTimeMessagingContext = useRealTimeMessagingContext();
    
    // Combine all contexts - cast to any first, then to BulkSenderContextType
    const combinedContext = {
      ...baseContext,
      ...messagingContext,
      ...sendingOptionsContext,
      ...sendingHistoryContext,
      ...configurationContext,
      ...draftsContext,
      ...actionsContext,
      messageActivities: realTimeMessagingContext.messageActivities,
      isMonitoring: realTimeMessagingContext.isMonitoring,
      startMonitoring: realTimeMessagingContext.startMonitoring,
      stopMonitoring: realTimeMessagingContext.stopMonitoring,
      clearSessionActivity: realTimeMessagingContext.clearSessionActivity,
      clearAllActivities: realTimeMessagingContext.clearAllActivities,
      setPollingFrequency: realTimeMessagingContext.setPollingFrequency
    };
    
    // Force type with 'as' for safety
    return combinedContext as unknown as BulkSenderContextType;
  } catch (error) {
    // If any of the context providers are not available, just return the base context
    console.warn('Some BulkSender context providers are not available:', error);
    return baseContext;
  }
};

// Re-export the BulkSenderProvider for convenience
export { BulkSenderProvider };
