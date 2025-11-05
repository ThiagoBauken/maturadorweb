
export interface VerificationData {
  id: string;
  phoneNumber: string;
  name?: string;
  status: 'valid' | 'invalid' | 'pending';
  verificationDate?: string;
}
