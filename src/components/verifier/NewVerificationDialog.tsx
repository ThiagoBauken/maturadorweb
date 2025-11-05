
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface NewVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: () => void;
}

export function NewVerificationDialog({ open, onOpenChange, onStart }: NewVerificationDialogProps) {
  const [numbers, setNumbers] = useState('');
  const [source, setSource] = useState('manual');
  
  const handleSubmit = () => {
    if (!numbers.trim()) {
      toast.error('Please enter at least one phone number');
      return;
    }
    
    // In a real app, this would add the numbers to the verification queue
    console.log('Numbers to verify:', numbers.split('\n').filter(n => n.trim()));
    
    toast.success('Numbers added to verification queue');
    
    // Call the onStart callback if provided
    if (onStart) {
      onStart();
    } else {
      onOpenChange(false);
    }
    
    // Reset form
    setNumbers('');
    setSource('manual');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Verification</DialogTitle>
          <DialogDescription>
            Add phone numbers to verify their WhatsApp status
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Number Source</Label>
            <RadioGroup 
              value={source} 
              onValueChange={setSource}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="font-normal cursor-pointer">
                  Enter numbers manually
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file" className="font-normal cursor-pointer">
                  Import from file (CSV, Excel)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {source === 'manual' ? (
            <div className="space-y-2">
              <Label htmlFor="numbers">Phone Numbers</Label>
              <Textarea 
                id="numbers" 
                placeholder="Enter phone numbers, one per line. Format: +551199999999" 
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                rows={8}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter one number per line in international format (e.g., +551199999999)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <Input 
                id="file-upload" 
                type="file" 
                accept=".csv, .xlsx, .xls" 
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add to Verification Queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
