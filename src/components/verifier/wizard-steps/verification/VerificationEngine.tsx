
import { useState, useEffect } from 'react';
import { ImportData, VerificationConfig } from '../../types/wizard-types';
import { VerificationData } from '../../types';
import { StatusItem } from '@/components/common/status';
import { toast } from 'sonner';
import { useSessions } from '@/hooks/useSessions'; 
import { useVerifierProjects } from '../../hooks/useVerifierProjects';
import { useVerificationEngine as useVerificationEngineImpl } from './engine/useVerificationEngine';

interface VerificationEngineProps {
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
}: VerificationEngineProps) {
  const { addNumbersToProject } = useVerifierProjects();
  
  const {
    startVerification,
    pauseVerification,
    resumeVerification,
    stopVerification
  } = useVerificationEngineImpl({
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
  });

  return {
    startVerification,
    pauseVerification,
    resumeVerification,
    stopVerification
  };
}
