
import { MouseEvent } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { usePhoneNumberFormatter } from './usePhoneNumberFormatter';

/**
 * Hook for handling file uploads and processing
 */
export const useFileProcessor = (
  setRecipientListText: (text: string) => void,
  setSelectedContacts: (contacts: string[]) => void
) => {
  const { formatPhoneNumber } = usePhoneNumberFormatter();

  // Handler for file drop/upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    let numbers: string[] = [];
    
    try {
      // Process based on file type
      if (file.name.endsWith('.csv')) {
        numbers = await processCsvFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        numbers = await processExcelFile(file);
      } else if (file.name.endsWith('.txt')) {
        numbers = await processTextFile(file);
      } else {
        toast.error('Unsupported file format');
        return;
      }
      
      if (numbers.length === 0) {
        toast.error('No valid phone numbers found in file');
        return;
      }
      
      // Update the text area and selected contacts
      setRecipientListText(numbers.join('\n'));
      setSelectedContacts(numbers);
      toast.success(`${numbers.length} contacts imported from file`);
      
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
    }
  };

  // Process CSV file
  const processCsvFile = async (file: File): Promise<string[]> => {
    const text = await file.text();
    const result = Papa.parse(text, { header: true });
    
    // Try to find a column with phone numbers
    const data = result.data as Record<string, string>[];
    const possibleColumns = ['phone', 'phonenumber', 'phone_number', 'mobile', 'contact', 'number', 'tel'];
    
    // Find the first column that might contain phone numbers
    const phoneColumn = Object.keys(data[0] || {}).find(key => 
      possibleColumns.includes(key.toLowerCase()) || 
      key.toLowerCase().includes('phone') || 
      key.toLowerCase().includes('number')
    );
    
    if (phoneColumn) {
      return data
        .map(row => row[phoneColumn]?.trim())
        .filter(Boolean)
        .map(formatPhoneNumber);
    } else if (Object.keys(data[0] || {}).length > 0) {
      // If no obvious column found, try the first column
      const firstColumn = Object.keys(data[0])[0];
      return data
        .map(row => row[firstColumn]?.trim())
        .filter(Boolean)
        .map(formatPhoneNumber);
    }
    
    return [];
  };

  // Process Excel file
  const processExcelFile = async (file: File): Promise<string[]> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, string>[];
    
    // Similar logic to CSV processing
    const possibleColumns = ['phone', 'phonenumber', 'phone_number', 'mobile', 'contact', 'number', 'tel'];
    const columns = Object.keys(jsonData[0] || {});
    
    const phoneColumn = columns.find(key => 
      possibleColumns.includes(key.toLowerCase()) || 
      key.toLowerCase().includes('phone') || 
      key.toLowerCase().includes('number')
    );
    
    if (phoneColumn) {
      return jsonData
        .map(row => row[phoneColumn]?.toString().trim())
        .filter(Boolean)
        .map(formatPhoneNumber);
    } else if (columns.length > 0) {
      // If no obvious column found, try the first column
      const firstColumn = columns[0];
      return jsonData
        .map(row => row[firstColumn]?.toString().trim())
        .filter(Boolean)
        .map(formatPhoneNumber);
    }
    
    return [];
  };

  // Process text file
  const processTextFile = async (file: File): Promise<string[]> => {
    const text = await file.text();
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(formatPhoneNumber);
  };

  // Handler for the "Add Contacts" button
  const addContactsFromFile = (e?: MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
    }
    
    // Create a file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls,.txt,.vcf';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    };
    input.click();
  };

  return {
    handleFileUpload,
    addContactsFromFile
  };
};
