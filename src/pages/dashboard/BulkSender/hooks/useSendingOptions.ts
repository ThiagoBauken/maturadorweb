
import { useState } from 'react';

export const useSendingOptions = () => {
  const [minInterval, setMinInterval] = useState(30);
  const [maxInterval, setMaxInterval] = useState(130);
  const [useRandomInterval, setUseRandomInterval] = useState(true);
  const [numberRotation, setNumberRotation] = useState(true);
  const [rotationMode, setRotationMode] = useState<'switch' | 'all-together' | 'sequential'>('switch');
  const [sendAllTogether, setSendAllTogether] = useState(false);
  const [maxDailyMessages, setMaxDailyMessages] = useState(40);
  const [warmerMode, setWarmerMode] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('19:00');
  const [scheduleDate, setScheduleDate] = useState('2025-03-31');
  const [activeSessions, setActiveSessions] = useState<string[]>([]);
  const [timezone, setTimezone] = useState('America/Sao_Paulo');

  return {
    minInterval,
    setMinInterval,
    maxInterval,
    setMaxInterval,
    useRandomInterval,
    setUseRandomInterval,
    numberRotation,
    setNumberRotation,
    rotationMode,
    setRotationMode,
    sendAllTogether,
    setSendAllTogether,
    maxDailyMessages,
    setMaxDailyMessages,
    warmerMode,
    setWarmerMode,
    scheduleEnabled,
    setScheduleEnabled,
    scheduleTime,
    setScheduleTime,
    scheduleDate,
    setScheduleDate,
    activeSessions,
    setActiveSessions,
    timezone,
    setTimezone
  };
};
