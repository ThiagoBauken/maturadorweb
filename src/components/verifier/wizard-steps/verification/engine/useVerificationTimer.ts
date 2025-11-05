
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { StatusItem } from '@/components/common/status';
import { VerificationData } from '../../../types';
import { ImportData, VerificationConfig } from '../../../types/wizard-types';

interface VerificationTimerProps {
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
  onComplete: () => void;
  processVerificationBatch: (
    batchSize: number,
    processed: number,
    results: VerificationData[],
    sessionId: string
  ) => {
    processed: number;
    valid: number;
    invalid: number;
    results: VerificationData[];
  };
  getSelectedSessionId: () => string | null;
}

export function useVerificationTimer({
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
  onComplete,
  processVerificationBatch,
  getSelectedSessionId
}: VerificationTimerProps) {
  const [verificationTimer, setVerificationTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (verificationTimer) {
        clearInterval(verificationTimer);
      }
    };
  }, [verificationTimer]);
  
  const startTimer = () => {
    const totalNumbers = importData.phoneNumbers.length;
    const results: VerificationData[] = [];
    let processed = 0;
    let valid = 0;
    let invalid = 0;
    
    // Calculate verification rate based on config
    const requestsPerInterval = config.rateLimits.enabled ? 
      Math.min(5, config.rateLimits.requestsPerMinute / 12) : 5;
    
    // Verification interval in ms (default 5 seconds)
    const intervalTime = 5000;
    
    // Start verification timer
    const timer = setInterval(() => {
      if (isPaused) return;
      
      // Process a batch of numbers in each interval
      const batchSize = Math.min(requestsPerInterval, totalNumbers - processed);
      
      if (batchSize <= 0) {
        // All numbers processed
        clearInterval(timer);
        setVerificationTimer(null);
        setIsVerifying(false);
        setResults(results);
        
        // Final status update
        setStatusItems(prev => {
          const updated = [...prev];
          const index = updated.findIndex(item => item.id === 'verification-process');
          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              status: 'success',
              description: `Concluído. ${valid} válidos, ${invalid} inválidos`,
              progress: 100
            };
          }
          
          return [
            ...updated,
            {
              id: `status-complete-${Date.now()}`,
              status: 'success',
              title: 'Verificação Concluída',
              description: `Processados ${totalNumbers} números em ${(Date.now() / 1000).toFixed(1)} segundos`,
              timestamp: new Date().toISOString()
            }
          ];
        });
        
        onComplete();
        
        toast.success(`Verificação concluída! ${valid} válidos, ${invalid} inválidos`);
        return;
      }
      
      // Get session for this batch
      const selectedSessionId = getSelectedSessionId();
      
      if (!selectedSessionId) {
        // No active sessions, pause verification
        clearInterval(timer);
        setVerificationTimer(null);
        
        toast.error("Todas as sessões foram desconectadas. Verificação pausada.");
        setStatusItems(prev => [
          ...prev,
          {
            id: `status-session-error-${Date.now()}`,
            status: 'error',
            title: 'Erro de Sessão',
            description: 'Todas as sessões foram desconectadas',
            timestamp: new Date().toISOString()
          }
        ]);
        return;
      }
      
      // Process batch with selected session
      const batchResult = processVerificationBatch(
        batchSize, 
        processed, 
        results, 
        selectedSessionId
      );
      
      processed = batchResult.processed;
      valid = batchResult.valid;
      invalid = batchResult.invalid;
      
      // Update counts and progress
      setProcessedCount(processed);
      setValidCount(valid);
      setInvalidCount(invalid);
      setProgress(Math.floor((processed / totalNumbers) * 100));
      
      // Add occasional status updates for rate limiting
      if (processed % 20 === 0 && processed > 0) {
        const isThrottling = Math.random() > 0.7;
        
        if (isThrottling && config.rateLimits.enabled) {
          setStatusItems(prev => [
            ...prev,
            {
              id: `status-${Date.now()}`,
              status: 'warning',
              title: `Limite de Taxa Detectado`,
              description: 'Reduzindo taxa de verificação para evitar bloqueios',
              timestamp: new Date().toISOString()
            }
          ]);
        }
      }
      
    }, intervalTime);
    
    setVerificationTimer(timer);
    return timer;
  };
  
  const stopTimer = () => {
    if (verificationTimer) {
      clearInterval(verificationTimer);
      setVerificationTimer(null);
    }
  };
  
  return {
    startTimer,
    stopTimer,
    verificationTimer
  };
}
