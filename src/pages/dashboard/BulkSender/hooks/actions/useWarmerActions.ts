
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { WarmerType } from '@/components/warmers';

interface WarmerActionsProps {
  selectedContacts: string[];
  messageTemplatesHook: any;
  sendingOptionsHook: any;
  navigate: NavigateFunction;
}

export function useWarmerActions({
  selectedContacts,
  messageTemplatesHook,
  sendingOptionsHook,
  navigate
}: WarmerActionsProps) {
  
  const createStandardWarmer = () => {
    if (selectedContacts.length === 0) {
      toast.error('Selecione pelo menos um contato para criar um warmer padrão');
      return;
    }
    
    // Configurações padrão para o Standard Warmer
    const standardSettings = {
      type: 'standard-warmer' as WarmerType,
      subType: 'number-to-number',
      name: 'Standard Warmer',
      selectedContacts,
      messageTemplates: ['Olá! Como vai?', 'Oi, tudo bem?', 'Hey, como tem passado?'],
      minDelay: 30,
      maxDelay: 90,
      useRandomDelay: true,
      enableEmojis: true,
      enableTypingIndicator: true,
      enableReadReceipts: true,
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      startTime: '09:00',
      endTime: '18:00',
      warmerDuration: 7,
      // Delay settings
      randomTimeVariation: 20,
      delayPattern: 'random',
      progressiveWarmingEnabled: true,
      dailyLimits: true,
      maxDailyMessages: 5,
      // Rest interval settings
      restIntervalEnabled: true,
      minRestDuration: 5,
      maxRestDuration: 35,
      restFrequencyType: 'message-count',
      messageCountBeforeRest: 15,
      timePeriodBeforeRest: 60,
      // Schedule
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeRanges: [{ start: '09:00', end: '18:00' }]
      }
    };
    
    localStorage.setItem('warmer_settings', JSON.stringify(standardSettings));
    
    navigate('/warmers/standard?from=bulk-sender&type=standard-warmer&subType=number-to-number&name=Standard Warmer');
    toast.success('Warmer padrão criado com sucesso!');
  };
  
  const createWarmer = (subType: 'number-to-number' | 'number-to-group' = 'number-to-number') => {
    if (selectedContacts.length === 0) {
      toast.error('Selecione pelo menos um contato para criar um warmer');
      return;
    }

    const warmerName = subType === 'number-to-group' ? 'Group Warmer' : 'Advanced Warmer';
    
    const warmerSettings = {
      type: 'advanced-warmer' as WarmerType,
      subType,
      name: warmerName,
      selectedContacts,
      messageTemplates: messageTemplatesHook.messageTemplates,
      minDelay: sendingOptionsHook.minInterval,
      maxDelay: sendingOptionsHook.maxInterval,
      useRandomDelay: sendingOptionsHook.useRandomInterval,
      numberRotation: sendingOptionsHook.numberRotation,
      maxDailyMessages: sendingOptionsHook.maxDailyMessages,
      messageVariation: messageTemplatesHook.messageVariation,
      typingDelay: messageTemplatesHook.typingDelay,
      readReceipts: messageTemplatesHook.readReceipts,
      emojiVariation: messageTemplatesHook.emojiVariation,
      // Delay settings
      randomTimeVariation: 20,
      delayPattern: 'random',
      progressiveWarmingEnabled: true,
      dailyLimits: true,
      // Rest interval settings
      restIntervalEnabled: true,
      minRestDuration: 5,
      maxRestDuration: 35,
      restFrequencyType: 'message-count',
      messageCountBeforeRest: 15,
      timePeriodBeforeRest: 60,
      // Schedule
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeRanges: [{ start: '09:00', end: '18:00' }]
      }
    };
    
    localStorage.setItem('warmer_settings', JSON.stringify(warmerSettings));
    
    navigate(`/warmers/create?from=bulk-sender&type=advanced-warmer&subType=${subType}&name=${warmerName}`);
  };
  
  return {
    createWarmer,
    createStandardWarmer
  };
}
