
import { useEffect } from 'react';
import { toast } from 'sonner';

interface UseVerifierBackgroundProps {
  setActiveProjectId: (id: string) => void;
  setIsWizardOpen: (isOpen: boolean) => void;
}

export function useVerifierBackground({ 
  setActiveProjectId, 
  setIsWizardOpen 
}: UseVerifierBackgroundProps) {
  
  // Check for any background verification process on mount
  useEffect(() => {
    const checkBackgroundVerification = () => {
      const verificationStateJson = localStorage.getItem('verification_background_state');
      if (verificationStateJson) {
        try {
          const verificationState = JSON.parse(verificationStateJson);
          // If there's a background verification, switch to that project
          if (verificationState.projectId && verificationState.isVerifying) {
            setActiveProjectId(verificationState.projectId);
            setIsWizardOpen(true);
            toast.info("A verification is already running in the background");
          }
        } catch (error) {
          console.error('Error parsing verification state:', error);
          localStorage.removeItem('verification_background_state');
        }
      }
    };
    
    // Run check immediately
    checkBackgroundVerification();
    
    // Also set up an interval to check periodically (useful if verification is running in another tab)
    const intervalId = setInterval(checkBackgroundVerification, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [setActiveProjectId, setIsWizardOpen]);
}
