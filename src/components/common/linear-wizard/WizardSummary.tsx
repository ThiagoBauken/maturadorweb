
import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryItem {
  label: string;
  value: ReactNode;
}

interface WizardSummaryProps {
  title?: string;
  description?: string;
  items: SummaryItem[];
  className?: string;
}

export const WizardSummary: React.FC<WizardSummaryProps> = ({
  title = 'Summary',
  description = 'Review your information before continuing',
  items,
  className = '',
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <dt className="text-sm font-medium text-muted-foreground">{item.label}</dt>
              <dd className="text-sm">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
};
