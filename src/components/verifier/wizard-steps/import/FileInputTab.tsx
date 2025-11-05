
import { useState } from 'react';
import { FileUpload, AcceptedFileType } from '@/components/common/file-upload/FileUpload';
import { FileProcessor, ProcessedData } from '@/components/common/file-upload/FileProcessor';
import { ImportData } from '../../types/wizard-types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';

interface FileInputTabProps {
  importData: ImportData;
  setImportData: (data: ImportData) => void;
}

export function FileInputTab({ importData, setImportData }: FileInputTabProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [phoneNumberColumn, setPhoneNumberColumn] = useState('');
  const [nameColumn, setNameColumn] = useState('');
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };
  
  const handleProcessedData = (data: ProcessedData) => {
    setProcessedData(data);
    
    if (data.columns.length > 0) {
      // Try to auto-detect phone number column
      const phoneColGuess = data.columns.find(col => 
        col.toLowerCase().includes('phone') ||
        col.toLowerCase().includes('tel') ||
        col.toLowerCase().includes('mobile') ||
        col.toLowerCase().includes('number') ||
        col.toLowerCase().includes('phone number')
      );
      
      if (phoneColGuess) {
        setPhoneNumberColumn(phoneColGuess);
      } else {
        setPhoneNumberColumn(data.columns[0]);
      }
      
      // Try to auto-detect name column
      const nameColGuess = data.columns.find(col => 
        col.toLowerCase().includes('name') ||
        col.toLowerCase().includes('contact') ||
        col.toLowerCase().includes('person')
      );
      
      if (nameColGuess) {
        setNameColumn(nameColGuess);
      }
    }
  };
  
  const handleImport = () => {
    if (!processedData) {
      toast.error('Please upload a file first');
      return;
    }
    
    if (!phoneNumberColumn) {
      toast.error('Please select a column for phone numbers');
      return;
    }
    
    try {
      // Extract phone numbers and optionally names
      const phoneNumbers: string[] = [];
      const names: string[] = [];
      
      processedData.data.forEach(row => {
        const phoneValue = row[phoneNumberColumn];
        
        if (phoneValue) {
          // Format the phone number and add it to the list
          phoneNumbers.push(formatPhoneNumber(String(phoneValue)));
          
          // Add name if a name column was selected
          if (nameColumn && row[nameColumn]) {
            names.push(String(row[nameColumn]));
          } else {
            names.push('');
          }
        }
      });
      
      if (phoneNumbers.length === 0) {
        toast.error('No valid phone numbers found in the selected column');
        return;
      }
      
      // Remove duplicates
      const uniquePhoneMap = new Map<string, number>();
      phoneNumbers.forEach((phone, index) => {
        if (!uniquePhoneMap.has(phone)) {
          uniquePhoneMap.set(phone, index);
        }
      });
      
      const uniquePhoneNumbers: string[] = [];
      const uniqueNames: string[] = [];
      
      uniquePhoneMap.forEach((index, phone) => {
        uniquePhoneNumbers.push(phone);
        uniqueNames.push(names[index] || '');
      });
      
      if (uniquePhoneNumbers.length < phoneNumbers.length) {
        toast.info(`Removed ${phoneNumbers.length - uniquePhoneNumbers.length} duplicate phone numbers`);
      }
      
      // Update the import data
      setImportData({
        ...importData,
        phoneNumbers: uniquePhoneNumbers,
        names: uniqueNames,
        source: 'file',
        sourceFiles: selectedFile ? [selectedFile] : importData.sourceFiles
      });
      
      toast.success(`Imported ${uniquePhoneNumbers.length} phone numbers from file`);
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data from file');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Upload File</Label>
        <FileUpload 
          acceptedTypes={['csv', 'xlsx', 'txt']}
          maxSizeInMB={5}
          onFileSelect={handleFileSelect}
          buttonText="Select file"
          dragActiveText="Drop file here"
          dragInactiveText="or drag and drop file here"
        />
      </div>
      
      {selectedFile && (
        <FileProcessor
          file={selectedFile}
          onProcessed={handleProcessedData}
          onError={(error) => toast.error(error)}
        >
          {processedData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone-column">Phone Number Column</Label>
                <Select 
                  value={phoneNumberColumn} 
                  onValueChange={setPhoneNumberColumn}
                >
                  <SelectTrigger id="phone-column">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {processedData.columns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name-column">Name Column (Optional)</Label>
                <Select 
                  value={nameColumn} 
                  onValueChange={setNameColumn}
                >
                  <SelectTrigger id="name-column">
                    <SelectValue placeholder="Select column (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {processedData.columns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">Preview</p>
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        {processedData.columns.map(col => (
                          <th key={col} className="px-2 py-1 border-b text-left">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.data.slice(0, 3).map((row, index) => (
                        <tr key={index}>
                          {processedData.columns.map(col => (
                            <td key={`${index}-${col}`} className="px-2 py-1 border-b">
                              {row[col] || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {processedData.data.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {processedData.data.length - 3} more rows...
                    </p>
                  )}
                </div>
              </div>
              
              <Button onClick={handleImport} className="w-full">
                Import {processedData.data.length} Records
              </Button>
            </div>
          )}
        </FileProcessor>
      )}
    </div>
  );
}
