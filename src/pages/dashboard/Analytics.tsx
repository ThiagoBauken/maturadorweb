
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Download, 
  RefreshCw, 
  Activity,
  MessageSquare,
  Phone,
  Flame,
  CheckCircle2,
  Send
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

// Mock data for user analytics
const sessionActivityData = [
  { name: 'Mon', sessions: 4, messages: 120 },
  { name: 'Tue', sessions: 3, messages: 90 },
  { name: 'Wed', sessions: 5, messages: 150 },
  { name: 'Thu', sessions: 4, messages: 130 },
  { name: 'Fri', sessions: 6, messages: 200 },
  { name: 'Sat', sessions: 3, messages: 80 },
  { name: 'Sun', sessions: 2, messages: 50 },
];

const messageStatusData = [
  { name: 'Delivered', value: 720 },
  { name: 'Read', value: 580 },
  { name: 'Replied', value: 320 },
];

const warmerPerformanceData = [
  { name: 'Jan', delivered: 92, opened: 78, engaged: 45 },
  { name: 'Feb', delivered: 93, opened: 80, engaged: 48 },
  { name: 'Mar', delivered: 95, opened: 82, engaged: 52 },
  { name: 'Apr', delivered: 94, opened: 83, engaged: 55 },
  { name: 'May', delivered: 96, opened: 85, engaged: 58 },
  { name: 'Jun', delivered: 97, opened: 88, engaged: 62 },
];

const verificationStatusData = [
  { name: 'Valid', value: 380 },
  { name: 'Invalid', value: 120 },
  { name: 'Pending', value: 50 },
];

const recentSessionsData = [
  { id: 1, name: 'Main Phone', status: 'active', messages: 345, lastActive: '2h ago' },
  { id: 2, name: 'Marketing', status: 'active', messages: 245, lastActive: '1h ago' },
  { id: 3, name: 'Support', status: 'inactive', messages: 175, lastActive: '2d ago' },
  { id: 4, name: 'Personal', status: 'active', messages: 89, lastActive: '30m ago' },
];

// Colors for the pie charts
const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#f472b6', '#fbbf24'];

