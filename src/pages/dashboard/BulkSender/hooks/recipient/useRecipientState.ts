
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook for managing recipient list state
 */
export const useRecipientState = (setSelectedContacts: (contacts: string[]) => void) => {
  const [recipientListText, setRecipientListText] = useState<string>('');
  const [duplicateCheckPerformed, setDuplicateCheckPerformed] = useState<boolean>(false);
  const [autoProcessEnabled, setAutoProcessEnabled] = useState<boolean>(true);

  // Process the recipient list text into an array of contacts
  const processRecipientList = () => {
    if (!recipientListText.trim()) return [];
    
    // Split by newlines and filter out empty lines
    const lines = recipientListText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Update the selected contacts
    setSelectedContacts(lines);
    
    return lines;
  };

  // Auto-process the list whenever it changes (if enabled)
  useEffect(() => {
    if (autoProcessEnabled && recipientListText.trim()) {
      const debounceTimer = setTimeout(() => {
        const contacts = processRecipientList();
        if (contacts && contacts.length > 0) {
          removeDuplicates(contacts);
        }
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [recipientListText, autoProcessEnabled]);

  // Remove duplicate phone numbers from the list
  const removeDuplicates = (numbers: string[]) => {
    if (!numbers || numbers.length === 0) {
      toast.error("No phone numbers to process");
      return [];
    }
    
    // Format and process numbers if text provided but no numbers array
    const formattedNumbers = numbers.length > 0 ? numbers : processRecipientList();
    
    // Remove duplicates using a Set
    const uniqueNumbers = [...new Set(formattedNumbers)];
    
    // Update the text and selected contacts
    setRecipientListText(uniqueNumbers.join('\n'));
    setSelectedContacts(uniqueNumbers);
    
    // Show success message - only if duplicates were found or we haven't shown this message already
    if (uniqueNumbers.length < formattedNumbers.length) {
      toast.success(`Removed ${formattedNumbers.length - uniqueNumbers.length} duplicate numbers`);
      setDuplicateCheckPerformed(true);
    } else if (!duplicateCheckPerformed) {
      // Only show this message the first time the check is performed
      toast.info("No duplicate numbers found");
      setDuplicateCheckPerformed(true);
    }
    
    return uniqueNumbers;
  };

  return {
    recipientListText,
    setRecipientListText,
    processRecipientList,
    removeDuplicates,
    duplicateCheckPerformed,
    setDuplicateCheckPerformed,
    autoProcessEnabled,
    setAutoProcessEnabled
  };
};
