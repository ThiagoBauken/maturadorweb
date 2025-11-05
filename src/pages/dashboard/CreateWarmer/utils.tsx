
import { Flame, Zap, Users, Smartphone } from 'lucide-react';
import React from 'react';
import { WarmerType } from '@/components/warmers';

export const getTypeIcon = (type: WarmerType) => {
  if (type === 'standard-warmer') {
    return <Flame className="h-5 w-5 text-green-500" />;
  } else {
    return <Zap className="h-5 w-5 text-orange-500" />;
  }
};

export const getTypeText = (type: WarmerType) => {
  if (type === 'standard-warmer') {
    return 'Standard Warmer';
  } else {
    return 'Advanced Warmer';
  }
};

export const getSubtypeIcon = (subType: string) => {
  if (subType === 'number-to-group') {
    return <Users className="h-5 w-5 text-purple-500" />;
  } else {
    return <Smartphone className="h-5 w-5 text-blue-500" />;
  }
};

export const getSubtypeText = (subType: string) => {
  if (subType === 'number-to-group') {
    return 'Number to Group';
  } else {
    return 'Number to Number';
  }
};

export const weekDays = [
  { value: "monday", label: "Segunda" },
  { value: "tuesday", label: "Terça" },
  { value: "wednesday", label: "Quarta" },
  { value: "thursday", label: "Quinta" },
  { value: "friday", label: "Sexta" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" }
];

export const availableSessions = [
  { id: '1', name: 'Main Account', phone: '+5511999998888', status: 'connected' },
  { id: '2', name: 'Support Account', phone: '+5511977776666', status: 'connected' },
  { id: '3', name: 'Sales Team 1', phone: '+5511955554444', status: 'disconnected' },
];
