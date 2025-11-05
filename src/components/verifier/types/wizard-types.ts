
import { VerificationData } from '../types';

export interface VerificationWizardProps {
  onComplete?: (results: VerificationData[]) => void;
  onCancel?: () => void;
}

export interface VerificationConfig {
  batchSize: number;
  verificationMethod: 'api' | 'web' | 'hybrid';
  concurrentRequests: number;
  retryCount: number;
  timeoutSeconds: number;
  enableCountryValidation?: boolean;
  validateDuplicates?: boolean;
  sessionLimits: {
    enabled: boolean;
    maxNumbersPerSession: number;
    maxSessionsPerDay: number;
    cooldownPeriod: number; // in seconds
  };
  rateLimits: {
    enabled: boolean;
    requestsPerMinute: number;
    maxDailyRequests: number;
  };
}

export interface ImportData {
  phoneNumbers: string[];
  names?: string[];
  fileData?: any;
  source: 'file' | 'manual';
  countryCode?: string;
  sourceFiles?: File[];
  fileRanges?: { startIndex: number; endIndex: number }[];
}

// Default configuration settings
export const defaultConfig: VerificationConfig = {
  batchSize: 100,
  verificationMethod: 'api',
  concurrentRequests: 5,
  retryCount: 2,
  timeoutSeconds: 30,
  enableCountryValidation: true,
  validateDuplicates: true,
  sessionLimits: {
    enabled: true,
    maxNumbersPerSession: 50,
    maxSessionsPerDay: 2,
    cooldownPeriod: 3600
  },
  rateLimits: {
    enabled: true,
    requestsPerMinute: 10,
    maxDailyRequests: 200
  }
};

// Saved configurations key in localStorage
export const SAVED_CONFIGS_KEY = 'whatsapp_verifier_saved_configs';
