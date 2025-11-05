
import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  FileUpload, 
  FileProcessor, 
  FilePreview, 
  ProcessedData 
} from '@/components/common/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Users, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

// For demo purposes only
interface Contact {
  id: number;
  name: string;
  phoneNumber: string;
  tags: string[];
  dateAdded: string;
}

const mockContacts: Contact[] = Array(20).fill(null).map((_, index) => ({
  id: index + 1,
  name: `Contact ${index + 1}`,
  phoneNumber: `+1 555-${100 + index}`,
  tags: [`tag-${index % 3 + 1}`],
  dateAdded: new Date(2023, 0, index + 1).toISOString().split('T')[0]
}));

export default function Contacts() {
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    setProcessedData(null);
    setImportStep('upload');
  };

  const handleDataProcessed = (data: ProcessedData) => {
    setProcessedData(data);
    setImportStep('preview');
  };

  const handleImport = () => {
    // Here we would normally process the data to save to backend
    toast.success('Contacts imported successfully');
    setImportStep('success');
  };

  const resetImport = () => {
    setSelectedFile(null);
    setProcessedData(null);
    setImportStep('upload');
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        description="Manage and organize your WhatsApp contacts"
      />
      
      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">
            <Users className="mr-2 h-4 w-4" />
            All Contacts
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload className="mr-2 h-4 w-4" />
            Import Contacts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Contacts</CardTitle>
              <CardDescription>
                Manage your WhatsApp contacts database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                This is a placeholder for the contacts management interface.
                {mockContacts.length} contacts loaded.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="import" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Contacts</CardTitle>
              <CardDescription>
                Upload a file to import contacts to your database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {importStep === 'upload' && (
                <div className="space-y-4 py-4">
                  <FileUpload
                    acceptedTypes={['csv', 'xlsx', 'json', 'vcf']}
                    maxSizeInMB={10}
                    onFileSelect={handleFileSelect}
                    onFileClear={handleFileClear}
                    buttonText="Select contacts file"
                    dragInactiveText="or drag and drop contacts file here"
                  />
                  
                  {selectedFile && (
                    <div className="mt-4">
                      <FileProcessor
                        file={selectedFile}
                        onProcessed={handleDataProcessed}
                        requiredColumns={['name', 'phoneNumber']}
                      >
                        <div className="flex justify-center p-4">
                          <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent" />
                          <span className="ml-2">Processing file...</span>
                        </div>
                      </FileProcessor>
                    </div>
                  )}
                </div>
              )}
              
              {importStep === 'preview' && processedData && (
                <div className="space-y-4">
                  <FilePreview 
                    data={processedData}
                    maxRows={10}
                    includeSearch={true}
                  />
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={resetImport}>
                      Cancel
                    </Button>
                    <Button onClick={handleImport}>
                      Import Contacts
                    </Button>
                  </div>
                </div>
              )}
              
              {importStep === 'success' && (
                <div className="text-center p-8 space-y-4">
                  <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium">Import Successful</h3>
                  <p className="text-sm text-muted-foreground">
                    {processedData?.data.length} contacts have been successfully imported
                  </p>
                  <Button onClick={resetImport} className="mt-4">
                    Import More Contacts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
