
import React, { ReactNode } from 'react';
import { WizardProvider } from './WizardContext';
import { WizardProgress } from './WizardProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LinearWizardProps {
  totalSteps: number;
  initialStep?: number;
  children: ReactNode;
  className?: string;
  showProgress?: boolean;
  stepTitles?: string[];
  progressClassName?: string;
  contentClassName?: string;
  title?: string;
}

export const LinearWizard: React.FC<LinearWizardProps> = ({
  totalSteps,
  initialStep = 0,
  children,
  className = '',
  showProgress = true,
  stepTitles = [],
  progressClassName = '',
  contentClassName = '',
  title,
}) => {
  return (
    <WizardProvider totalSteps={totalSteps} initialStep={initialStep}>
      <div className={cn("w-full pb-16", className)}>
        {showProgress && (
          <WizardProgress 
            stepTitles={stepTitles} 
            className={progressClassName}
          />
        )}
        <Card className={cn("bg-card", contentClassName)}>
          {title && (
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
          )}
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </WizardProvider>
  );
};
