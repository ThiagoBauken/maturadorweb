
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RestIntervalSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  minRestDuration: number;
  maxRestDuration: number;
  onMinRestDurationChange: (value: number) => void;
  onMaxRestDurationChange: (value: number) => void;
  restFrequencyType: 'message-count' | 'time-period';
  onRestFrequencyTypeChange: (type: 'message-count' | 'time-period') => void;
  messageCountBeforeRest: number;
  onMessageCountBeforeRestChange: (count: number) => void;
  timePeriodBeforeRest: number;
  onTimePeriodBeforeRestChange: (minutes: number) => void;
}

export function RestIntervalSettings({
  enabled,
  onEnabledChange,
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
}: RestIntervalSettingsProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="rest-interval-toggle" className="font-medium">
                Intervalos de Descanso Aleatórios
              </Label>
            </div>
            <Switch 
              id="rest-interval-toggle" 
              checked={enabled}
              onCheckedChange={onEnabledChange}
            />
          </div>
          
          {enabled && (
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label>Duração do Descanso (minutos)</Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{minRestDuration}</span>
                  <span className="text-sm text-muted-foreground">{maxRestDuration}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <Slider
                    value={[minRestDuration, maxRestDuration]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(values) => {
                      onMinRestDurationChange(values[0]);
                      onMaxRestDurationChange(values[1]);
                    }}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Durante este período, o warmer para de enviar e responder mensagens, simulando que a pessoa está ocupada
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Frequência de Descanso</Label>
                <Select 
                  value={restFrequencyType} 
                  onValueChange={(value) => onRestFrequencyTypeChange(value as 'message-count' | 'time-period')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message-count">A cada X mensagens</SelectItem>
                    <SelectItem value="time-period">A cada X minutos</SelectItem>
                  </SelectContent>
                </Select>
                
                {restFrequencyType === 'message-count' ? (
                  <div className="space-y-2">
                    <Label htmlFor="message-count">Número de mensagens antes do descanso</Label>
                    <Input
                      id="message-count"
                      type="number"
                      min={5}
                      max={50}
                      value={messageCountBeforeRest}
                      onChange={(e) => onMessageCountBeforeRestChange(parseInt(e.target.value) || 10)}
                    />
                    <p className="text-xs text-muted-foreground">
                      O warmer descansará após enviar este número de mensagens
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="time-period">Período de tempo antes do descanso (minutos)</Label>
                    <Input
                      id="time-period"
                      type="number"
                      min={15}
                      max={240}
                      value={timePeriodBeforeRest}
                      onChange={(e) => onTimePeriodBeforeRestChange(parseInt(e.target.value) || 60)}
                    />
                    <p className="text-xs text-muted-foreground">
                      O warmer descansará após este período de atividade
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
