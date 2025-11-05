
import React from 'react';
import { DelaySettingsTabs } from './delay-settings';
import { ScheduleConfig } from '@/components/common/schedule';

interface DelaySettingsProps {
  // Basic tab props
  minDelay: number;
  maxDelay: number;
  useRandomDelay: boolean;
  onMinDelayChange: (value: number) => void;
  onMaxDelayChange: (value: number) => void;
  onUseRandomDelayChange: (value: boolean) => void;
  // Rest interval props
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
  
  // The following props are kept for backward compatibility
  // but won't be used in the simplified version
  delayPattern?: 'fixed' | 'linear' | 'exponential' | 'random';
  onDelayPatternChange?: (value: 'fixed' | 'linear' | 'exponential' | 'random') => void;
  randomTimeVariation?: number;
  onRandomTimeVariationChange?: (value: number) => void;
  progressiveWarmingEnabled?: boolean;
  onProgressiveWarmingChange?: (value: boolean) => void;
  dailyLimits?: boolean;
  onDailyLimitsChange?: (value: boolean) => void;
  maxDailyMessages?: number;
  onMaxDailyMessagesChange?: (value: number) => void;
  scheduleConfig?: ScheduleConfig;
  onScheduleConfigChange?: (config: ScheduleConfig) => void;
  
  // Rest period props (older API, kept for backward compatibility)
  restPeriodEnabled?: boolean;
  restPeriodStart?: string;
  restPeriodEnd?: string;
  restDays?: string[];
  warmerDuration?: number;
  onRestPeriodEnabledChange?: (value: boolean) => void;
  onRestPeriodStartChange?: (value: string) => void;
  onRestPeriodEndChange?: (value: string) => void;
  onRestDaysChange?: (value: string[]) => void;
  onWarmerDurationChange?: (value: number) => void;
}

export function DelaySettings({
  // Pass through all the props to DelaySettingsTabs
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
  
  // All the other props passed through for compatibility
  delayPattern = 'random',
  onDelayPatternChange = () => {},
  randomTimeVariation = 20,
  onRandomTimeVariationChange = () => {},
  progressiveWarmingEnabled = false,
  onProgressiveWarmingChange = () => {},
  dailyLimits = false,
  onDailyLimitsChange = () => {},
  maxDailyMessages = 40,
  onMaxDailyMessagesChange = () => {},
  scheduleConfig,
  onScheduleConfigChange = () => {},
  
  // Rest period props (older API)
  restPeriodEnabled,
  restPeriodStart,
  restPeriodEnd,
  restDays,
  warmerDuration,
  onRestPeriodEnabledChange,
  onRestPeriodStartChange,
  onRestPeriodEndChange,
  onRestDaysChange,
  onWarmerDurationChange,
}: DelaySettingsProps) {
  return (
    <div className="space-y-6">
      <DelaySettingsTabs
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
        delayPattern={delayPattern}
        onDelayPatternChange={onDelayPatternChange}
        randomTimeVariation={randomTimeVariation}
        onRandomTimeVariationChange={onRandomTimeVariationChange}
        progressiveWarmingEnabled={progressiveWarmingEnabled}
        onProgressiveWarmingChange={onProgressiveWarmingChange}
        dailyLimits={dailyLimits}
        onDailyLimitsChange={onDailyLimitsChange}
        maxDailyMessages={maxDailyMessages}
        onMaxDailyMessagesChange={onMaxDailyMessagesChange}
        scheduleConfig={scheduleConfig || { days: [], timeRanges: [] }}
        onScheduleConfigChange={onScheduleConfigChange}
      />
    </div>
  );
}
