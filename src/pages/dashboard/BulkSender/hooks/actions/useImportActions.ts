
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

interface ImportActionsProps {
  navigate: NavigateFunction;
  setSelectedContacts?: (contacts: string[]) => void;
}

export function useImportActions({ navigate, setSelectedContacts }: ImportActionsProps) {
  const handleImportFromVerifier = () => {
    const verifiedNumbersJson = localStorage.getItem('verified_numbers');
    if (!verifiedNumbersJson) {
      toast.error('No verified numbers found. Please verify numbers first.');
      navigate('/verifier');
      return [];
    }
    
    try {
      const verifiedNumbers = JSON.parse(verifiedNumbersJson);
      
      if (Array.isArray(verifiedNumbers) && verifiedNumbers.length > 0) {
        if (verifiedNumbers[0].phoneNumber) {
          const phoneNumbers = verifiedNumbers.map((contact: any) => contact.phoneNumber);
          if (phoneNumbers.length > 0) {
            const uniquePhoneNumbers = [...new Set(phoneNumbers)];
            toast.success(`Imported ${uniquePhoneNumbers.length} verified contacts`);
            
            // Update selected contacts if the setter is provided
            if (setSelectedContacts) {
              setSelectedContacts(uniquePhoneNumbers);
            }
            
            localStorage.removeItem('verified_numbers');
            return uniquePhoneNumbers;
          }
        } else {
          const uniqueNumbers = [...new Set(verifiedNumbers)];
          toast.success(`Imported ${uniqueNumbers.length} verified contacts`);
          
          // Update selected contacts if the setter is provided
          if (setSelectedContacts) {
            setSelectedContacts(uniqueNumbers);
          }
          
          localStorage.removeItem('verified_numbers');
          return uniqueNumbers;
        }
      }
      
      toast.error('No valid phone numbers found in verified numbers');
    } catch (error) {
      toast.error('Failed to import verified numbers');
      console.error(error);
    }
    return [];
  };
  
  return {
    handleImportFromVerifier
  };
}
