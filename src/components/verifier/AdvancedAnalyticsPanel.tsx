
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw } from 'lucide-react';
import { VerificationData } from './types';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';

interface AdvancedAnalyticsPanelProps {
  data: VerificationData[];
}

export function AdvancedAnalyticsPanel({ data }: AdvancedAnalyticsPanelProps) {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('all');
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    if (timeRange === 'all') return data;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case 'day':
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return data.filter(item => {
      if (!item.verificationDate) return false;
      const verificationDate = new Date(item.verificationDate);
      return verificationDate >= cutoffDate;
    });
  };
  
  const filteredData = getFilteredData();
  
  // Prepare data for charts
  const validCount = filteredData.filter(item => item.status === 'valid').length;
  const invalidCount = filteredData.filter(item => item.status === 'invalid').length;
  const pendingCount = filteredData.filter(item => item.status === 'pending').length;
  
  // Status distribution data
  const statusDistributionData = [
    { name: 'Valid', value: validCount },
    { name: 'Invalid', value: invalidCount },
    { name: 'Pending', value: pendingCount },
  ];
  
  // Time-based verification data (group by date)
  const getTimeSeriesData = () => {
    const dateMap = new Map();
    
    filteredData.forEach(item => {
      if (!item.verificationDate) return;
      
      const date = new Date(item.verificationDate);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { date: dateKey, valid: 0, invalid: 0, pending: 0 });
      }
      
      const currentData = dateMap.get(dateKey);
      currentData[item.status]++;
    });
    
    return Array.from(dateMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const timeSeriesData = getTimeSeriesData();
  
  // Country code distribution data (assuming phoneNumber starts with country code)
  const getCountryCodeData = () => {
    const countryCodeMap = new Map();
    
    filteredData.forEach(item => {
      // Extract country code (assuming format like +1, +44, etc.)
      const countryCode = item.phoneNumber.match(/^\+\d+/)?.[0] || 'Unknown';
      
      if (!countryCodeMap.has(countryCode)) {
        countryCodeMap.set(countryCode, { countryCode, count: 0 });
      }
      
      const currentData = countryCodeMap.get(countryCode);
      currentData.count++;
    });
    
    return Array.from(countryCodeMap.values())
      .sort((a, b) => b.count - a.count); // Sort by count descending
  };
  
  const countryCodeData = getCountryCodeData();
  
  // Colors for the pie chart
  const COLORS = ['#4caf50', '#f44336', '#ff9800'];
  
  const handleExportAnalytics = () => {
    try {
      // Create a detailed analytics object
      const analytics = {
        summary: {
          total: filteredData.length,
          valid: validCount,
          invalid: invalidCount,
          pending: pendingCount,
          validPercentage: filteredData.length ? (validCount / filteredData.length * 100).toFixed(2) + '%' : '0%',
        },
        timeSeries: timeSeriesData,
        countryDistribution: countryCodeData,
        timeRange: timeRange,
        exportDate: new Date().toISOString(),
      };
      
      // Convert to JSON
      const jsonData = JSON.stringify(analytics, null, 2);
      
      // Create a blob and download
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `verification-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast.error('Failed to export analytics data');
    }
  };
  
  const handleRefresh = () => {
    toast.info('Refreshing analytics data...');
    // In a real application, this would trigger a refresh of the data
    setTimeout(() => {
      toast.success('Analytics data refreshed');
    }, 800);
  };
  
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Analytics</CardTitle>
          <CardDescription>No verification data available</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Complete a verification process to see analytics</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <CardTitle>Verification Analytics</CardTitle>
          <CardDescription>Detailed insights from your verification processes</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={(value: 'day' | 'week' | 'month' | 'all') => setTimeRange(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Valid Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-500">{validCount}</div>
                  <p className="text-muted-foreground">
                    {filteredData.length ? (validCount / filteredData.length * 100).toFixed(1) + '%' : '0%'} of total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Invalid Numbers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-500">{invalidCount}</div>
                  <p className="text-muted-foreground">
                    {filteredData.length ? (invalidCount / filteredData.length * 100).toFixed(1) + '%' : '0%'} of total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-lg">Pending Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-500">{pendingCount}</div>
                  <p className="text-muted-foreground">
                    {filteredData.length ? (pendingCount / filteredData.length * 100).toFixed(1) + '%' : '0%'} of total
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Country Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={countryCodeData.slice(0, 5)} // Show top 5 country codes
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="countryCode" type="category" width={50} />
                      <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                      <Bar dataKey="count" fill="#8884d8" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Verification Trends Over Time</CardTitle>
                <CardDescription>Number of verifications by status per day</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="valid" stroke="#4caf50" strokeWidth={2} />
                    <Line type="monotone" dataKey="invalid" stroke="#f44336" strokeWidth={2} />
                    <Line type="monotone" dataKey="pending" stroke="#ff9800" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Number Distribution Analysis</CardTitle>
                <CardDescription>Insights on number patterns and distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Country Code Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={countryCodeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => 
                              percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="countryCode"
                          >
                            {countryCodeData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`hsl(${index * 30 % 360}, 70%, 60%)`} 
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value}`, name]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Verification Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[{
                            name: 'Overall',
                            valid: validCount,
                            invalid: invalidCount,
                            pending: pendingCount
                          }]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey="valid" 
                            stackId="a" 
                            fill="#4caf50" 
                            name="Valid" 
                          />
                          <Bar 
                            dataKey="invalid" 
                            stackId="a" 
                            fill="#f44336" 
                            name="Invalid" 
                          />
                          <Bar 
                            dataKey="pending" 
                            stackId="a" 
                            fill="#ff9800" 
                            name="Pending" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
