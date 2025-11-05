
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ImportData, VerificationConfig } from '../types/wizard-types';
import { UploadCloud, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { ManualInputTab } from './import/ManualInputTab';
import { FileInputTab } from './import/FileInputTab';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';

interface ImportStepProps {
  importData: ImportData;
  setImportData: (data: ImportData) => void;
  config?: VerificationConfig;
}

export function ImportStep({ importData, setImportData, config }: ImportStepProps) {
  const [activeTab, setActiveTab] = useState<string>(importData.source || 'manual');
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  useEffect(() => {
    // If we have numbers already and are switching to the manual tab, 
    // update the textarea with the current phone numbers
    if (activeTab === 'manual' && importData.phoneNumbers.length > 0 && importData.source === 'manual') {
      // The numbers will be passed to ManualInputTab as initialNumbers
    }
  }, [activeTab, importData]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setImportData({
      ...importData,
      source: value as 'file' | 'manual'
    });
  };
  
  // Handle duplicate detection in imported data
  const handleImportDataUpdate = (newImportData: ImportData) => {
    if (config?.validateDuplicates && newImportData.phoneNumbers.length > 0) {
      // Format all phone numbers
      const formattedNumbers = newImportData.phoneNumbers.map(number => 
        formatPhoneNumber(number)
      );
      
      // Remove duplicates
      const uniqueNumbers = [...new Set(formattedNumbers)];
      
      // If duplicates were found, notify the user
      if (uniqueNumbers.length < formattedNumbers.length) {
        const duplicateCount = formattedNumbers.length - uniqueNumbers.length;
        toast.info(`Removed ${duplicateCount} duplicate phone number${duplicateCount !== 1 ? 's' : ''}`);
        
        // Update the import data with unique numbers
        newImportData = {
          ...newImportData,
          phoneNumbers: uniqueNumbers,
          // If names exist, we need to adjust them too (this is simplified)
          names: newImportData.names?.slice(0, uniqueNumbers.length)
        };
      } else {
        // Even if no duplicates, we still want to update with formatted numbers
        newImportData = {
          ...newImportData,
          phoneNumbers: formattedNumbers
        };
      }
    }
    
    setImportData(newImportData);
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Import Phone Numbers</h2>
      <p className="text-muted-foreground">
        Add the phone numbers you want to verify
      </p>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="manual" className="flex items-center">
            <Edit3 className="mr-2 h-4 w-4" />
            Manual Input
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center">
            <UploadCloud className="mr-2 h-4 w-4" />
            Import File
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <ManualInputTab 
                importData={importData}
                setImportData={handleImportDataUpdate}
                initialNumbers={importData.source === 'manual' ? importData.phoneNumbers.join('\n') : ''}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="file" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <FileInputTab 
                importData={importData}
                setImportData={handleImportDataUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
