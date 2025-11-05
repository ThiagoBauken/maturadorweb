import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { CampaignTabs } from '@/components/campaigns/CampaignTabs';
import { campaignData, Campaign } from '@/components/campaigns/CampaignData';
import { toast } from 'sonner';
import { BulkSenderDashboardContent } from './BulkSender/components/BulkSenderDashboardContent';
import { Send, Phone, CheckCircle, Flame } from 'lucide-react';
import { BulkSenderProvider } from './BulkSender/hooks/useBulkSender';
import { BulkSenderWithRealTimeMessaging } from './BulkSender';

// Dashboard statistics mock data
const stats = [
  {
    name: 'Total Messages',
    value: 2435,
    change: '+12.5%',
    changeType: 'increase',
  },
  {
    name: 'Delivered Rate',
    value: '97.2%',
    change: '+4.3%',
    changeType: 'increase',
  },
  {
    name: 'Read Rate',
    value: '68.4%',
    change: '-2.1%',
    changeType: 'decrease',
  },
  {
    name: 'Response Rate',
    value: '24.7%',
    change: '+5.9%',
    changeType: 'increase',
  },
];

// Dashboard component
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignData);
  
  // Update active tab when query parameter changes
  useEffect(() => {
    if (tabParam && ['overview', 'live', 'history', 'campaigns'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  
  // Update URL when active tab changes
  useEffect(() => {
    if (activeTab !== 'overview') {
      navigate(`/dashboard?tab=${activeTab}`, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [activeTab, navigate]);
  
  // Filter campaigns for the CampaignTabs component
  const [searchQuery, setSearchQuery] = useState('');
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle campaign actions
  const handleCampaignAction = (campaignId: string, action: string) => {
    const updatedCampaigns = [...campaigns];
    const campaignIndex = updatedCampaigns.findIndex(c => c.id === campaignId);
    
    if (campaignIndex === -1) return;
    
    const campaign = updatedCampaigns[campaignIndex];
    
    switch (action) {
      case 'play':
        campaign.status = 'active';
        toast.success(`Started campaign: ${campaign.name}`);
        break;
      case 'pause':
        campaign.status = 'paused';
        toast.info(`Paused campaign: ${campaign.name}`);
        break;
      case 'delete':
        updatedCampaigns.splice(campaignIndex, 1);
        toast.info(`Deleted campaign: ${campaign.name}`);
        break;
      case 'edit':
        navigate(`/bulk-sender/${campaignId}`);
        break;
      case 'bulk-sender':
        navigate(`/bulk-sender/${campaignId}`);
        break;
    }
    
    setCampaigns(updatedCampaigns);
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Get an overview of your messaging operations."
      />
      
      {/* We'll conditionally render this component based on the active tab */}
      {activeTab === 'live' || activeTab === 'history' ? (
        <BulkSenderProvider>
          <BulkSenderWithRealTimeMessaging>
            <BulkSenderDashboardContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </BulkSenderWithRealTimeMessaging>
        </BulkSenderProvider>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="live">Live Sending</TabsTrigger>
            <TabsTrigger value="history">Sending History</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs ${
                      stat.changeType === 'increase' 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Message Performance</CardTitle>
                  <CardDescription>
                    Delivery and read rates over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { name: 'Jan', sent: 400, delivered: 380, read: 240 },
                          { name: 'Feb', sent: 500, delivered: 470, read: 320 },
                          { name: 'Mar', sent: 600, delivered: 570, read: 380 },
                          { name: 'Apr', sent: 650, delivered: 620, read: 410 },
                          { name: 'May', sent: 700, delivered: 670, read: 450 },
                          { name: 'Jun', sent: 800, delivered: 770, read: 510 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="sent" stroke="#8884d8" />
                        <Line type="monotone" dataKey="delivered" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="read" stroke="#ffc658" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest message sending operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Click on "Live Sending" or "Sending History" to view your message operations</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setActiveTab('live')}
                    >
                      View Live Sending
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Response Rates By Template</CardTitle>
                  <CardDescription>
                    Performance of different message templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Template A', delivered: 95, read: 70, responded: 32 },
                          { name: 'Template B', delivered: 98, read: 85, responded: 45 },
                          { name: 'Template C', delivered: 97, read: 63, responded: 28 },
                          { name: 'Template D', delivered: 99, read: 74, responded: 36 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="delivered" fill="#8884d8" name="Delivered %" />
                        <Bar dataKey="read" fill="#82ca9d" name="Read %" />
                        <Bar dataKey="responded" fill="#ffc658" name="Response %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" onClick={() => navigate('/bulk-sender')}>
                      <Send className="mr-2 h-4 w-4" />
                      Start New Bulk Sending
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/verifier')}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify Phone Numbers
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/warmers')}>
                      <Flame className="mr-2 h-4 w-4" />
                      Create Number Warmer
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/sessions')}>
                      <Phone className="mr-2 h-4 w-4" />
                      Manage WhatsApp Sessions
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('campaigns')}>
                      <Send className="mr-2 h-4 w-4" />
                      View Campaigns
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Management</CardTitle>
                <CardDescription>
                  Manage your messaging campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CampaignTabs 
                  filteredCampaigns={filteredCampaigns} 
                  onCampaignAction={handleCampaignAction} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
