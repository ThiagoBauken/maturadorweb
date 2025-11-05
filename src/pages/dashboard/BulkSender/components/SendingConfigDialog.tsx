
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { SendingHistory } from '../types';
import { toast } from 'sonner';

interface SendingConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sendingId: string;
  currentConfig: SendingHistory;
  onSaveConfig: (config: Partial<SendingHistory>) => void;
}

export function SendingConfigDialog({
  open,
  onOpenChange,
  sendingId,
  currentConfig,
  onSaveConfig
}: SendingConfigDialogProps) {
  const [config, setConfig] = useState({
    projectName: currentConfig.projectName || '',
    minInterval: 10,
    maxInterval: 30,
    useRandomInterval: true,
    numberRotation: false,
    maxDailyMessages: 100,
    messageVariation: true
  });
  
  const handleSave = () => {
    // Update only the configurable properties
    onSaveConfig({
      projectName: config.projectName
    });
    
    toast.success('Sending configuration updated');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Sending</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={config.projectName}
              onChange={(e) => setConfig({...config, projectName: e.target.value})}
              placeholder="Enter a name for this sending"
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="random-interval" className="font-medium">Random Interval</Label>
              <Switch
                id="random-interval"
                checked={config.useRandomInterval}
                onCheckedChange={(checked) => setConfig({...config, useRandomInterval: checked})}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Randomize time between messages
            </p>
          </div>
          
          {config.useRandomInterval ? (
            <div className="space-y-2">
              <Label>Interval Range (seconds)</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number" 
                  min={5} 
                  max={300}
                  value={config.minInterval} 
                  onChange={(e) => setConfig({...config, minInterval: Number(e.target.value)})} 
                  className="w-20"
                />
                <span>to</span>
                <Input 
                  type="number" 
                  min={config.minInterval} 
                  max={300}
                  value={config.maxInterval} 
                  onChange={(e) => setConfig({...config, maxInterval: Number(e.target.value)})} 
                  className="w-20"
                />
                <span>seconds</span>
              </div>
              <Slider
                value={[config.minInterval, config.maxInterval]}
                min={5}
                max={300}
                step={1}
                onValueChange={(values) => {
                  setConfig({
                    ...config, 
                    minInterval: values[0],
                    maxInterval: values[1]
                  });
                }}
                className="my-4"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Fixed Interval (seconds)</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  type="number" 
                  min={5} 
                  max={300}
                  value={config.minInterval} 
                  onChange={(e) => setConfig({...config, minInterval: Number(e.target.value)})} 
                  className="w-20" 
                />
                <span>seconds</span>
              </div>
              <Slider
                value={[config.minInterval]}
                min={5}
                max={300}
                step={1}
                onValueChange={(values) => {
                  setConfig({...config, minInterval: values[0]});
                }}
                className="my-4"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="number-rotation" className="font-medium">Number Rotation</Label>
              <Switch
                id="number-rotation"
                checked={config.numberRotation}
                onCheckedChange={(checked) => setConfig({...config, numberRotation: checked})}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Send messages to random contacts instead of in sequence
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Maximum Daily Messages</Label>
            <div className="flex items-center space-x-2">
              <Input 
                type="number" 
                min={1} 
                max={1000}
                value={config.maxDailyMessages} 
                onChange={(e) => setConfig({...config, maxDailyMessages: Number(e.target.value)})} 
                className="w-20" 
              />
              <span>messages per day</span>
            </div>
            <Slider
              value={[config.maxDailyMessages]}
              min={1}
              max={1000}
              step={1}
              onValueChange={(values) => {
                setConfig({...config, maxDailyMessages: values[0]});
              }}
              className="my-4"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message-variation" className="font-medium">Message Variation</Label>
              <Switch
                id="message-variation"
                checked={config.messageVariation}
                onCheckedChange={(checked) => setConfig({...config, messageVariation: checked})}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Use different message templates for variation
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
