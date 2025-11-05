
import { VerificationData } from './types';

export const mockVerificationData: VerificationData[] = [
  {
    id: '1',
    phoneNumber: '+5511999991111',
    name: 'João Silva',
    status: 'valid',
    verificationDate: '2023-08-15 14:30'
  },
  {
    id: '2',
    phoneNumber: '+5511999992222',
    name: 'Maria Souza',
    status: 'valid',
    verificationDate: '2023-08-15 14:35'
  },
  {
    id: '3',
    phoneNumber: '+5511999993333',
    name: 'Pedro Santos',
    status: 'invalid',
    verificationDate: '2023-08-15 14:40'
  },
  {
    id: '4',
    phoneNumber: '+5511999994444',
    name: 'Ana Oliveira',
    status: 'pending'
  },
  {
    id: '5',
    phoneNumber: '+5511999995555',
    name: 'Lucas Ferreira',
    status: 'pending'
  },
  {
    id: '6',
    phoneNumber: '+5511999996666',
    status: 'valid',
    verificationDate: '2023-08-15 15:10'
  },
  {
    id: '7',
    phoneNumber: '+5511999997777',
    status: 'invalid',
    verificationDate: '2023-08-15 15:15'
  }
];
