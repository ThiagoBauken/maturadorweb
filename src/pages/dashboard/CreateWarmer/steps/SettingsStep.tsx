import React from 'react';
import { WizardNavigation } from '@/components/common/linear-wizard';
import { DelaySettings } from '@/components/warmers';
import { WarmerForm } from '../types';
import { ScheduleConfig } from '@/components/common/schedule';

interface SettingsStepProps {
  formData: WarmerForm;
  handleChange: (field: keyof WarmerForm, value: any) => void;
  handleScheduleChange: (schedule: ScheduleConfig) => void;
}

export const SettingsStep: React.FC<SettingsStepProps> = ({
  formData,
  handleChange,
  handleScheduleChange
}) => {
  // Map the "progressive" delay pattern to "linear" which is the accepted type
  const delayPatternMapping: Record<string, 'fixed' | 'linear' | 'exponential' | 'random'> = {
    'fixed': 'fixed',
    'random': 'random',
    'progressive': 'linear'
  };

  // Get the properly typed delayPattern
  const delayPattern = formData.delayPattern ? 
    delayPatternMapping[formData.delayPattern] || 'random' : 
    'random';

  return (
    <>
      <div className="space-y-6">
        <DelaySettings
          minDelay={formData.minDelay}
          maxDelay={formData.maxDelay}
          useRandomDelay={formData.useRandomDelay}
          restIntervalEnabled={formData.restIntervalEnabled}
          onRestIntervalEnabledChange={(value) => handleChange('restIntervalEnabled', value)}
          minRestDuration={formData.minRestDuration}
          maxRestDuration={formData.maxRestDuration}
          onMinRestDurationChange={(value) => handleChange('minRestDuration', value)}
          onMaxRestDurationChange={(value) => handleChange('maxRestDuration', value)}
          restFrequencyType={formData.restFrequencyType}
          onRestFrequencyTypeChange={(value) => handleChange('restFrequencyType', value)}
          messageCountBeforeRest={formData.messageCountBeforeRest}
          onMessageCountBeforeRestChange={(value) => handleChange('messageCountBeforeRest', value)}
          timePeriodBeforeRest={formData.timePeriodBeforeRest}
          onTimePeriodBeforeRestChange={(value) => handleChange('timePeriodBeforeRest', value)}
          onMinDelayChange={(value) => handleChange('minDelay', value)}
          onMaxDelayChange={(value) => handleChange('maxDelay', value)}
          onUseRandomDelayChange={(value) => handleChange('useRandomDelay', value)}
          restPeriodEnabled={formData.restPeriodEnabled}
          onRestPeriodEnabledChange={(value) => handleChange('restPeriodEnabled', value)}
          restPeriodStart={formData.restPeriodStart}
          restPeriodEnd={formData.restPeriodEnd}
          restDays={formData.restDays}
          warmerDuration={formData.warmerDuration}
          onRestPeriodStartChange={(value) => handleChange('restPeriodStart', value)}
          onRestPeriodEndChange={(value) => handleChange('restPeriodEnd', value)}
          onRestDaysChange={(value) => handleChange('restDays', value)}
          onWarmerDurationChange={(value) => handleChange('warmerDuration', value)}
          progressiveWarmingEnabled={formData.progressiveWarmingEnabled}
          onProgressiveWarmingChange={(value) => handleChange('progressiveWarmingEnabled', value)}
          randomTimeVariation={formData.randomTimeVariation}
          onRandomTimeVariationChange={(value) => handleChange('randomTimeVariation', value)}
          delayPattern={delayPattern}
          onDelayPatternChange={(value) => {
            if (value === 'linear') {
              handleChange('delayPattern', 'progressive');
            } else {
              handleChange('delayPattern', value);
            }
          }}
          dailyLimits={formData.dailyLimits}
          onDailyLimitsChange={(value) => handleChange('dailyLimits', value)}
          maxDailyMessages={formData.maxDailyMessages}
          onMaxDailyMessagesChange={(value) => handleChange('maxDailyMessages', value)}
          scheduleConfig={formData.schedule}
          onScheduleConfigChange={handleScheduleChange}
        />
      </div>
      <WizardNavigation />
    </>
  );
};
