
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ImportData } from '../../types/wizard-types';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';
import { toast } from 'sonner';

interface ManualInputTabProps {
  importData: ImportData;
  setImportData: (data: ImportData) => void;
  initialNumbers?: string;
}

export function ManualInputTab({ importData, setImportData, initialNumbers = '' }: ManualInputTabProps) {
  const [numbersText, setNumbersText] = useState(initialNumbers);
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  // Load initial numbers if provided
  useEffect(() => {
    if (initialNumbers) {
      setNumbersText(initialNumbers);
    }
  }, [initialNumbers]);
  
  const handleImport = () => {
    if (!numbersText.trim()) {
      toast.error('Please enter phone numbers');
      return;
    }
    
    // Parse phone numbers from text
    const numbers = numbersText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => formatPhoneNumber(line));
    
    // Remove duplicates
    const uniqueNumbers = [...new Set(numbers)];
    
    if (uniqueNumbers.length < numbers.length) {
      toast.info(`Removed ${numbers.length - uniqueNumbers.length} duplicate numbers`);
    }
    
    if (uniqueNumbers.length === 0) {
      toast.error('No valid phone numbers found');
      return;
    }
    
    // Format numbers and update the import data
    setImportData({
      ...importData,
      phoneNumbers: uniqueNumbers,
      source: 'manual'
    });
    
    // Update the text area with formatted numbers
    setNumbersText(uniqueNumbers.join('\n'));
    
    toast.success(`${uniqueNumbers.length} phone numbers imported`);
  };
  
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter phone numbers, one per line"
        rows={10}
        value={numbersText}
        onChange={(e) => setNumbersText(e.target.value)}
        className="font-mono"
      />
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Enter one phone number per line. Numbers will be automatically formatted.
        </p>
        <Button onClick={handleImport}>Import Numbers</Button>
      </div>
    </div>
  );
}
