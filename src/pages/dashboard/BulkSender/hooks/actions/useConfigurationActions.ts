
import { toast } from 'sonner';

interface ConfigurationActionsProps {
  configurationsHook: any;
  sendingOptionsHook: any;
  messageTemplatesHook: any;
}

export function useConfigurationActions({
  configurationsHook,
  sendingOptionsHook,
  messageTemplatesHook
}: ConfigurationActionsProps) {
  
  const handleSaveConfig = () => {
    if (typeof configurationsHook?.handleSaveConfig !== 'function') {
      toast.error("Configuration save functionality is not available");
      console.error("configurationsHook.handleSaveConfig is not a function", configurationsHook);
      return;
    }
    
    configurationsHook.handleSaveConfig(
      sendingOptionsHook.minInterval,
      sendingOptionsHook.maxInterval,
      sendingOptionsHook.useRandomInterval,
      sendingOptionsHook.numberRotation,
      sendingOptionsHook.maxDailyMessages,
      messageTemplatesHook.messageVariation,
      messageTemplatesHook.typingDelay,
      messageTemplatesHook.readReceipts,
      messageTemplatesHook.emojiVariation,
      messageTemplatesHook.responseSimulation,
      messageTemplatesHook.messageVariationPercentage,
      sendingOptionsHook.warmerMode,
      sendingOptionsHook.scheduleEnabled,
      sendingOptionsHook.scheduleTime,
      sendingOptionsHook.scheduleDate
    );
  };
  
  return {
    handleSaveConfig
  };
}