const Analytics = () => {
  const [date, setDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  
  const handleRefresh = () => {
    toast.info('Refreshing analytics data...');
    // This would typically trigger a data refresh from the API
    setTimeout(() => {
      toast.success('Analytics data refreshed!');
    }, 1000);
  };
  
  const handleExport = () => {
    toast.success('Analytics data exported! Check your downloads folder.');
  };

  // Stats calculations for user dashboard
  const totalMessages = sessionActivityData.reduce((sum, day) => sum + day.messages, 0);
  const totalSessions = recentSessionsData.length;
  const totalWarmerMessages = warmerPerformanceData.reduce((sum, month) => sum + month.delivered, 0);
  const totalVerifications = verificationStatusData.reduce((sum, status) => sum + status.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Analytics Dashboard"
        description="Insights and metrics for your WhatsApp activity"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="warmers">Warmers</TabsTrigger>
            <TabsTrigger value="verifier">Verifier</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="overview">
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+12%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+8%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Warmer Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalWarmerMessages}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+15%</span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVerifications}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+5%</span> from last period
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Session Activity</CardTitle>
                <CardDescription>Daily session and message activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sessionActivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#8884d8" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="messages" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Message Status */}
            <Card>
              <CardHeader>
                <CardTitle>Message Status</CardTitle>
                <CardDescription>Distribution of message statuses</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={messageStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {messageStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your most recent WhatsApp sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessionsData.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <Phone className="h-8 w-8 text-primary p-1.5 bg-primary/10 rounded-md" />
                        <div>
                          <h4 className="font-medium">{session.name}</h4>
                          <p className="text-xs text-muted-foreground">Last active: {session.lastActive}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <MessageSquare className="h-4 w-4 inline mr-1" />
                          {session.messages}
                        </div>
                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Feature Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Usage of platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-lg">
                    <Phone className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">{totalSessions}</h3>
                    <p className="text-sm text-muted-foreground">Sessions</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-lg">
                    <Send className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">{totalMessages}</h3>
                    <p className="text-sm text-muted-foreground">Messages</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-lg">
                    <Flame className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">{warmerPerformanceData.length}</h3>
                    <p className="text-sm text-muted-foreground">Warmers</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-lg">
                    <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">{totalVerifications}</h3>
                    <p className="text-sm text-muted-foreground">Verifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Analytics</CardTitle>
              <CardDescription>Performance and usage of your WhatsApp sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{recentSessionsData.filter(s => s.status === 'active').length}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+1</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Daily Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(totalMessages / sessionActivityData.length)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+12%</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Session Uptime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">98.5%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+0.5%</span> from last period
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="mb-6">
                <BarChart
                  data={recentSessionsData.map(session => ({
                    name: session.name,
                    messages: session.messages,
                    isActive: session.status === 'active' ? 1 : 0
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="messages" fill="#60a5fa" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Status Distribution</CardTitle>
                  <CardDescription>Active vs. inactive sessions</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: recentSessionsData.filter(s => s.status === 'active').length },
                          { name: 'Inactive', value: recentSessionsData.filter(s => s.status === 'inactive').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4ade80" />
                        <Cell fill="#f87171" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Message Analytics</CardTitle>
              <CardDescription>Analytics on message delivery and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Delivered Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{messageStatusData[0].value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+15%</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Read Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((messageStatusData[1].value / messageStatusData[0].value) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+2%</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((messageStatusData[2].value / messageStatusData[1].value) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+5%</span> from last period
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="mb-6">
                <BarChart
                  data={sessionActivityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="messages" fill="#60a5fa" name="Messages" />
                </BarChart>
              </ResponsiveContainer>
              
              <Card>
                <CardHeader>
                  <CardTitle>Message Status Distribution</CardTitle>
                  <CardDescription>Status breakdown of sent messages</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={messageStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {messageStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="warmers">
          <Card>
            <CardHeader>
              <CardTitle>Warmer Analytics</CardTitle>
              <CardDescription>Performance metrics for your WhatsApp warmers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(warmerPerformanceData[warmerPerformanceData.length - 1].delivered)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+1%</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(warmerPerformanceData[warmerPerformanceData.length - 1].opened)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+3%</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(warmerPerformanceData[warmerPerformanceData.length - 1].engaged)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+4%</span> from last period
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="mb-6">
                <LineChart
                  data={warmerPerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="delivered" stroke="#4ade80" strokeWidth={2} name="Delivered %" />
                  <Line type="monotone" dataKey="opened" stroke="#60a5fa" strokeWidth={2} name="Opened %" />
                  <Line type="monotone" dataKey="engaged" stroke="#f472b6" strokeWidth={2} name="Engaged %" />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Warmer Performance Trends</CardTitle>
                    <CardDescription>Month-over-month performance comparison</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={warmerPerformanceData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="engaged" fill="#f472b6" name="Engagement Rate %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Effectiveness Metrics</CardTitle>
                    <CardDescription>Key performance indicators for warmers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Delivery Success</span>
                          <span className="text-sm font-medium">
                            {warmerPerformanceData[warmerPerformanceData.length - 1].delivered}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${warmerPerformanceData[warmerPerformanceData.length - 1].delivered}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Open Rate</span>
                          <span className="text-sm font-medium">
                            {warmerPerformanceData[warmerPerformanceData.length - 1].opened}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full" 
                            style={{ width: `${warmerPerformanceData[warmerPerformanceData.length - 1].opened}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Engagement</span>
                          <span className="text-sm font-medium">
                            {warmerPerformanceData[warmerPerformanceData.length - 1].engaged}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-pink-500 h-full rounded-full" 
                            style={{ width: `${warmerPerformanceData[warmerPerformanceData.length - 1].engaged}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verifier">
          <Card>
            <CardHeader>
              <CardTitle>Verifier Analytics</CardTitle>
              <CardDescription>Results and insights from your number verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalVerifications}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+15%</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Valid Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((verificationStatusData[0].value / totalVerifications) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+2%</span> from last period
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Invalid Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round((verificationStatusData[1].value / totalVerifications) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-500 font-medium">-2%</span> from last period
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>Distribution of verification results</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={verificationStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4ade80" />
                          <Cell fill="#f87171" />
                          <Cell fill="#fbbf24" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Valid Numbers</span>
                          <span className="text-sm font-medium">
                            {Math.round((verificationStatusData[0].value / totalVerifications) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-green-500 h-full rounded-full" 
                            style={{ width: `${Math.round((verificationStatusData[0].value / totalVerifications) * 100)}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Invalid Numbers</span>
                          <span className="text-sm font-medium">
                            {Math.round((verificationStatusData[1].value / totalVerifications) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-red-500 h-full rounded-full" 
                            style={{ width: `${Math.round((verificationStatusData[1].value / totalVerifications) * 100)}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Pending Verification</span>
                          <span className="text-sm font-medium">
                            {Math.round((verificationStatusData[2].value / totalVerifications) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-yellow-500 h-full rounded-full" 
                            style={{ width: `${Math.round((verificationStatusData[2].value / totalVerifications) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Verification Results</CardTitle>
                  <CardDescription>View your verification results with additional analytics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    View Advanced Verification Analytics
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Link to Admin Analytics for admins */}
      {user?.role === 'admin' && (
        <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="text-lg">Admin Analytics Available</CardTitle>
            <CardDescription>
              Access comprehensive SaaS metrics and business insights in the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/admin/analytics">
                <Activity className="mr-2 h-4 w-4" />
                Go to Admin Analytics
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
