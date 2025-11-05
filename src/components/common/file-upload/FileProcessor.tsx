
import React from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { AcceptedFileType } from './FileUpload';

export interface ProcessedData {
  data: any[];
  columns: string[];
  fileName: string;
  fileType: AcceptedFileType;
}

export interface FileProcessorProps {
  file: File;
  onProcessed: (data: ProcessedData) => void;
  onError?: (error: string) => void;
  expectedColumns?: string[];
  requiredColumns?: string[];
  children?: React.ReactNode;
}

export const FileProcessor: React.FC<FileProcessorProps> = ({
  file,
  onProcessed,
  onError,
  expectedColumns = [],
  requiredColumns = [],
  children
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingError, setProcessingError] = React.useState<string | null>(null);

  React.useEffect(() => {
    processFile();
  }, [file]);

  const getFileType = (fileName: string): AcceptedFileType => {
    const extension = fileName.split('.').pop()?.toLowerCase() as AcceptedFileType;
    return extension;
  };

  const validateColumns = (columns: string[]): boolean => {
    if (requiredColumns.length === 0) return true;
    
    const lowercaseColumns = columns.map(col => col.toLowerCase());
    const missingColumns = requiredColumns.filter(
      col => !lowercaseColumns.includes(col.toLowerCase())
    );
    
    if (missingColumns.length > 0) {
      const errorMessage = `Missing required columns: ${missingColumns.join(', ')}`;
      setProcessingError(errorMessage);
      if (onError) onError(errorMessage);
      return false;
    }
    
    return true;
  };

  const processFile = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      const fileType = getFileType(file.name);
      let data: any[] = [];
      let columns: string[] = [];
      
      if (fileType === 'csv' || fileType === 'txt') {
        const result = await new Promise<Papa.ParseResult<any>>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: resolve,
            error: reject
          });
        });
        
        data = result.data;
        columns = result.meta.fields || [];
      } 
      else if (fileType === 'xlsx') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          columns = jsonData[0] as string[];
          data = jsonData.slice(1).map((row: any) => {
            const rowData: Record<string, any> = {};
            columns.forEach((col, index) => {
              rowData[col] = row[index];
            });
            return rowData;
          });
        }
      } 
      else if (fileType === 'json') {
        const text = await file.text();
        data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          columns = Object.keys(data[0]);
        }
      }
      else if (fileType === 'vcf') {
        // Basic VCF parsing - would need a more robust parser for production
        const text = await file.text();
        const contacts = text.split('BEGIN:VCARD');
        contacts.shift(); // Remove the first empty element
        
        data = contacts.map(contact => {
          const lines = contact.split('\n');
          const contactData: Record<string, any> = {};
          
          lines.forEach(line => {
            if (line.startsWith('FN:')) {
              contactData['fullName'] = line.substring(3).trim();
            } else if (line.startsWith('TEL:') || line.startsWith('TEL;')) {
              const phoneNumber = line.split(':').pop()?.trim();
              contactData['phoneNumber'] = phoneNumber;
            } else if (line.startsWith('EMAIL:') || line.startsWith('EMAIL;')) {
              const email = line.split(':').pop()?.trim();
              contactData['email'] = email;
            }
          });
          
          return contactData;
        });
        
        columns = ['fullName', 'phoneNumber', 'email'];
      }
      
      // Validate columns if required
      if (!validateColumns(columns)) {
        return;
      }
      
      onProcessed({
        data,
        columns,
        fileName: file.name,
        fileType
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = 'Failed to process the file. Please check the format and try again.';
      setProcessingError(errorMessage);
      if (onError) onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent" />
        <span className="ml-2 text-sm">Processing file...</span>
      </div>
    );
  }

  if (processingError) {
    return (
      <div className="text-destructive text-sm p-2 border border-destructive bg-destructive/10 rounded">
        {processingError}
      </div>
    );
  }

  return children || null;
};
