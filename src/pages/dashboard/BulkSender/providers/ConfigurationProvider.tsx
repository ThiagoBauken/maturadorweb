
import { ReactNode, createContext, useContext } from 'react';
import { useConfigurations } from '../hooks/useConfigurations';
import { SavedConfig } from '../types';

interface ConfigurationContextType {
  saveConfigName: string;
  setSaveConfigName: (name: string) => void;
  savedConfigs: SavedConfig[];
  setSavedConfigs: (configs: any[]) => void;
  handleSaveConfig: (
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
  ) => void;
  handleLoadConfig: (configId: string) => void;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

export function ConfigurationProvider({ 
  children, 
  setMinInterval,
  setMaxInterval,
  setUseRandomInterval,
  setNumberRotation,
  setMaxDailyMessages,
  setMessageVariation,
  setTypingDelay,
  setReadReceipts,
  setEmojiVariation,
  setResponseSimulation,
  setMessageVariationPercentage,
  setWarmerMode,
  setScheduleEnabled,
  setScheduleTime,
  setScheduleDate
}: { 
  children: ReactNode;
  setMinInterval: (v: number) => void;
  setMaxInterval: (v: number) => void;
  setUseRandomInterval: (v: boolean) => void;
  setNumberRotation: (v: boolean) => void;
  setMaxDailyMessages: (v: number) => void;
  setMessageVariation: (v: boolean) => void;
  setTypingDelay: (v: boolean) => void;
  setReadReceipts: (v: boolean) => void;
  setEmojiVariation: (v: boolean) => void;
  setResponseSimulation: (v: boolean) => void;
  setMessageVariationPercentage: (v: number) => void;
  setWarmerMode: (v: boolean) => void;
  setScheduleEnabled: (v: boolean) => void;
  setScheduleTime: (v: string) => void;
  setScheduleDate: (v: string) => void;
}) {
  const configurationsHook = useConfigurations(
    setMinInterval,
    setMaxInterval,
    setUseRandomInterval,
    setNumberRotation,
    setMaxDailyMessages,
    setMessageVariation,
    setTypingDelay,
    setReadReceipts,
    setEmojiVariation,
    setResponseSimulation,
    setMessageVariationPercentage,
    setWarmerMode,
    setScheduleEnabled,
    setScheduleTime,
    setScheduleDate
  );
  
  return (
    <ConfigurationContext.Provider value={configurationsHook}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfigurationContext() {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error('useConfigurationContext must be used within a ConfigurationProvider');
  }
  return context;
}
