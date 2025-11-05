
import { useState } from 'react';
import { toast } from 'sonner';
import { SavedConfig } from '../types';

export const useConfigurations = (
  setMinInterval: (v: number) => void,
  setMaxInterval: (v: number) => void,
  setUseRandomInterval: (v: boolean) => void,
  setNumberRotation: (v: boolean) => void,
  setMaxDailyMessages: (v: number) => void,
  setMessageVariation: (v: boolean) => void,
  setTypingDelay: (v: boolean) => void,
  setReadReceipts: (v: boolean) => void,
  setEmojiVariation: (v: boolean) => void,
  setResponseSimulation: (v: boolean) => void,
  setMessageVariationPercentage: (v: number) => void,
  setWarmerMode: (v: boolean) => void,
  setScheduleEnabled: (v: boolean) => void,
  setScheduleTime: (v: string) => void,
  setScheduleDate: (v: string) => void
) => {
  const [saveConfigName, setSaveConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([
    {
      id: '1',
      name: 'Standard Warming Config',
      description: 'Default configuration for number warming',
      createdAt: new Date().toISOString(),
      messageTemplates: [],
      numberRotation: true,
      useRandomInterval: true,
      minInterval: 35,
      maxInterval: 50,
      maxDailyMessages: 50,
      messageVariation: true,
      typingDelay: true,
      readReceipts: true,
      emojiVariation: true,
      responseSimulation: false,
      messageVariationPercentage: 30,
      warmerMode: true,
      scheduleEnabled: false,
      scheduleTime: '',
      scheduleDate: ''
    }
  ]);

  const handleSaveConfig = (
    minInterval: number,
    maxInterval: number,
    useRandomInterval: boolean,
    numberRotation: boolean,
    maxDailyMessages: number,
    messageVariation: boolean,
    typingDelay: boolean,
    readReceipts: boolean,
    emojiVariation: boolean,
    responseSimulation: boolean,
    messageVariationPercentage: number,
    warmerMode: boolean,
    scheduleEnabled: boolean,
    scheduleTime: string,
    scheduleDate: string
  ) => {
    if (!saveConfigName.trim()) {
      toast.error('Please enter a name for your configuration');
      return;
    }
    
    const newConfig: SavedConfig = {
      id: Date.now().toString(),
      name: saveConfigName,
      createdAt: new Date().toISOString(),
      messageTemplates: [],
      minInterval,
      maxInterval,
      useRandomInterval,
      numberRotation,
      maxDailyMessages,
      messageVariation,
      typingDelay,
      readReceipts,
      emojiVariation,
      responseSimulation,
      messageVariationPercentage,
      warmerMode,
      scheduleEnabled,
      scheduleTime,
      scheduleDate
    };
    
    setSavedConfigs([...savedConfigs, newConfig]);
    toast.success(`Configuration "${saveConfigName}" saved successfully`);
    setSaveConfigName('');
  };
  
  const handleLoadConfig = (configId: string) => {
    const config = savedConfigs.find(c => c.id === configId);
    if (!config) return;
    
    setMinInterval(config.minInterval || 0);
    setMaxInterval(config.maxInterval || 0);
    setUseRandomInterval(config.useRandomInterval || false);
    setNumberRotation(config.numberRotation || false);
    setMaxDailyMessages(config.maxDailyMessages || 0);
    setMessageVariation(config.messageVariation || false);
    setTypingDelay(config.typingDelay || false);
    setReadReceipts(config.readReceipts || false);
    setEmojiVariation(config.emojiVariation || false);
    setResponseSimulation(config.responseSimulation || false);
    setMessageVariationPercentage(config.messageVariationPercentage || 0);
    setWarmerMode(config.warmerMode || false);
    setScheduleEnabled(config.scheduleEnabled || false);
    setScheduleTime(config.scheduleTime || '');
    setScheduleDate(config.scheduleDate || '');
    
    toast.success(`Configuration "${config.name}" loaded successfully`);
  };

  return {
    saveConfigName,
    setSaveConfigName,
    savedConfigs,
    setSavedConfigs,
    handleSaveConfig,
    handleLoadConfig
  };
};
