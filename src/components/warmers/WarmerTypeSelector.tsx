
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Zap, Check } from 'lucide-react';

export type WarmerType = 'standard-warmer' | 'advanced-warmer';

interface WarmerTypeSelectorProps {
  selectedType: WarmerType;
  onSelectType: (type: WarmerType) => void;
  disabled?: boolean;
}

export function WarmerTypeSelector({
  selectedType,
  onSelectType,
  disabled = false
}: WarmerTypeSelectorProps) {
  const warmerTypes = [
    {
      id: 'standard-warmer',
      title: 'Standard Warmer',
      description: 'Pre-configured warmer that is easy to set up. Just select sessions and warming type.',
      icon: <Flame className="h-5 w-5 text-green-500" />,
    },
    {
      id: 'advanced-warmer',
      title: 'Advanced Warmer',
      description: 'Fully customizable warmer with all options, including scheduling and group settings.',
      icon: <Zap className="h-5 w-5 text-orange-500" />,
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {warmerTypes.map((type) => (
          <Card 
            key={type.id}
            className={`cursor-pointer transition-all ${
              selectedType === type.id 
                ? 'border-primary ring-1 ring-primary' 
                : 'hover:border-muted-foreground/50'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => !disabled && onSelectType(type.id as WarmerType)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {type.icon}
                  <div>
                    <h3 className="font-medium">{type.title}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                {selectedType === type.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
