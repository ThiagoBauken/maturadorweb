
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useWizard } from './WizardContext';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressProps {
  showStepIndicators?: boolean;
  stepTitles?: string[];
  className?: string;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  showStepIndicators = true,
  stepTitles = [],
  className = '',
}) => {
  const { currentStep, totalSteps, stepProgress, goToStep } = useWizard();

  return (
    <div className={cn("space-y-2 mb-6", className)}>
      <Progress 
        value={stepProgress} 
        className="h-2" 
      />
      
      {showStepIndicators && (
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center cursor-pointer"
                onClick={() => goToStep(index)}
              >
                <div className="flex items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle 
                      className="h-6 w-6 text-primary" 
                    />
                  ) : (
                    <Circle 
                      className={cn(
                        "h-6 w-6", 
                        isCurrent ? "text-primary fill-primary/20" : "text-muted-foreground"
                      )} 
                    />
                  )}
                </div>
                {stepTitles[index] && (
                  <span 
                    className={cn(
                      "text-xs mt-1", 
                      isCurrent ? "font-medium text-primary" : "text-muted-foreground"
                    )}
                  >
                    {stepTitles[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
