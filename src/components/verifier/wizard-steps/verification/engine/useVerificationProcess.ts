
import { VerificationData } from '../../../types';
import { ImportData, VerificationConfig } from '../../../types/wizard-types';
import { StatusItem } from '@/components/common/status';

interface VerificationProcessProps {
  importData: ImportData;
  incrementSessionUsage: (sessionId: string) => void;
  updateSessionStatusItem: () => void;
  setStatusItems: (setter: (prev: StatusItem[]) => StatusItem[]) => void;
}

export function useVerificationProcess({
  importData,
  incrementSessionUsage,
  updateSessionStatusItem,
  setStatusItems
}: VerificationProcessProps) {
  
  const processVerificationBatch = (
    batchSize: number,
    currentProcessed: number,
    currentResults: VerificationData[],
    sessionId: string
  ) => {
    let processed = currentProcessed;
    let valid = currentResults.filter(r => r.status === 'valid').length;
    let invalid = currentResults.filter(r => r.status === 'invalid').length;
    const results = [...currentResults];
    const totalNumbers = importData.phoneNumbers.length;
    
    // Process batch with selected session
    for (let i = 0; i < batchSize; i++) {
      if (processed < totalNumbers) {
        // In a real implementation, this would be the actual verification API call
        // For simulation, we'll randomly determine if a number is valid
        const isValid = Math.random() > 0.3;
        
        const result: VerificationData = {
          id: `id-${Date.now()}-${processed}`,
          phoneNumber: importData.phoneNumbers[processed],
          name: importData.names?.[processed] || '',
          status: isValid ? 'valid' : 'invalid',
          verificationDate: new Date().toISOString()
        };
        
        results.push(result);
        processed++;
        
        if (isValid) {
          valid++;
        } else {
          invalid++;
        }
        
        // Update session usage count
        incrementSessionUsage(sessionId);
        
        // Update verification process status
        setStatusItems(prev => {
          const updated = [...prev];
          const processIndex = updated.findIndex(item => item.id === 'verification-process');
          if (processIndex !== -1) {
            updated[processIndex] = {
              ...updated[processIndex],
              description: `Processados ${processed} de ${totalNumbers} números`,
              progress: Math.floor((processed / totalNumbers) * 100)
            };
          }
          
          return updated;
        });
        
        // Update session usage status
        updateSessionStatusItem();
      }
    }
    
    return {
      processed,
      valid,
      invalid,
      results
    };
  };
  
  return {
    processVerificationBatch
  };
}
