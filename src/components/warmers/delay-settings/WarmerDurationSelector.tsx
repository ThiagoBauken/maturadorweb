
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WarmerDurationSelectorProps {
  warmerDuration: number | string;
  onWarmerDurationChange: (value: number | string) => void;
}

export function WarmerDurationSelector({
  warmerDuration,
  onWarmerDurationChange
}: WarmerDurationSelectorProps) {
  const durationOptions = [
    { value: "5", label: "5 dias" },
    { value: "7", label: "7 dias" },
    { value: "14", label: "14 dias" },
    { value: "21", label: "21 dias" },
    { value: "30", label: "30 dias" },
    { value: "custom", label: "Personalizado" }
  ];

  return (
    <div className="space-y-4">
      <Label>Duração do Warming</Label>
      <Select 
        value={warmerDuration.toString()} 
        onValueChange={(value) => {
          if (value === "custom") {
            onWarmerDurationChange("custom");
          } else {
            onWarmerDurationChange(parseInt(value));
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione a duração" />
        </SelectTrigger>
        <SelectContent>
          {durationOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {warmerDuration === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-duration">Duração personalizada (dias)</Label>
          <Input 
            id="custom-duration" 
            type="number"
            min={1}
            max={365}
            onChange={(e) => onWarmerDurationChange(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
