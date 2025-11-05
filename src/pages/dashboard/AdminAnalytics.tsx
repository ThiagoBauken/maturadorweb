
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
  Users, 
  Smartphone, 
  Flame, 
  Zap,
  TrendingUp,
  Activity,
  Repeat,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for admin analytics
const revenueData = [
  { name: 'Jan', revenue: 4500, users: 120 },
  { name: 'Feb', revenue: 5200, users: 145 },
  { name: 'Mar', revenue: 6100, users: 165 },
  { name: 'Apr', revenue: 7300, users: 190 },
  { name: 'May', revenue: 8400, users: 220 },
  { name: 'Jun', revenue: 9200, users: 250 },
];

const subscriptionTiersData = [
  { name: 'Basic', value: 320 },
  { name: 'Pro', value: 480 },
  { name: 'Enterprise', value: 200 },
];

const churnRateData = [
  { name: 'Jan', rate: 2.1 },
  { name: 'Feb', rate: 1.8 },
  { name: 'Mar', rate: 2.3 },
  { name: 'Apr', rate: 1.5 },
  { name: 'May', rate: 1.2 },
  { name: 'Jun', rate: 1.0 },
];

const topClientsData = [
  { id: 1, name: 'Acme Corporation', plan: 'Enterprise', mrr: 999, status: 'active' },
  { id: 2, name: 'Globex Industries', plan: 'Pro', mrr: 499, status: 'active' },
  { id: 3, name: 'Initech Systems', plan: 'Pro', mrr: 499, status: 'active' },
  { id: 4, name: 'Umbrella Corp', plan: 'Enterprise', mrr: 999, status: 'overdue' },
  { id: 5, name: 'Stark Industries', plan: 'Pro', mrr: 499, status: 'active' },
];

const COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884d8'];

