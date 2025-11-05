
import React, { useState, useEffect } from 'react';
import { useBulkSender } from '../hooks/useBulkSender';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function AIVariationDialog() {
  const {
    showAiDialog,
    setShowAiDialog,
    aiVariationsCount,
    setAiVariationsCount,
    isGeneratingMessages,
    generateAiMessageVariations,
    messageTemplates,
    messageText
  } = useBulkSender();

  const [prompt, setPrompt] = useState('');
  const [maxVariations, setMaxVariations] = useState(10);

  // Increase maximum variations to 10
  useEffect(() => {
    if (aiVariationsCount > maxVariations) {
      setAiVariationsCount(maxVariations);
    }
  }, [aiVariationsCount, maxVariations, setAiVariationsCount]);

  const handleGenerateVariations = () => {
    if (!hasBaseMessage) {
      toast.error('Please enter a message first');
      return;
    }
    
    // Call generateAiMessageVariations with the prompt
    // Make sure we call it without arguments if the function doesn't expect any
    generateAiMessageVariations();
  };

  // Check both messageTemplates and messageText to ensure we have content
  const hasMessageText = messageText && messageText.trim().length > 0;
  const hasTemplateMessage = messageTemplates && messageTemplates.length > 0 && messageTemplates[0]?.trim().length > 0;
  const hasBaseMessage = hasMessageText || hasTemplateMessage;
  
  // Determine which message to show
  const messageToShow = hasTemplateMessage ? messageTemplates[0] : (hasMessageText ? messageText : '');

  return (
    <Dialog open={showAiDialog} onOpenChange={setShowAiDialog}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Message Variations with AI</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Original Message</Label>
            {hasBaseMessage ? (
              <div className="p-3 border rounded-md bg-muted/50 min-h-[60px] whitespace-pre-wrap">
                {messageToShow}
              </div>
            ) : (
              <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                <AlertDescription className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please enter a message first in the Message Text area.</span>
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="variations-count" className="text-sm">Number of variations to generate</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="variations-count"
                  type="number"
                  min={1}
                  max={maxVariations}
                  value={aiVariationsCount}
                  onChange={(e) => setAiVariationsCount(Number(e.target.value))}
                  className="w-16 h-8 text-right"
                />
              </div>
            </div>
            <Slider
              value={[aiVariationsCount]}
              min={1}
              max={maxVariations}
              step={1}
              onValueChange={(value) => setAiVariationsCount(value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Additional instructions (optional)</Label>
            <Textarea
              placeholder="e.g., Make them more casual, or add a question at the end"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowAiDialog(false)}>
            Cancel
          </Button>
          <Button 
            disabled={isGeneratingMessages || !hasBaseMessage} 
            onClick={handleGenerateVariations}
          >
            Generate Variations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
