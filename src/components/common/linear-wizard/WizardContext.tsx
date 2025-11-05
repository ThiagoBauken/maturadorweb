
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WizardContextProps {
  currentStep: number;
  totalSteps: number;
  goToNext: () => void;
  goToPrevious: () => void;
  goToStep: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  stepProgress: number;
}

const WizardContext = createContext<WizardContextProps | undefined>(undefined);

interface WizardProviderProps {
  children: ReactNode;
  totalSteps: number;
  initialStep?: number;
}

export const WizardProvider = ({ 
  children, 
  totalSteps, 
  initialStep = 0 
}: WizardProviderProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);

  const goToNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const value = {
    currentStep,
    totalSteps,
    goToNext,
    goToPrevious,
    goToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    stepProgress: ((currentStep + 1) / totalSteps) * 100,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};
