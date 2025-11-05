
import { ReactNode, createContext, useContext, useState } from 'react';
import { useMessageTemplates } from '../hooks/useMessageTemplates';

interface MessagingContextType {
  messageTemplates: string[];
  setMessageTemplates: (templates: string[]) => void;
  messageText: string;
  setMessageText: (text: string) => void;
  messageVariation: boolean;
  setMessageVariation: (variation: boolean) => void;
  emojiVariation: boolean;
  setEmojiVariation: (variation: boolean) => void;
  messageVariationPercentage: number;
  setMessageVariationPercentage: (percentage: number) => void;
  typingDelay: boolean;
  setTypingDelay: (delay: boolean) => void;
  readReceipts: boolean;
  setReadReceipts: (receipts: boolean) => void;
  responseSimulation: boolean;
  setResponseSimulation: (simulation: boolean) => void;
  isGeneratingMessages: boolean;
  aiVariationsCount: number;
  setAiVariationsCount: (count: number) => void;
  showAiDialog: boolean;
  setShowAiDialog: (show: boolean) => void;
  addMessageTemplate: () => void;
  updateMessageTemplate: (index: number, value: string) => void;
  removeMessageTemplate: (index: number) => void;
  generateAiMessageVariations: () => void;
  mediaUrl: string;
  setMediaUrl: (url: string) => void;
  mediaType: 'image' | 'video' | 'none';
  setMediaType: (type: 'image' | 'video' | 'none') => void;
  mediaOnly: boolean;
  setMediaOnly: (mediaOnly: boolean) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const messagingHook = useMessageTemplates();
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [mediaOnly, setMediaOnly] = useState<boolean>(false);
  
  const value: MessagingContextType = {
    ...messagingHook,
    mediaUrl,
    setMediaUrl,
    mediaType,
    setMediaType,
    mediaOnly,
    setMediaOnly,
  };
  
  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessagingContext() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessagingContext must be used within a MessagingProvider');
  }
  return context;
}
