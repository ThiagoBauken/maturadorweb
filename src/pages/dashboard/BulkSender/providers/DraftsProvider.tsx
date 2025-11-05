
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageDraft } from '../types';

interface DraftsContextType {
  projectName: string;
  setProjectName: (name: string) => void;
  savedMessageDrafts: MessageDraft[];
  activeDraftId: string | null;
  saveMessageDraft: () => boolean;
  loadMessageDraft: (id: string) => void;
  deleteMessageDraft: (id: string) => void;
}

interface DraftsProviderProps {
  children: ReactNode;
  messageTemplates: string[];
  setMessageTemplates: (templates: string[]) => void;
  messageVariation: boolean;
  setMessageVariation: (variation: boolean) => void;
  messageVariationPercentage: number;
  setMessageVariationPercentage: (percentage: number) => void;
  scheduleEnabled: boolean;
  setScheduleEnabled: (enabled: boolean) => void;
  scheduleDate: string;
  setScheduleDate: (date: string) => void;
  scheduleTime: string;
  setScheduleTime: (time: string) => void;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  mediaOnly?: boolean;
}

const DraftsContext = createContext<DraftsContextType | undefined>(undefined);

export function DraftsProvider({ 
  children,
  messageTemplates,
  setMessageTemplates,
  messageVariation,
  setMessageVariation,
  messageVariationPercentage,
  setMessageVariationPercentage,
  scheduleEnabled,
  setScheduleEnabled,
  scheduleDate,
  setScheduleDate,
  scheduleTime,
  setScheduleTime,
  mediaUrl = '',
  mediaType = 'none',
  mediaOnly = false
}: DraftsProviderProps) {
  const [projectName, setProjectName] = useState('');
  const [savedMessageDrafts, setSavedMessageDrafts] = useState<MessageDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  useEffect(() => {
    const savedDrafts = localStorage.getItem('message_drafts');
    if (savedDrafts) {
      try {
        setSavedMessageDrafts(JSON.parse(savedDrafts));
      } catch (error) {
        console.error('Failed to load message drafts', error);
      }
    }
  }, []);
  
  const saveMessageDraft = () => {
    // Check for content availability
    const hasMedia = mediaUrl && mediaType !== 'none';
    const hasMessageContent = messageTemplates.some(template => template.trim().length > 0);
    const hasContent = hasMessageContent || hasMedia;
    
    // Only require project name to save a draft
    if (!projectName) {
      toast.error('Please enter a project name before saving');
      return false;
    }
    
    // Need either message content or media
    if (!hasContent) {
      toast.error('Cannot save an empty message draft. Please add text or media content.');
      return false;
    }
    
    const newDraft: MessageDraft = {
      id: activeDraftId || Date.now().toString(),
      name: projectName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageTemplates: [...messageTemplates],
      messageVariation,
      messageVariationPercentage,
      scheduleEnabled,
      scheduleDate,
      scheduleTime,
      mediaUrl,
      mediaType,
      mediaOnly
    };
    
    setSavedMessageDrafts(prev => {
      const updatedDrafts = activeDraftId 
        ? prev.map(draft => draft.id === activeDraftId ? newDraft : draft)
        : [...prev, newDraft];
      
      localStorage.setItem('message_drafts', JSON.stringify(updatedDrafts));
      return updatedDrafts;
    });
    
    setActiveDraftId(newDraft.id);
    toast.success(`Draft "${newDraft.name}" saved`);
    return true;
  };
  
  const loadMessageDraft = (draftId: string) => {
    const draft = savedMessageDrafts.find(d => d.id === draftId);
    if (!draft) return;
    
    setMessageTemplates([...draft.messageTemplates]);
    setMessageVariation(draft.messageVariation);
    setMessageVariationPercentage(draft.messageVariationPercentage || 50);
    setScheduleEnabled(draft.scheduleEnabled);
    setScheduleDate(draft.scheduleDate);
    setScheduleTime(draft.scheduleTime);
    
    setProjectName(draft.name);
    setActiveDraftId(draft.id);
    
    toast.success(`Draft "${draft.name}" loaded`);
  };
  
  const deleteMessageDraft = (draftId: string) => {
    setSavedMessageDrafts(prev => {
      const updatedDrafts = prev.filter(draft => draft.id !== draftId);
      localStorage.setItem('message_drafts', JSON.stringify(updatedDrafts));
      return updatedDrafts;
    });
    
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
    }
    
    toast.success('Draft deleted');
  };

  const value: DraftsContextType = {
    projectName,
    setProjectName,
    savedMessageDrafts,
    activeDraftId,
    saveMessageDraft,
    loadMessageDraft,
    deleteMessageDraft
  };
  
  return (
    <DraftsContext.Provider value={value}>
      {children}
    </DraftsContext.Provider>
  );
}

export function useDraftsContext() {
  const context = useContext(DraftsContext);
  if (context === undefined) {
    throw new Error('useDraftsContext must be used within a DraftsProvider');
  }
  return context;
}
