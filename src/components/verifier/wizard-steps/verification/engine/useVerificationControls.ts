
import { useRef } from 'react';
import { toast } from 'sonner';
import { StatusItem } from '@/components/common/status';
import { Session } from './types';

interface UseVerificationControlsProps {
  sessions: Session[];
  setIsVerifying: (isVerifying: boolean) => void;
  setProgress: (progress: number) => void;
  setProcessedCount: (count: number) => void;
  setValidCount: (count: number) => void;
  setInvalidCount: (count: number) => void;
  initializeSessionUsage: () => void;
  initializeStatusItems: () => void;
  updatePauseStatus: (isPaused: boolean) => void;
  updateStopStatus: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  saveBackgroundState: (isVerifying: boolean, isPaused: boolean) => void;
  clearBackgroundState: () => void;
}

export function useVerificationControls({
  sessions,
  setIsVerifying,
  setProgress,
  setProcessedCount,
  setValidCount,
  setInvalidCount,
  initializeSessionUsage,
  initializeStatusItems,
  updatePauseStatus,
  updateStopStatus,
  startTimer,
  stopTimer,
  saveBackgroundState,
  clearBackgroundState
}: UseVerificationControlsProps) {
  
  // Track whether verification has been started to avoid duplicate calls
  const hasStartedRef = useRef(false);
  
  const startVerification = () => {
    if (hasStartedRef.current) {
      toast.info("Verification is already in progress");
      return;
    }
    
    setIsVerifying(true);
    setProgress(0);
    setProcessedCount(0);
    setValidCount(0);
    setInvalidCount(0);
    
    // Initialize session usage counts
    const availableSessions = sessions.filter(s => s.status === 'active');
    
    if (availableSessions.length === 0) {
      toast.error("No active sessions available for verification");
      setIsVerifying(false);
      return;
    }
    
    // Store the verification state in localStorage
    saveBackgroundState(true, false);
    
    // Initialize session usage
    initializeSessionUsage();
    
    // Initialize status items
    initializeStatusItems();
    
    // Start verification timer
    startTimer();
    
    // Mark as started
    hasStartedRef.current = true;
    
    toast.success("Verification started in background");
  };
  
  const pauseVerification = () => {
    // Update background state
    saveBackgroundState(true, true);
    updatePauseStatus(true);
    toast.info("Verification paused");
  };
  
  const resumeVerification = () => {
    // Update background state
    saveBackgroundState(true, false);
    updatePauseStatus(false);
    toast.info("Verification resumed");
  };
  
  const stopVerification = () => {
    stopTimer();
    setIsVerifying(false);
    updateStopStatus();
    
    // Reset started flag
    hasStartedRef.current = false;
    
    // Clean up background state
    clearBackgroundState();
    toast.info("Verification stopped");
  };
  
  return {
    startVerification,
    pauseVerification,
    resumeVerification,
    stopVerification
  };
}
