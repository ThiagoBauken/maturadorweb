
import { useState, useEffect, useRef } from 'react';
import { ImportData, VerificationConfig } from '../../../types/wizard-types';
import { VerificationData } from '../../../types';
import { StatusItem } from '@/components/common/status';
import { useSessions } from '@/hooks/useSessions';
import { 
  useVerificationTimer,
  useSessionManager,
  useVerificationProcess,
  useStatusUpdates
} from './index';
import { useBackgroundState } from './useBackgroundState';
import { useProjectResults } from './useProjectResults';
import { useVerificationControls } from './useVerificationControls';

interface UseVerificationEngineProps {
  importData: ImportData;
  config: VerificationConfig;
  setResults: (results: VerificationData[]) => void;
  setIsVerifying: (isVerifying: boolean) => void;
  setProgress: (progress: number) => void;
  setProcessedCount: (count: number) => void;
  setValidCount: (count: number) => void;
  setInvalidCount: (count: number) => void;
  setStatusItems: (setter: (prev: StatusItem[]) => StatusItem[]) => void;
  isPaused: boolean;
  verificationStarted: boolean;
  projectId: string;
}

export function useVerificationEngine({
  importData,
  config,
  setResults,
  setIsVerifying,
  setProgress,
  setProcessedCount,
  setValidCount,
  setInvalidCount,
  setStatusItems,
  isPaused,
  verificationStarted,
  projectId
}: UseVerificationEngineProps) {
  const verificationStartedRef = useRef(verificationStarted);
  const { sessions } = useSessions({});
  
  // Map the sessions to ensure phoneNumber property exists
  const mappedSessions = sessions.map(session => ({
    ...session,
    phoneNumber: session.phone || (session as any).phoneNumber || ''
  }));
  
  // Initialize session manager
  const {
    initializeSessionUsage,
    getSelectedSessionId,
    incrementSessionUsage,
    updateSessionStatusItem
  } = useSessionManager({
    sessions: mappedSessions,
    config,
    setStatusItems
  });
  
  // Initialize status updates
  const {
    initializeStatusItems,
    updatePauseStatus,
    updateStopStatus
  } = useStatusUpdates({
    setStatusItems,
    sessions: mappedSessions,
    config
  });
  
  // Initialize verification process
  const {
    processVerificationBatch
  } = useVerificationProcess({
    importData,
    incrementSessionUsage,
    updateSessionStatusItem,
    setStatusItems
  });
  
  // Initialize project results manager
  const {
    saveResultsToProject
  } = useProjectResults({
    projectId
  });
  
  // Handle verification completion
  const handleVerificationComplete = () => {
    saveResultsToProject();
  };
  
  // Initialize verification timer
  const {
    startTimer,
    stopTimer
  } = useVerificationTimer({
    importData,
    config,
    setResults,
    setIsVerifying,
    setProgress,
    setProcessedCount,
    setValidCount,
    setInvalidCount,
    setStatusItems,
    isPaused,
    onComplete: handleVerificationComplete,
    processVerificationBatch,
    getSelectedSessionId
  });
  
  // Initialize background state manager
  const {
    saveBackgroundState,
    clearBackgroundState
  } = useBackgroundState({
    projectId,
    setIsVerifying,
    updatePauseStatus,
    initializeSessionUsage,
    initializeStatusItems,
    startTimer,
    verificationStartedRef
  });
  
  // Initialize verification controls
  const {
    startVerification,
    pauseVerification,
    resumeVerification,
    stopVerification
  } = useVerificationControls({
    sessions: mappedSessions,
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
  });
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't actually stop the timer on unmount, just let it run in background
      // We'll check if we should resume when component mounts again
    };
  }, []);

  return {
    startVerification,
    pauseVerification,
    resumeVerification,
    stopVerification
  };
}
