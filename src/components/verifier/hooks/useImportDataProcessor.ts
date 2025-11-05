
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { ImportData, VerificationConfig } from '../types/wizard-types';

export function useImportDataProcessor(config?: VerificationConfig) {
  const [sourceFiles, setSourceFiles] = useState<Map<string, string[]>>(new Map());
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const processImportData = useCallback((newImportData: ImportData): ImportData => {
    // For each file, keep track of the phone numbers it contains
    if (newImportData.sourceFiles && newImportData.sourceFiles.length > 0) {
      const newSourceFilesMap = new Map<string, string[]>();
      
      newImportData.sourceFiles.forEach((file, index) => {
        // Get the range of numbers for this file
        const startIndex = newImportData.fileRanges?.[index]?.startIndex || 0;
        const endIndex = newImportData.fileRanges?.[index]?.endIndex || newImportData.phoneNumbers.length;
        
        // Extract phone numbers for this file
        const phoneNumbersForFile = newImportData.phoneNumbers.slice(startIndex, endIndex);
        
        // Store the mapping
        newSourceFilesMap.set(file.name, phoneNumbersForFile);
      });
      
      setSourceFiles(newSourceFilesMap);
      
      // Set the first source as selected by default
      if (newImportData.sourceFiles.length > 0 && !selectedSource) {
        setSelectedSource(newImportData.sourceFiles[0].name);
      }
    }
    
    if (config?.validateDuplicates && newImportData.phoneNumbers.length > 0) {
      // Remove duplicates
      const uniqueNumbers = [...new Set(newImportData.phoneNumbers)];
      
      // If duplicates were found, notify the user
      if (uniqueNumbers.length < newImportData.phoneNumbers.length) {
        const duplicateCount = newImportData.phoneNumbers.length - uniqueNumbers.length;
        toast.info(`Removed ${duplicateCount} duplicate phone number${duplicateCount !== 1 ? 's' : ''}`);
        
        // Update the import data with unique numbers
        return {
          ...newImportData,
          phoneNumbers: uniqueNumbers,
          // If names exist, we need to adjust them too (this is simplified)
          names: newImportData.names?.slice(0, uniqueNumbers.length)
        };
      }
    }
    
    return newImportData;
  }, [config, selectedSource]);

  // Function to get phone numbers by source file
  const getPhoneNumbersBySource = useCallback((fileName: string): string[] => {
    return sourceFiles.get(fileName) || [];
  }, [sourceFiles]);

  // Function to get all source file names
  const getSourceFileNames = useCallback((): string[] => {
    return Array.from(sourceFiles.keys());
  }, [sourceFiles]);

  // Function to filter verified numbers by source file
  const filterVerifiedNumbersBySource = useCallback((fileName: string, verifiedNumbers: any[]): any[] => {
    const phoneNumbersInFile = sourceFiles.get(fileName) || [];
    return verifiedNumbers.filter(item => 
      typeof item === 'string' 
        ? phoneNumbersInFile.includes(item)
        : phoneNumbersInFile.includes(item.phoneNumber)
    );
  }, [sourceFiles]);

  // Get currently selected numbers based on source
  const getSelectedSourceNumbers = useCallback((): string[] => {
    if (!selectedSource) return [];
    return sourceFiles.get(selectedSource) || [];
  }, [sourceFiles, selectedSource]);

  return { 
    processImportData,
    getPhoneNumbersBySource,
    getSourceFileNames,
    filterVerifiedNumbersBySource,
    selectedSource,
    setSelectedSource,
    getSelectedSourceNumbers
  };
}
