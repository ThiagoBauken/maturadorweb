
import { useState } from 'react';
import { toast } from 'sonner';

export function useMessageTemplates() {
  const [messageTemplates, setMessageTemplates] = useState<string[]>(['']);
  const [messageText, setMessageText] = useState<string>('');
  const [messageVariation, setMessageVariation] = useState<boolean>(false);
  const [emojiVariation, setEmojiVariation] = useState<boolean>(false);
  const [messageVariationPercentage, setMessageVariationPercentage] = useState<number>(20);
  const [typingDelay, setTypingDelay] = useState<boolean>(false);
  const [readReceipts, setReadReceipts] = useState<boolean>(true);
  const [responseSimulation, setResponseSimulation] = useState<boolean>(false);
  const [isGeneratingMessages, setIsGeneratingMessages] = useState<boolean>(false);
  const [aiVariationsCount, setAiVariationsCount] = useState<number>(5);
  const [showAiDialog, setShowAiDialog] = useState<boolean>(false);
  
  // Sync messageText with the first message template
  const syncMessageTextWithTemplates = () => {
    if (messageTemplates.length > 0 && messageText !== messageTemplates[0]) {
      setMessageTemplates([messageText, ...messageTemplates.slice(1)]);
    }
  };
  
  // Update message templates when messageText changes
  const updateMessageText = (text: string) => {
    setMessageText(text);
    if (messageTemplates.length > 0) {
      const updatedTemplates = [...messageTemplates];
      updatedTemplates[0] = text;
      setMessageTemplates(updatedTemplates);
    } else {
      setMessageTemplates([text]);
    }
  };

  const addMessageTemplate = () => {
    setMessageTemplates([...messageTemplates, '']);
  };

  const updateMessageTemplate = (index: number, value: string) => {
    const updatedTemplates = [...messageTemplates];
    updatedTemplates[index] = value;
    setMessageTemplates(updatedTemplates);
    
    // Update messageText if we're updating the first template
    if (index === 0) {
      setMessageText(value);
    }
  };

  const removeMessageTemplate = (index: number) => {
    if (index === 0) {
      toast.error("Cannot remove the main message template");
      return;
    }
    const updatedTemplates = messageTemplates.filter((_, i) => i !== index);
    setMessageTemplates(updatedTemplates);
  };

  const generateAiMessageVariations = (promptText: string = '') => {
    // Always check if we have a base message to work with
    const baseMessage = messageTemplates[0]?.trim() || messageText?.trim();
    
    if (!baseMessage || baseMessage.length === 0) {
      toast.error("Please enter a base message first");
      return;
    }
    
    setIsGeneratingMessages(true);
    
    // Mock AI message generation (in a real app, this would call an API)
    setTimeout(() => {
      try {
        const basePrompt = promptText || "Create variations of this message with different wording but same meaning";
        
        // Generate more diverse variations based on the prompt
        const variations = generateVariations(baseMessage, aiVariationsCount, promptText);
        
        // Update message templates with the original message and new variations
        const updatedTemplates = [messageTemplates[0], ...variations];
        setMessageTemplates(updatedTemplates);
        setMessageVariation(true);
        
        // Close the AI dialog
        setShowAiDialog(false);
        
        toast.success(`Generated ${variations.length} message variations successfully!`);
      } catch (error) {
        console.error("Error generating variations:", error);
        toast.error("Failed to generate message variations");
      } finally {
        setIsGeneratingMessages(false);
      }
    }, 1500);
  };

  // Helper function to generate more diverse variations
  const generateVariations = (baseMessage: string, count: number, prompt: string = '') => {
    const variations = [];
    const tones = [
      { name: 'casual', prefix: 'Hey there! ', suffix: ' What do you think?' },
      { name: 'formal', prefix: 'I would like to inform you that ', suffix: '. Looking forward to your response.' },
      { name: 'friendly', prefix: 'Just wanted to let you know ', suffix: ' 😊 Let me know your thoughts!' },
      { name: 'direct', prefix: '', suffix: ' Please reply when convenient.' },
      { name: 'enthusiastic', prefix: 'Exciting news! ', suffix: ' Can\'t wait to hear back! 🎉' },
      { name: 'questioning', prefix: 'I was wondering, ', suffix: ' What are your thoughts on this?' },
      { name: 'professional', prefix: 'I wanted to reach out regarding ', suffix: '. Please let me know if you need any clarification.' },
      { name: 'informative', prefix: 'Just to update you: ', suffix: '. Let me know if you need more information.' },
      { name: 'appreciative', prefix: 'I appreciate your time. ', suffix: '. Thanks in advance!' },
      { name: 'urgent', prefix: 'Important: ', suffix: ' Please respond as soon as possible.' }
    ];
    
    // Use prompt to influence variation style if provided
    const promptLower = prompt.toLowerCase();
    let selectedTones = [...tones];
    
    if (promptLower.includes('casual') || promptLower.includes('informal')) {
      selectedTones = tones.filter(t => ['casual', 'friendly', 'enthusiastic'].includes(t.name));
    } else if (promptLower.includes('formal') || promptLower.includes('professional')) {
      selectedTones = tones.filter(t => ['formal', 'professional', 'informative'].includes(t.name));
    } else if (promptLower.includes('question') || promptLower.includes('ask')) {
      selectedTones = tones.filter(t => ['questioning', 'casual', 'friendly'].includes(t.name));
    }
    
    // Generate variations
    for (let i = 0; i < count; i++) {
      const toneIndex = i % selectedTones.length;
      const { prefix, suffix } = selectedTones[toneIndex];
      
      // For shorter messages, don't repeat the message in modifications
      const isShortMessage = baseMessage.length < 50;
      let variation;
      
      if (isShortMessage) {
        variation = `${prefix}${baseMessage}${suffix}`;
      } else {
        // For longer messages, try to rephrase parts of it
        const sentences = baseMessage.split(/(?<=[.!?])\s+/);
        if (sentences.length > 1) {
          // Modify some sentences
          const modifiedSentences = sentences.map((sentence, idx) => {
            if (idx === 0) return `${prefix}${sentence}`;
            if (idx === sentences.length - 1) return `${sentence}${suffix}`;
            return sentence;
          });
          variation = modifiedSentences.join(' ');
        } else {
          variation = `${prefix}${baseMessage}${suffix}`;
        }
      }
      
      variations.push(variation);
    }
    
    return variations;
  };

  return {
    messageTemplates,
    setMessageTemplates,
    messageText,
    setMessageText: updateMessageText,
    messageVariation,
    setMessageVariation,
    emojiVariation,
    setEmojiVariation,
    messageVariationPercentage,
    setMessageVariationPercentage,
    typingDelay,
    setTypingDelay,
    readReceipts,
    setReadReceipts,
    responseSimulation,
    setResponseSimulation,
    isGeneratingMessages,
    setIsGeneratingMessages,
    aiVariationsCount,
    setAiVariationsCount,
    showAiDialog,
    setShowAiDialog,
    addMessageTemplate,
    updateMessageTemplate,
    removeMessageTemplate,
    generateAiMessageVariations,
    syncMessageTextWithTemplates
  };
}
