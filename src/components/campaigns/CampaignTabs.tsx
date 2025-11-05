
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampaignTable } from '@/components/campaigns/CampaignTable';
import { Campaign } from './CampaignData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CampaignTabsProps {
  filteredCampaigns: Campaign[];
  onCampaignAction?: (campaignId: string, action: string) => void;
}

export function CampaignTabs({ filteredCampaigns, onCampaignAction }: CampaignTabsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  
  // Filter campaigns based on search text and active tab
  const searchFilteredCampaigns = filteredCampaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const handleCreateNewCampaign = () => {
    navigate('/bulk-sender');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <Input 
          placeholder="Search campaigns..." 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={handleCreateNewCampaign}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Campaign
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <CampaignTable 
            campaigns={searchFilteredCampaigns} 
            onCampaignAction={onCampaignAction}
          />
        </TabsContent>
        
        <TabsContent value="active">
          <CampaignTable 
            campaigns={searchFilteredCampaigns.filter(c => c.status === 'active')}
            onCampaignAction={onCampaignAction}
          />
        </TabsContent>
        
        <TabsContent value="paused">
          <CampaignTable 
            campaigns={searchFilteredCampaigns.filter(c => c.status === 'paused')}
            onCampaignAction={onCampaignAction}
          />
        </TabsContent>
        
        <TabsContent value="draft">
          <CampaignTable 
            campaigns={searchFilteredCampaigns.filter(c => c.status === 'draft')}
            onCampaignAction={onCampaignAction}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <CampaignTable 
            campaigns={searchFilteredCampaigns.filter(c => c.status === 'completed')}
            onCampaignAction={onCampaignAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
