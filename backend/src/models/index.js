// Export all models for easy importing
import User from './User.js';
import Session from './Session.js';
import VerificationCampaign from './VerificationCampaign.js';
import PhoneNumber from './PhoneNumber.js';
import Warmer from './Warmer.js';
import { BulkCampaign, Recipient } from './BulkCampaign.js';

// Setup any additional model relationships here

export {
  User,
  Session,
  VerificationCampaign,
  PhoneNumber,
  Warmer,
  BulkCampaign,
  Recipient
};
