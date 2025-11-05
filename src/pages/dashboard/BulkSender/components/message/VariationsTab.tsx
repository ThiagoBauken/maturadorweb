
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface VariationsTabProps {
  messageTemplates: string[];
  updateMessageTemplate: (index: number, value: string) => void;
  removeMessageTemplate: (index: number) => void;
  addMessageTemplate: () => void;
  messageVariation: boolean;
  setMessageVariation: (variation: boolean) => void;
  messageVariationPercentage: number;
  setMessageVariationPercentage: (percentage: number) => void;
  isGeneratingMessages: boolean;
  aiVariationsCount: number;
  setAiVariationsCount: (count: number) => void;
  setShowAiDialog: (show: boolean) => void;
  handleGenerateVariations?: () => void;
}

export function VariationsTab({
  messageTemplates,
  updateMessageTemplate,
  removeMessageTemplate,
  addMessageTemplate,
  messageVariation,
  setMessageVariation,
  messageVariationPercentage,
  setMessageVariationPercentage,
  isGeneratingMessages,
  aiVariationsCount,
  setAiVariationsCount,
  setShowAiDialog,
  handleGenerateVariations
}: VariationsTabProps) {
  const hasBaseMessage = messageTemplates.length > 0 && messageTemplates[0]?.trim().length > 0;

  const handleGenerateClick = () => {
    if (!hasBaseMessage) {
      toast.error('Please enter a base message in the template before generating variations');
      return;
    }
    
    if (handleGenerateVariations) {
      handleGenerateVariations();
    } else {
      setShowAiDialog(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-variations" className="font-medium">Enable Message Variations</Label>
          <Switch 
            id="enable-variations" 
            checked={messageVariation}
            onCheckedChange={setMessageVariation}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Create multiple message templates to use randomly or in sequence
        </p>
      </div>
      
      {messageVariation && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="variation-percentage" className="text-sm">Variation Percentage</Label>
              <span className="text-sm font-medium">{messageVariationPercentage}%</span>
            </div>
            <Slider
              id="variation-percentage"
              value={[messageVariationPercentage]}
              min={10}
              max={100}
              step={10}
              onValueChange={(value) => setMessageVariationPercentage(value[0])}
            />
            <p className="text-xs text-muted-foreground">Percentage of messages to apply variations</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Message Templates</Label>
              <div className="flex items-center gap-2">
                <div className="flex text-sm items-center gap-1">
                  <span>Generate:</span>
                  <select 
                    value={aiVariationsCount}
                    onChange={(e) => setAiVariationsCount(Number(e.target.value))}
                    className="bg-background border rounded px-1 h-6 text-xs"
                  >
                    {[1, 3, 5, 7, 10].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleGenerateClick}
                  disabled={isGeneratingMessages || !hasBaseMessage}
                  className="h-7 text-xs"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Generate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addMessageTemplate}
                  className="h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Template
                </Button>
              </div>
            </div>
            
            {!hasBaseMessage && (
              <div className="text-amber-600 p-3 rounded-md bg-amber-50 border border-amber-200 text-sm">
                Please enter a base message in the template before generating variations.
              </div>
            )}
            
            <div className="space-y-3 pt-2">
              {messageTemplates.map((template, index) => (
                <Card key={index} className="p-3 relative">
                  <Textarea
                    value={template}
                    onChange={(e) => updateMessageTemplate(index, e.target.value)}
                    placeholder={`Message template ${index + 1}`}
                    rows={3}
                  />
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMessageTemplate(index)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
