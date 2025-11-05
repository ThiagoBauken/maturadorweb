
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  Sparkles,
  Save,
  Copy,
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

interface BasicMessageTabProps {
  messageText: string;
  setMessageText: (text: string) => void;
  typingDelay: boolean;
  setTypingDelay: (delay: boolean) => void;
  handleGenerateVariations: () => void;
  handleSaveDraft: () => void;
  setShowSavedDrafts: (show: boolean) => void;
  showSavedDrafts: boolean;
  isGeneratingMessages: boolean;
}

export function BasicMessageTab({
  messageText,
  setMessageText,
  typingDelay,
  setTypingDelay,
  handleGenerateVariations,
  handleSaveDraft,
  setShowSavedDrafts,
  showSavedDrafts,
  isGeneratingMessages
}: BasicMessageTabProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
  };

  const handleGenerate = () => {
    if (!messageText || messageText.trim().length === 0) {
      toast.error('Please enter a message first');
      return;
    }
    handleGenerateVariations();
  };

  const hasMessage = messageText && messageText.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="message-text">Message Text</Label>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleGenerate}
            className="h-6 text-xs flex items-center gap-1"
            disabled={isGeneratingMessages || !hasMessage}
          >
            <Sparkles className="h-3 w-3" />
            {isGeneratingMessages ? 'Generating...' : 'AI Generate'}
          </Button>
        </div>
        <Textarea 
          id="message-text"
          placeholder="Enter your message here..."
          value={messageText}
          onChange={handleMessageChange}
          rows={8}
          className={!hasMessage ? "border-amber-300 focus-visible:ring-amber-400" : ""}
        />
        <div className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Characters: {messageText.length}
          </p>
          {!hasMessage && (
            <p className="text-xs text-amber-600">
              Please enter a message
            </p>
          )}
        </div>
      </div>
      
      <Collapsible
        open={isAdvancedOpen}
        onOpenChange={setIsAdvancedOpen}
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex w-full justify-between p-0 h-8"
          >
            <span className="text-xs font-medium">
              Advanced Settings
            </span>
            {isAdvancedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2 border rounded-md p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="typing-delay" className="text-sm">Show typing indicator</Label>
                <p className="text-xs text-muted-foreground">Simulate typing before sending message</p>
              </div>
              <Switch 
                id="typing-delay" 
                checked={typingDelay}
                onCheckedChange={setTypingDelay}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleSaveDraft}
          className="text-xs flex items-center gap-1"
          disabled={!hasMessage}
        >
          <Save className="h-3 w-3" />
          Save Draft
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setShowSavedDrafts(!showSavedDrafts)}
          className="text-xs flex items-center gap-1"
        >
          <Copy className="h-3 w-3" />
          {showSavedDrafts ? 'Hide Drafts' : 'Load Draft'}
        </Button>
      </div>
    </div>
  );
}
