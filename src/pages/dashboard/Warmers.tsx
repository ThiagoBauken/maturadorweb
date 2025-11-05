
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Flame, Zap, ChevronRight, Users } from 'lucide-react';
import { SessionStatusMonitor, SessionStatus } from '@/components/common/status';
import { WarmerList, WarmerStats } from '@/components/warmers';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for demonstration
const mockSessions: SessionStatus[] = [
  {
    id: '1',
    sessionId: 'sess_001',
    status: 'success',
    title: 'Main Account',
    description: 'Primary warmer account',
    timestamp: '2 minutes ago',
    phone: '+1234567890', // Use phone instead of phoneNumber
    lastActive: '2023-05-20T14:30:00Z', // Changed from lastActivity to lastActive
    batteryLevel: 85,
    connectionType: 'wifi',
  },
  {
    id: '2',
    sessionId: 'sess_002',
    status: 'warning',
    title: 'Support Account',
    description: 'Low battery warning',
    timestamp: '15 minutes ago',
    phone: '+0987654321', // Use phone instead of phoneNumber
    lastActive: '2023-05-20T14:15:00Z', // Changed from lastActivity to lastActive
    batteryLevel: 15,
    connectionType: 'cellular',
  },
  {
    id: '3',
    sessionId: 'sess_003',
    status: 'processing',
    title: 'Sales Account',
    description: 'Connecting...',
    timestamp: '1 minute ago',
    progress: 65,
    phone: '+1122334455', // Use phone instead of phoneNumber
    retryCount: 2,
  },
  {
    id: '4',
    sessionId: 'sess_004',
    status: 'error',
    title: 'Marketing Account',
    description: 'Connection failed',
    timestamp: '1 hour ago',
    phone: '+5566778899', // Use phone instead of phoneNumber
    retryCount: 5,
  },
];

const mockWarmers: WarmerStats[] = [
  {
    id: '1',
    name: 'Customer Engagement Warmer',
    type: 'advanced-warmer',
    status: 'active',
    targetCount: 50,
    completedCount: 35,
    progress: 70,
    startDate: '2023-05-15',
    lastRun: '2023-05-20T10:30:00Z',
    nextRun: 'Today, 14:30',
  },
  {
    id: '2',
    name: 'Marketing Group Warmer',
    type: 'number-to-group',
    status: 'paused',
    targetCount: 25,
    completedCount: 10,
    progress: 40,
    startDate: '2023-05-18',
    lastRun: '2023-05-19T16:45:00Z',
    nextRun: 'Paused',
    groupName: 'Marketing Team Group',
  },
  {
    id: '3',
    name: 'Weekly Test Warmer',
    type: 'standard-warmer',
    status: 'completed',
    targetCount: 15,
    completedCount: 15,
    progress: 100,
    startDate: '2023-05-10',
    lastRun: '2023-05-15T09:30:00Z',
    isStandard: true,
  },
];

