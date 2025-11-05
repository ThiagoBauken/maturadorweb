
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { Upload, UserCheck, FileSpreadsheet, CheckCircle, FilterX } from 'lucide-react';
import { toast } from 'sonner';
import { useBulkSender } from '../hooks/useBulkSender';
import { useLocation } from 'react-router-dom';
import { MouseEvent } from 'react';

export function RecipientsSection() {
  const { 
    selectedContacts,
    setSelectedContacts,
    handleImportFromVerifier,
    recipientListText,
    setRecipientListText,
    addContactsFromFile,
    handleFileUpload,
    processRecipientList,
    removeDuplicates,
    projectName
  } = useBulkSender();
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fromVerifier = queryParams.get('from') === 'verifier';
  
  // Effect to process recipients from text area when component mounts
  // and whenever recipientListText changes
  useEffect(() => {
    if (recipientListText && recipientListText.trim().length > 0) {
      const debounceTimer = setTimeout(() => {
        const contacts = processRecipientList();
        if (contacts && contacts.length > 0) {
          removeDuplicates(contacts);
        }
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [recipientListText, processRecipientList, removeDuplicates]);
  
  // Effect to import from verifier if coming from verifier page
  useEffect(() => {
    if (fromVerifier) {
      const importedContacts = handleImportFromVerifier();
      if (importedContacts && importedContacts.length > 0) {
        setSelectedContacts(importedContacts);
      }
    }
  }, [fromVerifier, handleImportFromVerifier, setSelectedContacts]);
  
  // Handle process button click
  const handleProcessContacts = () => {
    if (!recipientListText.trim()) {
      toast.error('Please enter phone numbers first');
      return;
    }
    
    const contacts = processRecipientList();
    if (contacts && contacts.length > 0) {
      toast.success(`${contacts.length} contacts processed`);
    }
  };

  // Fixed function to properly handle click events
  const handleRemoveDuplicates = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const contacts = processRecipientList();
    if (contacts) {
      removeDuplicates(contacts);
    }
  };

  // Fixed function to properly handle click events and call addContactsFromFile
  const handleAddContactsFromFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Call addContactsFromFile with the event
    if (addContactsFromFile) {
      addContactsFromFile(e);
    }
  };
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
      'text/x-vcard': ['.vcf'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        // Fix: Pass the first file instead of array
        handleFileUpload(acceptedFiles[0]);
      }
    },
  });
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Add Recipients</span>
            {selectedContacts.length > 0 && (
              <Badge variant="default">{selectedContacts.length} contacts</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-list">Phone Numbers</Label>
            <Textarea 
              id="recipient-list"
              rows={8}
              placeholder="Enter phone numbers, one per line. Format: +551199999999"
              value={recipientListText}
              onChange={(e) => setRecipientListText(e.target.value)}
              className="font-mono"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Enter one number per line. Numbers will be automatically formatted to international format.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveDuplicates}
                  className="flex items-center gap-1"
                >
                  <FilterX className="h-3 w-3" />
                  Remove Duplicates
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleProcessContacts}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Format Numbers
                </Button>
              </div>
            </div>
          </div>
          
          {selectedContacts.length > 0 && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium">Selected Contacts</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedContacts.slice(0, 5).join(', ')}
                {selectedContacts.length > 5 && ` and ${selectedContacts.length - 5} more...`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Import Recipients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div {...getRootProps()} className="cursor-pointer">
              <div className="border rounded-md p-4 text-center hover:bg-muted transition-colors h-full flex flex-col items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 mb-2 text-muted-foreground" />
                <input {...getInputProps()} />
                <p className="font-medium">Import CSV/Excel</p>
                <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
              </div>
            </div>
            
            <button 
              onClick={handleAddContactsFromFile}
              className="border rounded-md p-4 text-center hover:bg-muted transition-colors h-full flex flex-col items-center justify-center"
            >
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="font-medium">Upload File</p>
              <p className="text-xs text-muted-foreground">Select contacts from your device</p>
            </button>
            
            <button 
              onClick={handleImportFromVerifier}
              className={`border rounded-md p-4 text-center hover:bg-muted transition-colors h-full flex flex-col items-center justify-center ${fromVerifier ? 'border-primary' : ''}`}
            >
              <UserCheck className={`w-8 h-8 mb-2 ${fromVerifier ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-medium">Verified Numbers</p>
              <p className="text-xs text-muted-foreground">Import from Verifier tool</p>
              {fromVerifier && <Badge variant="outline" className="mt-2">Imported</Badge>}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
