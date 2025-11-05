
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useBulkSender } from './useBulkSender';

export type Step = 'message' | 'recipients' | 'options' | 'send' | 'live' | 'history';

export interface StepInfo {
  id: string;
  label: string;
  isValid: boolean;
}

export function useStepNavigation() {
  const [currentStep, setCurrentStep] = useState<Step>('message');
  const {
    messageTemplates,
    selectedContacts,
    recipientListText,
    sendingInProgress,
    setSelectedContacts,
    saveMessageDraft,
    projectName,
    processRecipientList,
    mediaUrl,
    mediaType,
    mediaOnly
  } = useBulkSender();

  // Get steps and their validation status
  const getSteps = (): StepInfo[] => {
    return [
      { 
        id: 'message', 
        label: 'Create Message',
        isValid: true // Always valid, let's not block even if empty
      },
      { 
        id: 'recipients', 
        label: 'Select Recipients', 
        isValid: true // Always allow proceeding even if empty, validation happens in goToNextStep
      },
      { 
        id: 'options', 
        label: 'Sending Options', 
        isValid: true 
      },
      { 
        id: 'send', 
        label: 'Review & Send', 
        isValid: selectedContacts.length > 0 || recipientListText.trim().length > 0
      }
    ];
  };

  const steps = getSteps();
  
  // Check if we can proceed to the next step
  const canProceed = (): boolean => {
    // For recipients step, check if we have contacts before proceeding
    if (currentStep === 'recipients') {
      return selectedContacts.length > 0 || recipientListText.trim().length > 0;
    }
    
    const currentStepObj = steps.find(step => step.id === currentStep);
    return currentStepObj?.isValid || false;
  };

  // Process recipient list before navigation
  const processRecipientsIfNeeded = (): boolean => {
    if (currentStep === 'recipients' && recipientListText.trim().length > 0) {
      // Split by newlines and filter out empty lines
      const lines = recipientListText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (lines.length > 0 && lines.length !== selectedContacts.length) {
        setSelectedContacts(lines);
        return true;
      }
    }
    return false;
  };

  // Navigation functions
  const goToNextStep = (): void => {
    // Process recipients list if needed
    processRecipientsIfNeeded();
    
    if (!canProceed()) {
      if (currentStep === 'recipients') {
        toast.error('Please select at least one recipient');
      }
      return;
    }
    
    // Auto-save draft when moving to next step if there's a project name
    if (projectName) {
      saveMessageDraft();
    }
    
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as Step);
    }
  };

  const goToPreviousStep = (): void => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as Step);
    }
  };

  const goToStep = (step: Step): void => {
    // Process recipients if needed before navigation
    if (currentStep === 'recipients') {
      processRecipientsIfNeeded();
    }
    
    // For the message step, always allow navigation
    if (step === 'message') {
      setCurrentStep(step);
      return;
    }
    
    // For "live" step, only navigate if sending in progress
    if (step === 'live' && !sendingInProgress) {
      toast.error('No active sending process. Start sending messages first.');
      return;
    }
    
    // For "recipients" step validation
    if (step === 'recipients') {
      setCurrentStep(step);
      return;
    }
    
    // Allow navigation to all steps except "send" which requires recipients
    if (step === 'send') {
      const hasRecipients = selectedContacts.length > 0 || recipientListText.trim().length > 0;
      
      if (!hasRecipients) {
        toast.error('Please select at least one recipient before proceeding to send');
        return;
      }
    }
    
    setCurrentStep(step);
  };

  // Redirect to live view when sending starts
  useEffect(() => {
    if (sendingInProgress && currentStep !== 'live') {
      setCurrentStep('live');
    }
  }, [sendingInProgress]);

  return {
    currentStep,
    setCurrentStep,
    steps,
    canProceed,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    processRecipientsIfNeeded
  };
}
