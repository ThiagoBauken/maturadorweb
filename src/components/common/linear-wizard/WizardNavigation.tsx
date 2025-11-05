
import React from 'react';
import { Button } from '@/components/ui/button';
import { useWizard } from './WizardContext';

interface WizardNavigationProps {
  onComplete?: () => void;
  nextLabel?: string;
  backLabel?: string;
  completeLabel?: string;
  disableNext?: boolean;
  disableBack?: boolean;
  className?: string;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onComplete,
  nextLabel = "Next",
  backLabel = "Back",
  completeLabel = "Complete",
  disableNext = false,
  disableBack = false,
  className = "",
}) => {
  const { goToNext, goToPrevious, isFirstStep, isLastStep } = useWizard();

  const handleNext = () => {
    if (isLastStep && onComplete) {
      onComplete();
    } else {
      goToNext();
    }
  };

  return (
    <div className={`flex justify-between items-center mt-12 py-6 pt-8 ${className} sticky bottom-0 bg-background z-[5] border-t`}>
      <div>
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={isFirstStep || disableBack}
        >
          {backLabel}
        </Button>
      </div>
      
      <div>
        <Button 
          onClick={handleNext} 
          disabled={disableNext}
        >
          {isLastStep ? completeLabel : nextLabel}
        </Button>
      </div>
    </div>
  );
}
