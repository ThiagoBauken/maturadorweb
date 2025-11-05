
import { useState } from 'react';
import { toast } from 'sonner';
import { useRecipientState } from './useRecipientState';
import { usePhoneNumberFormatter } from './usePhoneNumberFormatter';
import { useFileProcessor } from './useFileProcessor';
import { MouseEvent } from 'react';

/**
 * Combined hook that provides all recipient list functionality
 */
export const useRecipientList = (setSelectedContacts: (contacts: string[]) => void) => {
  const {
    recipientListText,
    setRecipientListText,
    processRecipientList: baseProcessRecipientList,
    removeDuplicates,
    duplicateCheckPerformed,
    setDuplicateCheckPerformed
  } = useRecipientState(setSelectedContacts);
  
  const { formatPhoneNumber, formatPhoneNumbers } = usePhoneNumberFormatter();
  
  const { handleFileUpload, addContactsFromFile } = useFileProcessor(
    setRecipientListText,
    setSelectedContacts
  );

  // Enhanced process function that formats phone numbers
  const processRecipientList = () => {
    const contacts = baseProcessRecipientList();
    if (contacts.length > 0) {
      const formattedContacts = formatPhoneNumbers(contacts);
      setRecipientListText(formattedContacts.join('\n'));
      setSelectedContacts(formattedContacts);
      return formattedContacts;
    }
    return contacts;
  };

  // Handler for adding contacts from text input
  const addContactsFromText = () => {
    const contacts = processRecipientList();
    if (contacts.length === 0) {
      toast.error('No valid phone numbers found');
      return;
    }
    
    setSelectedContacts(contacts);
    toast.success(`${contacts.length} contacts added`);
  };

  return {
    recipientListText,
    setRecipientListText,
    processRecipientList,
    addContactsFromText,
    addContactsFromFile,
    handleFileUpload,
    removeDuplicates,
    formatPhoneNumber,
    duplicateCheckPerformed,
    setDuplicateCheckPerformed
  };
};

// Re-export all hooks for direct access if needed
export * from './useRecipientState';
export * from './usePhoneNumberFormatter';
export * from './useFileProcessor';
