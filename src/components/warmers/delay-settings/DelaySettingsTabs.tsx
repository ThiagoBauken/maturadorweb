
import React from 'react';
import { BasicDelaySettings } from './BasicDelaySettings';
import { ScheduleConfig } from '@/components/common/schedule';

interface DelaySettingsTabsProps {
  // New props for tab handling
  activeTab?: string;
  onTabChange?: (value: string) => void;
  // Basic tab props
  minDelay: number;
  maxDelay: number;
  useRandomDelay: boolean;
  onMinDelayChange: (value: number) => void;
  onMaxDelayChange: (value: number) => void;
  onUseRandomDelayChange: (value: boolean) => void;
  restIntervalEnabled: boolean;
  onRestIntervalEnabledChange: (value: boolean) => void;
  minRestDuration: number;
  maxRestDuration: number;
  onMinRestDurationChange: (value: number) => void;
  onMaxRestDurationChange: (value: number) => void;
  restFrequencyType: 'message-count' | 'time-period';
  onRestFrequencyTypeChange: (value: 'message-count' | 'time-period') => void;
  messageCountBeforeRest: number;
  onMessageCountBeforeRestChange: (value: number) => void;
  timePeriodBeforeRest: number;
  onTimePeriodBeforeRestChange: (value: number) => void;
  // Advanced tab props
  delayPattern: 'fixed' | 'linear' | 'exponential' | 'random';
  onDelayPatternChange: (value: 'fixed' | 'linear' | 'exponential' | 'random') => void;
  randomTimeVariation: number;
  onRandomTimeVariationChange: (value: number) => void;
  progressiveWarmingEnabled: boolean;
  onProgressiveWarmingChange: (value: boolean) => void;
  dailyLimits: boolean;
  onDailyLimitsChange: (value: boolean) => void;
  maxDailyMessages: number;
  onMaxDailyMessagesChange: (value: number) => void;
  // Schedule tab props
  scheduleConfig: ScheduleConfig;
  onScheduleConfigChange: (config: ScheduleConfig) => void;
}

export function DelaySettingsTabs({
  // Basic props
  minDelay,
  maxDelay,
  useRandomDelay,
  onMinDelayChange,
  onMaxDelayChange,
  onUseRandomDelayChange,
  restIntervalEnabled,
  onRestIntervalEnabledChange,
  minRestDuration,
  maxRestDuration,
  onMinRestDurationChange,
  onMaxRestDurationChange,
  restFrequencyType,
  onRestFrequencyTypeChange,
  messageCountBeforeRest,
  onMessageCountBeforeRestChange,
  timePeriodBeforeRest,
  onTimePeriodBeforeRestChange,
  // We keep these props but won't expose them in the UI
  delayPattern,
  onDelayPatternChange,
  randomTimeVariation,
  onRandomTimeVariationChange,
  progressiveWarmingEnabled,
  onProgressiveWarmingChange,
  dailyLimits,
  onDailyLimitsChange,
  maxDailyMessages,
  onMaxDailyMessagesChange,
  scheduleConfig,
  onScheduleConfigChange,
  // Tab handling props with defaults
  activeTab,
  onTabChange
}: DelaySettingsTabsProps) {
  return (
    <div className="w-full">
      <BasicDelaySettings
        minDelay={minDelay}
        maxDelay={maxDelay}
        useRandomDelay={useRandomDelay}
        onMinDelayChange={onMinDelayChange}
        onMaxDelayChange={onMaxDelayChange}
        onUseRandomDelayChange={onUseRandomDelayChange}
        restIntervalEnabled={restIntervalEnabled}
        onRestIntervalEnabledChange={onRestIntervalEnabledChange}
        minRestDuration={minRestDuration}
        maxRestDuration={maxRestDuration}
        onMinRestDurationChange={onMinRestDurationChange}
        onMaxRestDurationChange={onMaxRestDurationChange}
        restFrequencyType={restFrequencyType}
        onRestFrequencyTypeChange={onRestFrequencyTypeChange}
        messageCountBeforeRest={messageCountBeforeRest}
        onMessageCountBeforeRestChange={onMessageCountBeforeRestChange}
        timePeriodBeforeRest={timePeriodBeforeRest}
        onTimePeriodBeforeRestChange={onTimePeriodBeforeRestChange}
      />
    </div>
  );
}
