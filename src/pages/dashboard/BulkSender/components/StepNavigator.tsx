
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

type Step = {
  id: string;
  label: string;
  isValid: boolean;
};

interface StepNavigatorProps {
  steps: Step[];
  currentStep: string;
  onChange: (stepId: string) => void;
}

export function StepNavigator({ steps, currentStep, onChange }: StepNavigatorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPast = steps.findIndex(s => s.id === currentStep) > index;
          const isClickable = isPast || step.id === 'history';
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              <div 
                className={cn(
                  "w-full flex items-center",
                  index === 0 && "justify-start",
                  index === steps.length - 1 && "justify-end",
                  index > 0 && index < steps.length - 1 && "justify-center"
                )}
              >
                <button
                  onClick={() => isClickable && onChange(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex flex-col items-center gap-2 group",
                    isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                  )}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "rounded-full h-10 w-10 flex items-center justify-center border-2 z-10 bg-background transition-colors",
                        isActive && "border-primary bg-primary text-primary-foreground",
                        isPast && step.isValid && "border-green-500 bg-green-500 text-white",
                        !isActive && !isPast && "text-muted-foreground border-muted-foreground"
                      )}
                    >
                      {isPast && step.isValid ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div 
                        className={cn(
                          "h-1 w-12 md:w-24 bg-muted transition-colors",
                          isPast && "bg-green-500"
                        )}
                      />
                    )}
                  </div>
                  
                  <span 
                    className={cn(
                      "text-xs font-medium",
                      isActive && "text-primary",
                      isPast && step.isValid && "text-green-600",
                      !isActive && !isPast && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
