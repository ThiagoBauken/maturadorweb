
/**
 * Hook for phone number formatting functions
 */
export const usePhoneNumberFormatter = () => {
  // Format phone numbers to the correct standard (adding +55 and 9 if needed)
  const formatPhoneNumber = (number: string): string => {
    // Remove all non-digit characters
    const digits = number.replace(/\D/g, '');
    
    // Check if already has country code (for Brazil +55)
    if (number.startsWith('+')) {
      // It already has a country code, just ensure it has the 9th digit
      const countryCode = number.slice(0, number.length - digits.length + 2);
      
      // For Brazilian numbers
      if (countryCode === '+55' && digits.length === 10) {
        // Add the 9th digit if it's missing (DDD + 8 digits)
        return `+55${digits.slice(0, 2)}9${digits.slice(2)}`;
      }
      
      // Check if it's a Brazilian number without the 9th digit
      // For numbers like +554784756013 (missing 9 after DDD)
      if (countryCode === '+55' && digits.length === 11 && digits.charAt(2) !== '9') {
        return `+55${digits.slice(0, 2)}9${digits.slice(2)}`;
      }
      
      return number; // Keep it as is if it's not a Brazilian number or already has 9th digit
    } else {
      // No country code, assume Brazilian number
      if (digits.length === 11) {
        // It's probably a complete Brazilian number with the 9th digit (DDD + 9th + 8 digits)
        return `+55${digits}`;
      } else if (digits.length === 10) {
        // It's probably missing the 9th digit (DDD + 8 digits)
        return `+55${digits.slice(0, 2)}9${digits.slice(2)}`;
      } else if (digits.length === 9) {
        // It's just the number without DDD
        // Try to assume a default DDD (11 for São Paulo)
        return `+5511${digits}`;
      } else if (digits.length === 8) {
        // It's just the number without DDD and without 9th digit
        // Assume default DDD (11 for São Paulo) and add 9th digit
        return `+55119${digits}`;
      }
      
      // For other cases, just add +55
      return `+55${digits}`;
    }
  };

  // Format a list of phone numbers
  const formatPhoneNumbers = (numbers: string[]): string[] => {
    return numbers.map(formatPhoneNumber);
  };

  return {
    formatPhoneNumber,
    formatPhoneNumbers
  };
};
