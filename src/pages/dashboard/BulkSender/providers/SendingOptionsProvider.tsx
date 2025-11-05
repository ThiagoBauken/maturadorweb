
import { ReactNode, createContext, useContext } from 'react';
import { useSendingOptions } from '../hooks/useSendingOptions';
import { TimeSlot } from '../types';
import { useState } from 'react';

interface SendingOptionsContextType {
  minInterval: number;
  setMinInterval: (interval: number) => void;
  maxInterval: number;
  setMaxInterval: (interval: number) => void;
  useRandomInterval: boolean;
  setUseRandomInterval: (use: boolean) => void;
  numberRotation: boolean;
  setNumberRotation: (rotation: boolean) => void;
  rotationMode: 'switch' | 'all-together' | 'sequential';
  setRotationMode: (mode: 'switch' | 'all-together' | 'sequential') => void;
  sendAllTogether: boolean;
  setSendAllTogether: (allTogether: boolean) => void;
  maxDailyMessages: number;
  setMaxDailyMessages: (max: number) => void;
  warmerMode: boolean;
  setWarmerMode: (mode: boolean) => void;
  scheduleEnabled: boolean;
  setScheduleEnabled: (enabled: boolean) => void;
  scheduleTime: string;
  setScheduleTime: (time: string) => void;
  scheduleDate: string;
  setScheduleDate: (date: string) => void;
  timeSlots: TimeSlot[];
  setTimeSlots: (slots: TimeSlot[]) => void;
  activeSessions: string[];
  setActiveSessions: (sessions: string[]) => void;
  timezone: string;
  setTimezone: (timezone: string) => void;
}

const SendingOptionsContext = createContext<SendingOptionsContextType | undefined>(undefined);

export function SendingOptionsProvider({ children }: { children: ReactNode }) {
  const sendingOptionsHook = useSendingOptions();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const value: SendingOptionsContextType = {
    ...sendingOptionsHook,
    timeSlots,
    setTimeSlots,
  };
  
  return (
    <SendingOptionsContext.Provider value={value}>
      {children}
    </SendingOptionsContext.Provider>
  );
}

export function useSendingOptionsContext() {
  const context = useContext(SendingOptionsContext);
  if (context === undefined) {
    throw new Error('useSendingOptionsContext must be used within a SendingOptionsProvider');
  }
  return context;
}
