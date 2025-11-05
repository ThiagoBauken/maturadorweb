
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PauseCircle, PlayCircle, Trash2, Send, Edit, MessageSquare, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Campaign } from './CampaignData';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CampaignTableProps {
  campaigns: Campaign[];
  statusFilter?: string;
  onCampaignAction?: (campaignId: string, action: string) => void;
}

type SentimentFilter = 'all' | 'positive' | 'negative';

interface Reply {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const CampaignTable: React.FC<CampaignTableProps> = ({ 
  campaigns,
  onCampaignAction
}) => {
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isRepliesDialogOpen, setIsRepliesDialogOpen] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all');
  
  // Mock replies data - in a real app, this would come from your API
  const mockReplies: Record<string, Reply[]> = {
    "1": [
      { id: "r1", sender: "+1235557890", message: "Thanks for reaching out! Your service is great!", timestamp: "2023-06-20T10:30:00Z", sentiment: "positive" },
      { id: "r2", sender: "+4455667788", message: "Not interested at the moment.", timestamp: "2023-06-20T11:15:00Z", sentiment: "negative" },
      { id: "r3", sender: "+3344556677", message: "Can you provide more information?", timestamp: "2023-06-20T12:00:00Z", sentiment: "neutral" },
    ],
    "2": [
      { id: "r4", sender: "+9988776655", message: "This newsletter is so helpful, thank you!", timestamp: "2023-06-16T09:45:00Z", sentiment: "positive" },
      { id: "r5", sender: "+1122334455", message: "Please unsubscribe me from your list.", timestamp: "2023-06-16T10:20:00Z", sentiment: "negative" },
    ],
    "5": [
      { id: "r6", sender: "+6677889900", message: "Just completed your survey. Looking forward to the results!", timestamp: "2023-06-19T14:30:00Z", sentiment: "positive" },
      { id: "r7", sender: "+5566778899", message: "The survey was too long and confusing.", timestamp: "2023-06-19T15:10:00Z", sentiment: "negative" },
      { id: "r8", sender: "+4433221100", message: "Done with the survey. When will you share the results?", timestamp: "2023-06-19T16:00:00Z", sentiment: "neutral" },
    ],
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-badge-success';
      case 'paused':
        return 'status-badge-warning';
      case 'draft':
        return 'status-badge-neutral';
      case 'completed':
        return 'status-badge-info';
      default:
        return 'status-badge-neutral';
    }
  };

  const handleAction = (campaignId: string, action: string) => {
    if (action === 'edit') {
      // Navigate directly to bulk sender with campaign ID
      navigate(`/bulk-sender/${campaignId}`);
      return;
    }
    
    if (action === 'view-replies') {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        setSelectedCampaign(campaign);
        setIsRepliesDialogOpen(true);
        setSentimentFilter('all');
      }
      return;
    }
    
    if (onCampaignAction) {
      onCampaignAction(campaignId, action);
    } else {
      // Handle actions locally if no callback provided
      if (action === 'pause') {
        toast.info(`Paused campaign`);
      } else if (action === 'play') {
        toast.success(`Started campaign`);
      } else if (action === 'delete') {
        toast.info(`Deleted campaign`);
      } else if (action === 'bulk-sender') {
        navigate(`/bulk-sender/${campaignId}`);
      }
    }
  };
  
  const getFilteredReplies = () => {
    if (!selectedCampaign) return [];
    
    const replies = mockReplies[selectedCampaign.id] || [];
    
    if (sentimentFilter === 'all') return replies;
    
    return replies.filter(reply => reply.sentiment === sentimentFilter);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="hidden md:table-cell">Sent/Total</TableHead>
              <TableHead className="hidden md:table-cell">Delivered</TableHead>
              <TableHead className="hidden lg:table-cell">Read</TableHead>
              <TableHead className="hidden lg:table-cell">Replied</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No campaigns found. Create a new one!
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div>{campaign.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Created: {campaign.createdAt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge ${getStatusBadgeClass(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-20 md:w-32">
                      <Progress value={campaign.progress} className="h-2" />
                      <div className="text-xs text-right mt-1">
                        {campaign.progress}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {campaign.sent}/{campaign.recipients}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {campaign.delivered}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {campaign.read}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center">
                      {campaign.replied}
                      {campaign.replied > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="ml-1" 
                          onClick={() => handleAction(campaign.id, 'view-replies')}
                          title="View Replies"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {campaign.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleAction(campaign.id, 'pause')}>
                            <PauseCircle className="mr-2 h-4 w-4" />
                            Pause
                          </DropdownMenuItem>
                        ) : campaign.status !== 'completed' ? (
                          <DropdownMenuItem onClick={() => handleAction(campaign.id, 'play')}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start
                          </DropdownMenuItem>
                        ) : null}
                        
                        <DropdownMenuItem onClick={() => handleAction(campaign.id, 'edit')}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        
                        {campaign.replied > 0 && (
                          <DropdownMenuItem onClick={() => handleAction(campaign.id, 'view-replies')}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            View Replies
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuItem onClick={() => handleAction(campaign.id, 'bulk-sender')}>
                          <Send className="mr-2 h-4 w-4" />
                          Send with Bulk Sender
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={() => handleAction(campaign.id, 'delete')}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isRepliesDialogOpen} onOpenChange={setIsRepliesDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCampaign ? `Replies for ${selectedCampaign.name}` : 'Campaign Replies'}
            </DialogTitle>
            <DialogDescription>
              View and filter message replies by sentiment
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2 mb-4">
            <Button 
              variant={sentimentFilter === 'all' ? 'default' : 'outline'} 
              onClick={() => setSentimentFilter('all')}
            >
              <Filter className="mr-2 h-4 w-4" />
              All Replies
            </Button>
            <Button 
              variant={sentimentFilter === 'positive' ? 'default' : 'outline'} 
              onClick={() => setSentimentFilter('positive')}
              className="text-green-700"
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Positive
            </Button>
            <Button 
              variant={sentimentFilter === 'negative' ? 'default' : 'outline'} 
              onClick={() => setSentimentFilter('negative')}
              className="text-red-700"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Negative
            </Button>
          </div>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {getFilteredReplies().length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {sentimentFilter !== 'all' 
                  ? `No ${sentimentFilter} replies found for this campaign.`
                  : 'No replies found for this campaign.'}
              </div>
            ) : (
              getFilteredReplies().map((reply) => (
                <div key={reply.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{reply.sender}</div>
                    <Badge className={getSentimentColor(reply.sentiment)}>
                      {getSentimentIcon(reply.sentiment)}
                      <span className="ml-1">{reply.sentiment}</span>
                    </Badge>
                  </div>
                  <div className="mb-2">{reply.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(reply.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
