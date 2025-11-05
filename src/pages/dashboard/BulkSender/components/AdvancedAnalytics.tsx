
import React from 'react';
import { useBulkSender } from '../hooks/useBulkSender';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AdvancedAnalytics() {
  const { getTopPerformingTemplates } = useBulkSender();
  
  const topTemplates = getTopPerformingTemplates();
  
  // Format data for charts
  const templatePerformanceData = topTemplates.map(template => ({
    name: template.content.length > 20 
      ? template.content.substring(0, 20) + '...' 
      : template.content,
    sent: template.sentCount,
    read: template.readCount,
    responded: template.responseCount,
    deliveryRate: Math.round(template.deliveryRate * 100),
    readRate: Math.round(template.readRate * 100),
    responseRate: Math.round(template.responseRate * 100)
  }));

  // Calculate overall stats
  const totalSent = topTemplates.reduce((sum, template) => sum + template.sentCount, 0);
  const totalRead = topTemplates.reduce((sum, template) => sum + template.readCount, 0);
  const totalResponses = topTemplates.reduce((sum, template) => sum + template.responseCount, 0);
  
  const averageReadRate = totalSent > 0 
    ? Math.round((totalRead / totalSent) * 100) 
    : 0;
    
  const averageResponseRate = totalRead > 0 
    ? Math.round((totalResponses / totalRead) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Advanced Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Read Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageReadRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageResponseRate}%</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
          <CardDescription>
            Comparison of all message templates by delivery, read and response rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={templatePerformanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deliveryRate" name="Delivery Rate %" fill="#4ade80" />
                <Bar dataKey="readRate" name="Read Rate %" fill="#60a5fa" />
                <Bar dataKey="responseRate" name="Response Rate %" fill="#f472b6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Message Engagement</CardTitle>
          <CardDescription>
            Number of messages sent, read, and responded to by template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={templatePerformanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sent" name="Sent" fill="#4ade80" />
                <Bar dataKey="read" name="Read" fill="#60a5fa" />
                <Bar dataKey="responded" name="Responded" fill="#f472b6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
