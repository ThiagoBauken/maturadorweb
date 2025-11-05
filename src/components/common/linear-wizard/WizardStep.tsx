
import React, { ReactNode } from 'react';
import { useWizard } from './WizardContext';

interface WizardStepProps {
  step: number;
  children: ReactNode;
}

export const WizardStep: React.FC<WizardStepProps> = ({ step, children }) => {
  const { currentStep } = useWizard();

  if (step !== currentStep) {
    return null;
  }

  return <div className="wizard-step">{children}</div>;
};
