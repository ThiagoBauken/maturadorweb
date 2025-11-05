
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Info, Database } from 'lucide-react';
import { VerificationData } from './types';
import { toast } from 'sonner';

interface NumberIntelligenceProps {
  number: VerificationData;
}

export function NumberIntelligence({ number }: NumberIntelligenceProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // In a real app, these would be fetched from an API
  const mockIntelligenceData = {
    carrierInfo: {
      carrier: 'Vivo Mobile',
      countryCode: '+55',
      countryName: 'Brazil',
      networkType: 'Mobile',
      lineType: 'Prepaid',
    },
    riskAssessment: {
      spamScore: 12,
      fraudRisk: 'Low',
      activityScore: 85,
      lastSeen: '2023-10-15',
      registrationDate: '2020-05-22',
    },
    whatsAppStatus: {
      isActive: true,
      lastActive: '2023-12-01',
      profilePictureExists: true,
      statusMessage: 'Available',
      statusLastUpdated: '2023-11-10',
    },
    accountProtection: {
      recommendedActions: [
        'Start with minimal message frequency',
        'Avoid promotional content initially',
        'Use personalized messages',
        'Gradually increase interaction volume',
      ],
      riskFactors: [
        'Recently verified number',
        'No previous message history',
      ]
    }
  };
  
  const handleRefreshIntelligence = () => {
    setLoading(true);
    toast.info('Updating number intelligence data...');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Number intelligence data updated');
    }, 1500);
  };
  
  const getSpamRiskBadge = (score: number) => {
    if (score < 20) return <Badge variant="success">Low</Badge>;
    if (score < 60) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="destructive">High</Badge>;
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Number Intelligence
            </CardTitle>
            <CardDescription>
              Advanced data and insights for {number.phoneNumber}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshIntelligence} 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="carrier">Carrier Data</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="protection">Protection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium mb-2">Number Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Phone Number:</div>
                    <div className="font-medium">{number.phoneNumber}</div>
                    
                    <div className="text-muted-foreground">Status:</div>
                    <div>
                      {number.status === 'valid' && <Badge variant="success">Valid</Badge>}
                      {number.status === 'invalid' && <Badge variant="destructive">Invalid</Badge>}
                      {number.status === 'pending' && <Badge variant="outline">Pending</Badge>}
                    </div>
                    
                    <div className="text-muted-foreground">Verification Date:</div>
                    <div className="font-medium">{number.verificationDate || 'N/A'}</div>
                    
                    <div className="text-muted-foreground">Country:</div>
                    <div className="font-medium">{mockIntelligenceData.carrierInfo.countryName}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-medium mb-2">Risk Assessment</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Spam Risk:</div>
                    <div>{getSpamRiskBadge(mockIntelligenceData.riskAssessment.spamScore)}</div>
                    
                    <div className="text-muted-foreground">Fraud Risk:</div>
                    <div className="font-medium">{mockIntelligenceData.riskAssessment.fraudRisk}</div>
                    
                    <div className="text-muted-foreground">Activity Score:</div>
                    <div className="font-medium">{mockIntelligenceData.riskAssessment.activityScore}/100</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>WhatsApp Status</AlertTitle>
                  <AlertDescription>
                    This number is {mockIntelligenceData.whatsAppStatus.isActive ? 'active' : 'inactive'} on WhatsApp. 
                    Last seen: {mockIntelligenceData.whatsAppStatus.lastActive}.
                  </AlertDescription>
                </Alert>
                
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Recommended Actions</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4 mt-2 space-y-1">
                      {mockIntelligenceData.accountProtection.recommendedActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="carrier">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Carrier Information</CardTitle>
                <CardDescription>Detailed carrier and network data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carrier:</span>
                        <span>{mockIntelligenceData.carrierInfo.carrier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country:</span>
                        <span>{mockIntelligenceData.carrierInfo.countryName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Country Code:</span>
                        <span>{mockIntelligenceData.carrierInfo.countryCode}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Network Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Network Type:</span>
                        <span>{mockIntelligenceData.carrierInfo.networkType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Line Type:</span>
                        <span>{mockIntelligenceData.carrierInfo.lineType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number Portability:</span>
                        <span>Not ported</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertTitle>Data Source</AlertTitle>
                  <AlertDescription>
                    Carrier data is aggregated from telecommunication databases and may be periodically updated.
                    Last updated: 2023-12-10
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Activity Monitoring</CardTitle>
                <CardDescription>WhatsApp activity and engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Last Activity</h4>
                      <p className="text-2xl font-bold">{mockIntelligenceData.whatsAppStatus.lastActive}</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on WhatsApp presence</p>
                    </div>
                    
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Activity Score</h4>
                      <p className="text-2xl font-bold">{mockIntelligenceData.riskAssessment.activityScore}/100</p>
                      <p className="text-xs text-muted-foreground mt-1">Based on messaging patterns</p>
                    </div>
                    
                    <div className="bg-secondary/20 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Registration Date</h4>
                      <p className="text-2xl font-bold">{mockIntelligenceData.riskAssessment.registrationDate}</p>
                      <p className="text-xs text-muted-foreground mt-1">WhatsApp account creation</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-4">Profile Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Profile Picture</span>
                          <Badge variant={mockIntelligenceData.whatsAppStatus.profilePictureExists ? "success" : "outline"}>
                            {mockIntelligenceData.whatsAppStatus.profilePictureExists ? "Present" : "Not Found"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Status Message</span>
                          <Badge variant="outline">{mockIntelligenceData.whatsAppStatus.statusMessage}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Status Updated</span>
                          <span className="text-sm font-medium">{mockIntelligenceData.whatsAppStatus.statusLastUpdated}</span>
                        </div>
                      </div>
                      
                      <Alert variant="default">
                        <AlertTitle>Privacy Notice</AlertTitle>
                        <AlertDescription className="text-xs text-muted-foreground">
                          Activity data is collected in accordance with WhatsApp's privacy policy 
                          and is only available for numbers that have interacted with business accounts.
                          No personal messages or content are monitored.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="protection">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">WhatsApp Account Protection</CardTitle>
                <CardDescription>
                  Recommendations to protect your account and enhance message delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Risk Factors Detected</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2">
                      {mockIntelligenceData.accountProtection.riskFactors.map((factor, index) => (
                        <li key={index} className="mt-1">{factor}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h3 className="text-md font-medium mb-3">Recommended Safety Practices</h3>
                  <div className="space-y-2">
                    {mockIntelligenceData.accountProtection.recommendedActions.map((action, index) => (
                      <div key={index} className="flex items-start">
                        <div className="bg-primary/10 text-primary rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
                          {index + 1}
                        </div>
                        <p>{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="text-md font-medium mb-3">Account Health Score</h3>
                  <div className="relative h-4 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                      style={{ width: '75%' }}  // In a real app, this would be dynamic
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>Needs Improvement</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                  
                  <p className="text-sm mt-4">
                    Your account health is good. Follow the recommended practices to 
                    maintain high message delivery rates and avoid restrictions.
                  </p>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full">
                    Generate Detailed Protection Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
