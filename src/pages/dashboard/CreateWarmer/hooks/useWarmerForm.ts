
import { useState, useEffect } from 'react';
import { WarmerForm, VerifiedNumber } from '../types';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { WarmerType } from '@/components/warmers';
import { ScheduleConfig } from '@/components/common/schedule';
import { Day } from '@/components/common/schedule';

export const useWarmerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fromVerifier = queryParams.get('from') === 'verifier';
  const nameFromQuery = queryParams.get('name');
  const typeFromQuery = queryParams.get('type') as WarmerType | null;
  const subTypeFromQuery = queryParams.get('subType') as 'number-to-number' | 'number-to-group' | null;
  const editId = queryParams.get('edit');
  const isEditing = !!editId;

  const [formData, setFormData] = useState<WarmerForm>({
    name: nameFromQuery || '',
    description: '',
    type: typeFromQuery || 'advanced-warmer',
    subType: subTypeFromQuery || 'number-to-number',
    accounts: [],
    targetCount: null,
    messageTemplates: ['Oi! Como você está hoje?', 'Olá, tudo bem com você?'],
    schedule: {
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as Day[],
      timeRanges: [{ start: '09:00', end: '17:00' }],
    },
    enableEmojis: true,
    enableTypingIndicator: true,
    enableReadReceipts: true,
    groupName: '',
    targetNumbers: [],
    minDelay: 30,
    maxDelay: 90,
    useRandomDelay: true,
    restPeriodEnabled: false,
    restPeriodStart: '22:00',
    restPeriodEnd: '08:00',
    restDays: ['saturday', 'sunday'],
    warmerDuration: 7,
    mediaEnabled: true,
    mediaTypes: ['image', 'sticker'],
    mediaFrequency: {
      images: 2,
      videos: 1,
      audios: 1,
      stickers: 3
    },
    aiEnabled: true,
    aiProvider: 'deepseek' as "deepseek" | "openai",
    aiPrompt: 'Você é um contato de WhatsApp e vai simular uma conversa natural. Suas respostas devem ser curtas, informais e com erros de digitação ocasionais.',
    aiReplyPercentage: 100,
    aiApiKey: '',
    numberRotation: true,
    simultaneousSending: false, // Default to false (sequential sending)
    rotationMode: 'random', // Default to random rotation
    delayPattern: 'random',
    randomTimeVariation: 20,
    progressiveWarmingEnabled: true,
    dailyLimits: true,
    maxDailyMessages: 40,
    restIntervalEnabled: true,
    minRestDuration: 5,
    maxRestDuration: 35,
    restFrequencyType: 'message-count',
    messageCountBeforeRest: 15,
    timePeriodBeforeRest: 60
  });

  useEffect(() => {
    if (isEditing && editId) {
      console.log(`Loading warmer with ID: ${editId}`);
      setTimeout(() => {
        if (subTypeFromQuery === 'number-to-group') {
          setFormData(prev => ({
            ...prev,
            name: 'Marketing Group Warmer (Edited)',
            description: 'This is an edited group warmer',
            groupName: 'Marketing Team Chat',
            targetCount: 20,
            accounts: ['1'],
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            name: 'Edited Advanced Warmer',
            description: 'This is an edited advanced warmer',
            targetCount: 40,
            accounts: ['1', '2'],
          }));
        }
        toast.success('Warmer data loaded successfully');
      }, 500);
    }
  }, [isEditing, editId, subTypeFromQuery]);

  useEffect(() => {
    if (fromVerifier) {
      try {
        const verifiedNumbersJson = localStorage.getItem('verified_numbers');
        if (verifiedNumbersJson) {
          const verifiedNumbers: VerifiedNumber[] = JSON.parse(verifiedNumbersJson);
          setFormData(prev => ({ 
            ...prev, 
            targetNumbers: verifiedNumbers,
            targetCount: Math.min(verifiedNumbers.length, prev.targetCount || Number.MAX_SAFE_INTEGER)
          }));
          localStorage.removeItem('verified_numbers');
        }
      } catch (error) {
        console.error('Error loading verified numbers:', error);
      }
    }
  }, [fromVerifier]);

  useEffect(() => {
    if (queryParams.get('from') === 'bulk-sender') {
      try {
        const warmerSettingsJson = localStorage.getItem('warmer_settings');
        if (warmerSettingsJson) {
          const warmerSettings = JSON.parse(warmerSettingsJson);
          
          setFormData(prev => ({
            ...prev,
            ...warmerSettings,
            type: typeFromQuery || warmerSettings.type || prev.type,
            name: nameFromQuery || warmerSettings.name || prev.name,
            schedule: {
              days: warmerSettings.schedule?.days as Day[] || prev.schedule.days,
              timeRanges: warmerSettings.schedule?.timeRanges || prev.schedule.timeRanges
            }
          }));
          
          localStorage.removeItem('warmer_settings');
          
          toast.success('Configurações importadas do Bulk Sender');
        }
      } catch (error) {
        console.error('Error loading warmer settings:', error);
      }
    }
  }, [queryParams, typeFromQuery, nameFromQuery]);

  const handleChange = (field: keyof WarmerForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleChange = (schedule: ScheduleConfig) => {
    setFormData(prev => ({ ...prev, schedule }));
  };

  const handleMediaFrequencyChange = (type: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFrequency: {
        ...prev.mediaFrequency,
        [type]: value
      }
    }));
  };

  const handleSubmit = () => {
    console.log('Warmer created/updated:', formData);
    toast.success(isEditing ? 'Warmer updated successfully!' : 'Warmer created successfully!');
    navigate('/warmers');
  };

  return {
    formData,
    isEditing,
    fromVerifier,
    handleChange,
    handleScheduleChange,
    handleMediaFrequencyChange,
    handleSubmit
  };
};
