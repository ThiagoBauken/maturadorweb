
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Shuffle } from 'lucide-react';

interface AdvancedDelaySettingsProps {
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
}

export function AdvancedDelaySettings({
  delayPattern,
  onDelayPatternChange,
  randomTimeVariation,
  onRandomTimeVariationChange,
  progressiveWarmingEnabled,
  onProgressiveWarmingChange,
  dailyLimits,
  onDailyLimitsChange,
  maxDailyMessages,
  onMaxDailyMessagesChange
}: AdvancedDelaySettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Padrão de Atraso</Label>
        <RadioGroup 
          value={delayPattern} 
          onValueChange={(v) => onDelayPatternChange(v as 'fixed' | 'linear' | 'exponential' | 'random')}
          className="grid grid-cols-2 gap-2"
        >
          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="fixed" id="pattern-fixed" />
            <Label htmlFor="pattern-fixed" className="cursor-pointer">Fixo</Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="linear" id="pattern-linear" />
            <Label htmlFor="pattern-linear" className="cursor-pointer">Linear</Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="exponential" id="pattern-exp" />
            <Label htmlFor="pattern-exp" className="cursor-pointer">Exponencial</Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="random" id="pattern-random" />
            <Label htmlFor="pattern-random" className="cursor-pointer">Aleatório</Label>
          </div>
        </RadioGroup>
        <p className="text-sm text-muted-foreground">
          O padrão define como os intervalos entre mensagens são calculados ao longo do tempo
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="random-variation" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Variação aleatória de tempo
          </Label>
          <span className="text-sm text-muted-foreground">
            {randomTimeVariation}%
          </span>
        </div>
        <Slider
          id="random-variation"
          value={[randomTimeVariation]}
          min={0}
          max={50}
          step={5}
          onValueChange={(values) => onRandomTimeVariationChange(values[0])}
        />
        <p className="text-sm text-muted-foreground">
          Adiciona uma variação aleatória ao horário de envio para parecer mais natural
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="progressive-warming" 
            checked={progressiveWarmingEnabled}
            onCheckedChange={(checked) => onProgressiveWarmingChange(!!checked)}
          />
          <Label htmlFor="progressive-warming" className="font-normal cursor-pointer">
            Warming progressivo
          </Label>
        </div>
        <p className="text-sm text-muted-foreground pl-6">
          Começa com menos mensagens e aumenta gradualmente ao longo do tempo
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="daily-limits" 
            checked={dailyLimits}
            onCheckedChange={(checked) => onDailyLimitsChange(!!checked)}
          />
          <Label htmlFor="daily-limits" className="font-normal cursor-pointer">
            Limite diário de mensagens
          </Label>
        </div>
        
        {dailyLimits && (
          <div className="pl-6 space-y-2">
            <Label htmlFor="max-daily">Máximo de mensagens por dia</Label>
            <Input 
              id="max-daily" 
              type="number"
              min={1}
              max={100}
              value={maxDailyMessages}
              onChange={(e) => onMaxDailyMessagesChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