const AdminAnalytics = () => {
  const [date, setDate] = useState<Date>();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('7d');
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

  // Calculate key metrics
  const totalUsers = 950;
  const activeUsers = 840;
  const totalMrr = topClientsData.reduce((sum, client) => sum + client.mrr, 0);
  const annualRecurringRevenue = totalMrr * 12;
  const avgMrr = topClientsData.reduce((sum, client) => sum + client.mrr, 0) / topClientsData.length;
  const trialConversionRate = 68; // Mock percentage

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Analytics Dashboard"
        description="Comprehensive SaaS metrics and business insights"
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
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
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
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsContent value="overview">
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+8%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalMrr.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+15%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ARR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${annualRecurringRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 font-medium">+15%</span> yearly projection
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly revenue and user growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Subscription Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Tiers</CardTitle>
                <CardDescription>Distribution of users by subscription tier</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subscriptionTiersData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {subscriptionTiersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Churn Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Churn Rate</CardTitle>
                <CardDescription>Monthly subscription cancellation rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={churnRateData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Churn Rate']} />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement Metrics</CardTitle>
                <CardDescription>Key performance indicators for your SaaS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-lg">
                    <Activity className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">{trialConversionRate}%</h3>
                    <p className="text-sm text-muted-foreground">Trial Conversion Rate</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-lg">
                    <Repeat className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">94%</h3>
                    <p className="text-sm text-muted-foreground">Monthly Retention</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-6 bg-secondary/30 rounded-lg">
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <h3 className="text-xl font-bold">${avgMrr.toFixed(0)}</h3>
                    <p className="text-sm text-muted-foreground">Avg. MRR per User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Clients */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
                <CardDescription>Your highest value accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>MRR</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClientsData.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.plan}</TableCell>
                        <TableCell>${client.mrr}</TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'active' ? 'default' : 'destructive'}>
                            {client.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>Detailed user acquisition and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+8.2%</div>
                    <p className="text-xs text-muted-foreground">Month over month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{(totalUsers * 0.88).toFixed(0)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+5%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">14m 32s</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+2m</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="mb-6">
                <BarChart
                  data={[
                    { name: 'Jan', activeUsers: 720, newUsers: 145, churned: 32 },
                    { name: 'Feb', activeUsers: 780, newUsers: 157, churned: 28 },
                    { name: 'Mar', activeUsers: 840, newUsers: 165, churned: 25 },
                    { name: 'Apr', activeUsers: 890, newUsers: 178, churned: 22 },
                    { name: 'May', activeUsers: 930, newUsers: 192, churned: 20 },
                    { name: 'Jun', activeUsers: 950, newUsers: 185, churned: 18 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activeUsers" fill="#4ade80" name="Active Users" />
                  <Bar dataKey="newUsers" fill="#60a5fa" name="New Users" />
                  <Bar dataKey="churned" fill="#f87171" name="Churned Users" />
                </BarChart>
              </ResponsiveContainer>
              
              <Card>
                <CardHeader>
                  <CardTitle>User Acquisition Channels</CardTitle>
                  <CardDescription>Where your users are coming from</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Direct', value: 320 },
                          { name: 'Organic Search', value: 280 },
                          { name: 'Referral', value: 180 },
                          { name: 'Social Media', value: 120 },
                          { name: 'Paid Ads', value: 50 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[...Array(5)].map((_, index) => (
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
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Financial performance and subscription metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalMrr.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+15%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${annualRecurringRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+15%</span> yearly projection
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Revenue Per User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${avgMrr.toFixed(0)}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+5%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Customer Acquisition Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$125</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">-8%</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <ResponsiveContainer width="100%" height={300} className="mb-6">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="users" stroke="#82ca9d" strokeWidth={2} name="Users" />
                </LineChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Plan</CardTitle>
                    <CardDescription>Breakdown of revenue by subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: 'Basic', value: 320 * 49 },
                          { name: 'Pro', value: 480 * 99 },
                          { name: 'Enterprise', value: 200 * 299 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="value" fill="#60a5fa" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>LTV to CAC Ratio</CardTitle>
                    <CardDescription>Lifetime value to customer acquisition cost ratio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={[
                          { name: 'Jan', ratio: 2.8 },
                          { name: 'Feb', ratio: 2.9 },
                          { name: 'Mar', ratio: 3.1 },
                          { name: 'Apr', ratio: 3.3 },
                          { name: 'May', ratio: 3.5 },
                          { name: 'Jun', ratio: 3.7 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}:1`, 'LTV:CAC']} />
                        <Line type="monotone" dataKey="ratio" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Analytics</CardTitle>
              <CardDescription>Subscription growth and distribution metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{churnRateData[churnRateData.length - 1].rate}%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">-0.2%</span> from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Subscription Length</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">9.2 months</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 font-medium">+0.3</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Plan Distribution</CardTitle>
                    <CardDescription>Distribution of users by subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subscriptionTiersData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {subscriptionTiersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Churn Rate Trend</CardTitle>
                    <CardDescription>Monthly subscription cancellation rate</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={churnRateData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis unit="%" />
                        <Tooltip formatter={(value) => [`${value}%`, 'Churn Rate']} />
                        <Legend />
                        <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Subscription Growth</CardTitle>
                    <CardDescription>Monthly subscription growth by plan</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: 'Jan', basic: 280, pro: 420, enterprise: 180 },
                          { name: 'Feb', basic: 290, pro: 435, enterprise: 185 },
                          { name: 'Mar', basic: 300, pro: 450, enterprise: 190 },
                          { name: 'Apr', basic: 310, pro: 460, enterprise: 195 },
                          { name: 'May', basic: 315, pro: 470, enterprise: 198 },
                          { name: 'Jun', basic: 320, pro: 480, enterprise: 200 },
                        ]}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="basic" fill="#60a5fa" name="Basic Plan" />
                        <Bar dataKey="pro" fill="#4ade80" name="Pro Plan" />
                        <Bar dataKey="enterprise" fill="#f472b6" name="Enterprise Plan" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Link to user analytics */}
      <Card className="border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
        <CardHeader>
          <CardTitle className="text-lg">User Analytics Dashboard</CardTitle>
          <CardDescription>
            View your personal usage analytics and platform performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <a href="/analytics">
              <Activity className="mr-2 h-4 w-4" />
              Go to User Analytics
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
