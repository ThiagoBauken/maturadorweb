
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VerifierTable } from './VerifierTable';
import { VerificationData } from './types';

interface VerifierTabsContentProps {
  verificationData: VerificationData[];
}

export function VerifierTabsContent({ verificationData }: VerifierTabsContentProps) {
  const [selectedTab, setSelectedTab] = React.useState("all");
  
  // Count numbers by status
  const validCount = verificationData.filter(item => item.status === 'valid').length;
  const invalidCount = verificationData.filter(item => item.status === 'invalid').length;
  const pendingCount = verificationData.filter(item => item.status === 'pending').length;
  
  // Default to valid tab if there are valid results and no pending results
  React.useEffect(() => {
    if (pendingCount === 0 && validCount > 0 && selectedTab === 'all') {
      setSelectedTab('valid');
    }
  }, [pendingCount, validCount, selectedTab]);
  
  return (
    <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="valid">
            Válidos
            {validCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {validCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="invalid">
            Inválidos
            {invalidCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {invalidCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="mt-0">
        <VerifierTable 
          data={verificationData} 
          filter="all"
        />
      </TabsContent>
      
      <TabsContent value="valid" className="mt-0">
        <VerifierTable 
          data={verificationData.filter(item => item.status === 'valid')}
          filter="valid"
        />
      </TabsContent>
      
      <TabsContent value="invalid" className="mt-0">
        <VerifierTable 
          data={verificationData.filter(item => item.status === 'invalid')}
          filter="invalid"
        />
      </TabsContent>
      
      <TabsContent value="pending" className="mt-0">
        <VerifierTable 
          data={verificationData.filter(item => item.status === 'pending')}
          filter="pending"
        />
      </TabsContent>
    </Tabs>
  );
}
