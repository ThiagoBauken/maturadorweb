
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RestIntervalSettings } from '../RestIntervalSettings';

interface BasicDelaySettingsProps {
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
}

export function BasicDelaySettings({
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
  onTimePeriodBeforeRestChange
}: BasicDelaySettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="delay-range">Intervalo entre mensagens (minutos)</Label>
          <div className="text-sm text-muted-foreground">
            {minDelay} - {maxDelay} min
          </div>
        </div>
        
        <div className="space-y-6 pt-2">
          <Slider
            id="delay-range"
            value={[minDelay, maxDelay]}
            min={1}
            max={180}
            step={1}
            onValueChange={(values) => {
              onMinDelayChange(values[0]);
              onMaxDelayChange(values[1]);
            }}
          />
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="random-delay" 
              checked={useRandomDelay}
              onCheckedChange={(checked) => onUseRandomDelayChange(!!checked)}
            />
            <Label htmlFor="random-delay" className="font-normal cursor-pointer">
              Usar intervalo aleatório entre mensagens
            </Label>
          </div>
        </div>
      </div>
      
      <RestIntervalSettings
        enabled={restIntervalEnabled}
        onEnabledChange={onRestIntervalEnabledChange}
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
