
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSessions } from '@/hooks/useSessions';
import { Loader2 } from 'lucide-react';

interface NewSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewSessionDialog: React.FC<NewSessionDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [sessionName, setSessionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createSession } = useSessions();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSessionName('');
      setIsCreating(false);
    }
  }, [open]);

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    try {
      setIsCreating(true);

      // Create the session using the API
      await createSession(sessionName, '');  // Phone number will be known after QR code is scanned

      // Reset form and close dialog
      setSessionName('');
      onOpenChange(false);

      toast.success('New WhatsApp session created! Please scan the QR code to connect.');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unknown error occurred';
      toast.error(`Failed to create session: ${errorMessage}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Set up a new WhatsApp session connection
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Session Name</Label>
            <Input
              id="session-name"
              placeholder="e.g. Personal WhatsApp, Business Account"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession} disabled={isCreating || !sessionName.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create & Connect'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