export default function Warmers() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessions, setSessions] = useState(mockSessions);
  const [warmers, setWarmers] = useState(mockWarmers);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Session status refreshed');
      setIsRefreshing(false);
    }, 1500);
  };

  const handleSessionDetails = (session: SessionStatus) => {
    toast.info(`Viewing details for ${session.title}`);
  };

  const handleCreateWarmer = () => {
    navigate('/warmers/create');
  };

  const handleCreateStandardWarmer = () => {
    navigate('/warmers/standard');
  };

  const handleCreateGroupWarmer = () => {
    navigate('/warmers/create?type=number-to-group');
  };

  const handleDeleteWarmer = (id: string) => {
    setWarmers(warmers.filter(w => w.id !== id));
    toast.success('Warmer deleted successfully');
  };

  const handleEditWarmer = (id: string) => {
    const warmer = warmers.find(w => w.id === id);
    if (warmer) {
      if (warmer.type === 'number-to-group') {
        navigate(`/warmers/create?edit=${id}&type=number-to-group`);
      } else if (warmer.type === 'standard-warmer' || warmer.isStandard) {
        navigate(`/warmers/standard?edit=${id}`);
      } else {
        navigate(`/warmers/create?edit=${id}`);
      }
    }
  };

  const handleRestartWarmer = (id: string) => {
    setWarmers(warmers.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: 'active',
          progress: 0,
          completedCount: 0,
          startDate: new Date().toISOString().split('T')[0],
          lastRun: new Date().toISOString()
        };
      }
      return w;
    }));
    
    toast.success(`Warmer restarted`);
  };

  const handleToggleWarmerStatus = (id: string, status: string) => {
    setWarmers(warmers.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: status === 'active' ? 'paused' : 'active'
        };
      }
      return w;
    }));
    
    const newStatus = status === 'active' ? 'paused' : 'active';
    toast.success(`Warmer ${newStatus}`);
  };

  const standardWarmers = warmers.filter(w => w.type === 'standard-warmer' || w.isStandard);
  const advancedWarmers = warmers.filter(w => w.type === 'advanced-warmer' || (w.type === 'number-to-number' && !w.isStandard));
  const groupWarmers = warmers.filter(w => w.type === 'number-to-group' || w.type.includes('group'));

  return (
    <div className="space-y-6">
      <PageHeader 
        title="WhatsApp Warmers" 
        description="Manage your account warming strategies to avoid blocking"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateStandardWarmer}>
              <Flame className="mr-2 h-4 w-4" />
              Standard
            </Button>
            <Button variant="outline" onClick={handleCreateGroupWarmer}>
              <Users className="mr-2 h-4 w-4" />
              Group
            </Button>
            <Button onClick={handleCreateWarmer}>
              <Plus className="mr-2 h-4 w-4" />
              Advanced
            </Button>
          </div>
        }
      />

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="standard-warmers">
            <Flame className="mr-2 h-4 w-4" />
            Standard
          </TabsTrigger>
          <TabsTrigger value="advanced-warmers">
            <Zap className="mr-2 h-4 w-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="group-warmers">
            <Users className="mr-2 h-4 w-4" />
            Group
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SessionStatusMonitor 
              sessions={sessions}
              onRefresh={handleRefresh}
              onViewDetails={handleSessionDetails}
              isLoading={isRefreshing}
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Create New Warmer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                     onClick={handleCreateStandardWarmer}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-green-500" />
                      <div>
                        <h3 className="font-medium">Standard Warmer</h3>
                        <p className="text-sm text-muted-foreground">Quick setup with best practices</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                     onClick={handleCreateGroupWarmer}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <div>
                        <h3 className="font-medium">Group Warmer</h3>
                        <p className="text-sm text-muted-foreground">Send messages to a WhatsApp group</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                     onClick={handleCreateWarmer}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      <div>
                        <h3 className="font-medium">Advanced Warmer</h3>
                        <p className="text-sm text-muted-foreground">Full customization options</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="border rounded-md p-6">
              <h3 className="text-lg font-medium mb-4">Recent Warmers</h3>
              <div className="space-y-4">
                {warmers.slice(0, 2).map(warmer => (
                  <div key={warmer.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{warmer.name}</span>
                      <span className={`status-badge ${
                        warmer.status === 'active' ? 'status-badge-success' : 
                        warmer.status === 'paused' ? 'status-badge-warning' :
                        warmer.status === 'completed' ? 'status-badge-info' : 
                        'status-badge-error'
                      }`}>
                        {warmer.status}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {warmer.type === 'number-to-group' || warmer.type.includes('group') ? 'Group Warmer' : 
                       warmer.type === 'standard-warmer' || warmer.isStandard ? 'Standard Warmer' : 
                       'Advanced Warmer'}
                    </div>
                    <div className="text-sm">
                      {warmer.completedCount} of {warmer.targetCount} completed
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full" 
                        style={{ width: `${warmer.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                {warmers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active warmers found. Create a new warmer to get started.
                  </div>
                )}

                {warmers.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={() => setActiveTab(
                      warmers[0]?.type === 'number-to-group' ? 'group-warmers' : 
                      warmers[0]?.type === 'standard-warmer' || warmers[0]?.isStandard ? 'standard-warmers' : 
                      'advanced-warmers'
                    )}
                  >
                    View All Warmers
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="standard-warmers">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Standard Warmers</h3>
              <Button onClick={handleCreateStandardWarmer}>
                <Plus className="mr-2 h-4 w-4" />
                New Standard Warmer
              </Button>
            </div>
            
            <WarmerList 
              warmers={standardWarmers}
              onDelete={handleDeleteWarmer}
              onTogglePause={handleToggleWarmerStatus}
              onEdit={handleEditWarmer}
              onRestart={handleRestartWarmer}
              className="mt-4"
            />
          </div>
        </TabsContent>

        <TabsContent value="advanced-warmers">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Advanced Warmers</h3>
              <Button onClick={handleCreateWarmer}>
                <Plus className="mr-2 h-4 w-4" />
                New Advanced Warmer
              </Button>
            </div>
            
            <WarmerList 
              warmers={advancedWarmers}
              onDelete={handleDeleteWarmer}
              onTogglePause={handleToggleWarmerStatus}
              onEdit={handleEditWarmer}
              onRestart={handleRestartWarmer}
              className="mt-4"
            />
          </div>
        </TabsContent>

        <TabsContent value="group-warmers">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Group Warmers</h3>
              <Button onClick={handleCreateGroupWarmer}>
                <Plus className="mr-2 h-4 w-4" />
                New Group Warmer
              </Button>
            </div>
            
            <WarmerList 
              warmers={groupWarmers}
              onDelete={handleDeleteWarmer}
              onTogglePause={handleToggleWarmerStatus}
              onEdit={handleEditWarmer}
              onRestart={handleRestartWarmer}
              className="mt-4"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
