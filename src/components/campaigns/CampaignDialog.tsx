
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
import { campaignData } from './CampaignData';

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string | null;
}

export const CampaignDialog: React.FC<CampaignDialogProps> = ({
  open,
  onOpenChange,
  campaignId
}) => {
  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');

  // Load campaign data when editing
  useEffect(() => {
    if (campaignId) {
      const campaign = campaignData.find(c => c.id === campaignId);
      if (campaign) {
        setCampaignName(campaign.name);
        setDescription(campaign.description || '');
      }
    } else {
      // Reset form for new campaign
      setCampaignName('');
      setDescription('');
    }
  }, [campaignId, open]);

  const handleSaveCampaign = () => {
    // This would normally save the campaign to the backend
    onOpenChange(false);
    
    if (campaignId) {
      toast.success('Campaign updated successfully!');
    } else {
      toast.success('Campaign created successfully! Configure it in the campaigns list.');
    }
    
    // Reset form
    setCampaignName('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{campaignId ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {campaignId 
              ? 'Update your WhatsApp messaging campaign' 
              : 'Set up a new WhatsApp messaging campaign'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input 
              id="campaign-name" 
              placeholder="Enter campaign name" 
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaign-description">Description (optional)</Label>
            <Input 
              id="campaign-description" 
              placeholder="Enter campaign description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveCampaign}>
            {campaignId ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
