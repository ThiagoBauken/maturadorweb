
import { ScheduleConfig, Day } from '@/components/common/schedule';
import { WarmerType } from '@/components/warmers';

export interface MediaFrequency {
  images: number;
  videos: number;
  audios: number;
  stickers: number;
}

export interface VerifiedNumber {
  phoneNumber: string;
  status: 'valid' | 'invalid' | 'unknown';
  countryCode?: string;
  reason?: string;
}

export interface WarmerForm {
  name: string;
  description: string;
  type: WarmerType;
  subType: 'number-to-number' | 'number-to-group';
  accounts: string[];
  targetCount: number | null;
  messageTemplates: string[];
  schedule: ScheduleConfig;
  enableEmojis: boolean;
  enableTypingIndicator: boolean;
  enableReadReceipts: boolean;
  groupName: string;
  targetNumbers: VerifiedNumber[];
  minDelay: number;
  maxDelay: number;
  useRandomDelay: boolean;
  restPeriodEnabled: boolean;
  restPeriodStart: string;
  restPeriodEnd: string;
  restDays: Day[];
  warmerDuration: number;
  mediaEnabled: boolean;
  mediaTypes: string[];
  mediaFrequency: MediaFrequency;
  aiEnabled: boolean;
  aiProvider: "deepseek" | "openai";
  aiPrompt: string;
  aiReplyPercentage: number;
  aiApiKey: string;
  numberRotation: boolean;
  simultaneousSending: boolean; // New field for simultaneous sending
  rotationMode: 'sequential' | 'random'; // New field for rotation mode
  delayPattern: 'fixed' | 'random' | 'progressive';
  randomTimeVariation: number;
  progressiveWarmingEnabled: boolean;
  dailyLimits: boolean;
  maxDailyMessages: number;
  restIntervalEnabled: boolean;
  minRestDuration: number;
  maxRestDuration: number;
  restFrequencyType: 'message-count' | 'time-period';
  messageCountBeforeRest: number;
  timePeriodBeforeRest: number;
}
