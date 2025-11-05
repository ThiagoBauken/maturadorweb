
import React from 'react';
import { ScheduleBuilder, ScheduleConfig } from '@/components/common/schedule';

interface ScheduleSettingsTabProps {
  scheduleConfig: ScheduleConfig;
  onScheduleConfigChange: (config: ScheduleConfig) => void;
}

export function ScheduleSettingsTab({ scheduleConfig, onScheduleConfigChange }: ScheduleSettingsTabProps) {
  return (
    <div className="space-y-6">
      <ScheduleBuilder value={scheduleConfig} onChange={onScheduleConfigChange} />
    </div>
  );
}
