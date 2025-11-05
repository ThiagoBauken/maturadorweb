
import { useState } from 'react';
import { VerificationData } from '../types';
import { toast } from 'sonner';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';

interface TransferOptions {
  projectId?: string;
  includePending?: boolean;
}

export function useVerifiedNumbersTransfer() {
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  const saveNumbersForTransfer = (
    numbers: VerificationData[], 
    destination: 'warmer' | 'bulk sender',
    options: TransferOptions = {}
  ): boolean => {
    try {
      if (!numbers || numbers.length === 0) {
        toast.error('Não há números para transferir');
        return false;
      }

      // Format phone numbers if needed
      const formattedNumbers = numbers.map(num => ({
        ...num,
        phoneNumber: formatPhoneNumber(num.phoneNumber)
      }));
      
      // Add additional metadata including project
      const transferData = {
        numbers: formattedNumbers,
        source: 'verifier',
        timestamp: new Date().toISOString(),
        projectId: options.projectId || null,
      };
      
      // Store in localStorage based on destination
      const key = destination === 'warmer' 
        ? 'verified_numbers_for_warmer'
        : 'verified_numbers_for_bulk_sender';
      
      localStorage.setItem(key, JSON.stringify(transferData));
      
      toast.success(`${formattedNumbers.length} números preparados para transferência`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar números para transferência:', error);
      toast.error('Falha ao preparar números para transferência');
      return false;
    }
  };
  
  const getNumbersForTransfer = (destination: 'warmer' | 'bulk sender'): {
    numbers: VerificationData[];
    projectId: string | null;
  } | null => {
    try {
      const key = destination === 'warmer' 
        ? 'verified_numbers_for_warmer'
        : 'verified_numbers_for_bulk_sender';
      
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      const transferData = JSON.parse(data);
      return {
        numbers: transferData.numbers || [],
        projectId: transferData.projectId || null
      };
    } catch (error) {
      console.error('Erro ao recuperar números para transferência:', error);
      return null;
    }
  };
  
  const clearTransferData = (destination: 'warmer' | 'bulk sender'): void => {
    const key = destination === 'warmer' 
      ? 'verified_numbers_for_warmer'
      : 'verified_numbers_for_bulk_sender';
    
    localStorage.removeItem(key);
  };
  
  return {
    saveNumbersForTransfer,
    getNumbersForTransfer,
    clearTransferData
  };
}
