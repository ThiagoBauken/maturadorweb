
import { useEffect } from 'react';
import { toast } from 'sonner';
import { StatusItem } from '@/components/common/status';

interface UseBackgroundStateProps {
  projectId: string;
  setIsVerifying: (isVerifying: boolean) => void;
  updatePauseStatus: (isPaused: boolean) => void;
  initializeSessionUsage: () => void;
  initializeStatusItems: () => void;
  startTimer: () => void;
  verificationStartedRef: React.MutableRefObject<boolean>;
}

export function useBackgroundState({
  projectId,
  setIsVerifying,
  updatePauseStatus,
  initializeSessionUsage,
  initializeStatusItems,
  startTimer,
  verificationStartedRef
}: UseBackgroundStateProps) {
  
  // Manage background verification state
  const saveBackgroundState = (isVerifying: boolean, isPaused: boolean) => {
    const verificationState = {
      projectId,
      isVerifying,
      isPaused,
      startTime: new Date().toISOString(),
    };
    localStorage.setItem('verification_background_state', JSON.stringify(verificationState));
  };
  
  const clearBackgroundState = () => {
    localStorage.removeItem('verification_background_state');
  };
  
  // Check for background verification state on component mount
  useEffect(() => {
    const checkBackgroundVerification = () => {
      const verificationStateJson = localStorage.getItem('verification_background_state');
      if (verificationStateJson && !verificationStartedRef.current) {
        const verificationState = JSON.parse(verificationStateJson);
        
        // Only resume if it's for the current project
        if (verificationState.projectId === projectId && verificationState.isVerifying) {
          verificationStartedRef.current = true;
          setIsVerifying(true);
          
          if (verificationState.isPaused) {
            updatePauseStatus(true);
          } else {
            // Resume the verification process
            initializeSessionUsage();
            initializeStatusItems();
            startTimer();
            toast.info("Resumed background verification");
          }
        }
      }
    };
    
    checkBackgroundVerification();
  }, [projectId]);
  
  return {
    saveBackgroundState,
    clearBackgroundState
  };
}
