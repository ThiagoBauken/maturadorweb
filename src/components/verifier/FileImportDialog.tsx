
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload, AcceptedFileType } from '@/components/common/file-upload/FileUpload';
import { FileProcessor, ProcessedData } from '@/components/common/file-upload/FileProcessor';
import { toast } from 'sonner';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';
import { VerificationData } from './types';

interface FileImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (data: VerificationData[]) => void;
}

export function FileImportDialog({ open, onOpenChange, onImportComplete }: FileImportDialogProps) {
  const [phoneNumberColumn, setPhoneNumberColumn] = useState('');
  const [nameColumn, setNameColumn] = useState('');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Reset columns when a new file is selected
    setPhoneNumberColumn('');
    setNameColumn('');
  };
  
  const handleProcessedData = (data: ProcessedData) => {
    setProcessedData(data);
    
    if (data && data.columns && data.columns.length > 0) {
      // Try to auto-detect phone number column
      const phoneColumnGuess = data.columns.find((header: string) => 
        header.toLowerCase().includes('phone') || 
        header.toLowerCase().includes('telefone') || 
        header.toLowerCase().includes('celular') ||
        header.toLowerCase().includes('mobile') ||
        header.toLowerCase().includes('número') ||
        header.toLowerCase().includes('number')
      );
      
      if (phoneColumnGuess) {
        setPhoneNumberColumn(phoneColumnGuess);
      } else {
        setPhoneNumberColumn(data.columns[0]);
      }
      
      // Try to auto-detect name column
      const nameColumnGuess = data.columns.find((header: string) => 
        header.toLowerCase().includes('name') || 
        header.toLowerCase().includes('nome') ||
        header.toLowerCase().includes('contact')
      );
      
      if (nameColumnGuess) {
        setNameColumn(nameColumnGuess);
      }
    }
  };
  
  const handleImport = () => {
    if (!processedData) {
      toast.error('Please upload a file first');
      return;
    }
    
    if (!phoneNumberColumn) {
      toast.error('Please select the phone number column');
      return;
    }
    
    try {
      // Extract phone numbers and names from the processed data
      const verificationData: VerificationData[] = processedData.data
        .filter(row => row[phoneNumberColumn]) // Filter out rows without phone numbers
        .map((row, index) => {
          const phoneNumber = formatPhoneNumber(String(row[phoneNumberColumn]));
          const name = nameColumn && row[nameColumn] ? String(row[nameColumn]) : '';
          
          return {
            id: `imported-${Date.now()}-${index}`,
            phoneNumber,
            name,
            status: 'pending',
            verificationDate: null
          };
        });
      
      // Remove duplicates
      const uniqueNumbers = new Set<string>();
      const uniqueVerificationData = verificationData.filter(item => {
        if (uniqueNumbers.has(item.phoneNumber)) {
          return false;
        }
        uniqueNumbers.add(item.phoneNumber);
        return true;
      });
      
      if (uniqueVerificationData.length === 0) {
        toast.error('No valid phone numbers found in the file');
        return;
      }
      
      // Call the onImportComplete callback with the data
      if (onImportComplete) {
        onImportComplete(uniqueVerificationData);
      }
      
      toast.success(`Imported ${uniqueVerificationData.length} numbers for verification`);
      
      // Close the dialog and reset state
      onOpenChange(false);
      setSelectedFile(null);
      setProcessedData(null);
      setPhoneNumberColumn('');
      setNameColumn('');
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Failed to import data');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Phone Numbers</DialogTitle>
          <DialogDescription>
            Import phone numbers from a CSV or Excel file
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Upload File</Label>
            <FileUpload 
              acceptedTypes={['csv', 'xlsx', 'txt']}
              maxSizeInMB={5}
              onFileSelect={handleFileSelect}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: CSV, Excel (.xlsx), Text (.txt). Max size: 5MB
            </p>
          </div>
          
          {selectedFile && (
            <FileProcessor
              file={selectedFile}
              onProcessed={handleProcessedData}
              onError={(error) => toast.error(error)}
            >
              {processedData && processedData.columns && (
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
                        {processedData.columns.map((header: string) => (
                          <SelectItem key={header} value={header}>
                            {header}
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
                        {processedData.columns.map((header: string) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="checkbox" 
                      id="has-headers" 
                      checked={hasHeaders}
                      onChange={(e) => setHasHeaders(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="has-headers" className="font-normal cursor-pointer">
                      File has header row
                    </Label>
                  </div>
                  
                  <div className="bg-muted p-2 rounded text-sm">
                    <p>Preview: {processedData.data.length} rows found</p>
                    {processedData.data.length > 0 && (
                      <div className="mt-1 overflow-x-auto">
                        <table className="text-xs">
                          <thead>
                            <tr>
                              {processedData.columns.map((header: string) => (
                                <th key={header} className="px-2 py-1 text-left">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {processedData.data.slice(0, 3).map((row: any, index: number) => (
                              <tr key={index}>
                                {processedData.columns.map((header: string) => (
                                  <td key={header} className="px-2 py-1">
                                    {row[header] || ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {processedData.data.length > 3 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {processedData.data.length - 3} more rows...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </FileProcessor>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!processedData || !phoneNumberColumn}
          >
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
