import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ImportData, VerificationConfig } from '../types/wizard-types';
import { VerificationData } from '../types';
import { StatusMonitor, StatusItem } from '@/components/common/status';
import {
  VerificationHeader,
  VerificationProgress,
  VerificationStats,
  ReadyToVerifyAlert,
  useVerificationEngine
} from './verification';

interface VerificationStepProps {
  importData: ImportData;
  config: VerificationConfig;
  setResults: (results: VerificationData[]) => void;
  isVerifying: boolean;
  setIsVerifying: (isVerifying: boolean) => void;
  projectId: string;
}

export function VerificationStep({ 
  importData, 
  config, 
  setResults,
  isVerifying,
  setIsVerifying,
  projectId
}: VerificationStepProps) {
  const [progress, setProgress] = useState(0);
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [processedCount, setProcessedCount] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const {
    startVerification: engineStartVerification,
    pauseVerification: enginePauseVerification,
    resumeVerification: engineResumeVerification,
    stopVerification: engineStopVerification
  } = useVerificationEngine({
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
  
  // We'll keep the auto-start but make it less aggressive
  useEffect(() => {
    // Don't auto-start right away to give user chance to configure if they want
    const shouldAutoStart = importData.phoneNumbers.length > 0 && 
                           !verificationStarted && 
                           !isVerifying;
                           
    if (shouldAutoStart) {
      // This is just for UI feedback, not actual auto-start
      const timer = setTimeout(() => {
        // We're not auto-starting anymore, just showing the UI ready state
        // User must click the button
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [importData.phoneNumbers.length]);
  
  const startVerification = () => {
    setVerificationStarted(true);
    setIsPaused(false);
    engineStartVerification();
  };
  
  const pauseVerification = () => {
    setIsPaused(true);
    enginePauseVerification();
  };
  
  const resumeVerification = () => {
    setIsPaused(false);
    engineResumeVerification();
  };
  
  const stopVerification = () => {
    setIsPaused(false);
    engineStopVerification();
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Processo de Verificação</h2>
      <p className="text-muted-foreground">
        Verificando {importData.phoneNumbers.length} números de telefone
      </p>
      
      <Card>
        <CardContent className="pt-6 space-y-4">
          <VerificationHeader
            config={config}
            verificationStarted={verificationStarted}
            isVerifying={isVerifying}
            isPaused={isPaused}
            startVerification={startVerification}
            pauseVerification={pauseVerification}
            resumeVerification={resumeVerification}
            stopVerification={stopVerification}
          />
          
          <VerificationProgress progress={progress} />
          
          <VerificationStats
            processedCount={processedCount}
            validCount={validCount}
            invalidCount={invalidCount}
          />
          
          {!verificationStarted && <ReadyToVerifyAlert />}
          
          <StatusMonitor 
            items={statusItems}
            title="Log de Verificação"
            showTimestamp
            emptyMessage="Nenhum log de verificação ainda"
          />
        </CardContent>
      </Card>
    </div>
  );
}
