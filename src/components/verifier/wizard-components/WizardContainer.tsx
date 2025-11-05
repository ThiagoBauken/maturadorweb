
import { ReactNode } from 'react';
import {
  LinearWizard,
  WizardStep
} from '@/components/common/linear-wizard';

interface WizardContainerProps {
  currentStep: number;
  children: ReactNode;
  stepTitles: string[];
}

export function WizardContainer({ 
  currentStep, 
  children,
  stepTitles 
}: WizardContainerProps) {
  return (
    <LinearWizard 
      totalSteps={4} 
      initialStep={currentStep}
      showProgress
      stepTitles={stepTitles}
      className="max-w-3xl mx-auto"
    >
      {children}
    </LinearWizard>
  );
}
