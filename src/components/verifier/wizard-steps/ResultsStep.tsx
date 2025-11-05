
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { VerifierTable } from '../VerifierTable';
import { VerificationData } from '../types';
import { Flame, Send } from 'lucide-react';
import { useVerifiedNumbersTransfer } from '../hooks/useVerifiedNumbersTransfer';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';

interface ResultsStepProps {
  results: VerificationData[];
  projectId: string;
}

export function ResultsStep({ results, projectId }: ResultsStepProps) {
  const navigate = useNavigate();
  const { saveNumbersForTransfer } = useVerifiedNumbersTransfer();
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  // Format phone numbers in the results
  const formattedResults = results.map(result => ({
    ...result,
    phoneNumber: formatPhoneNumber(result.phoneNumber)
  }));
  
  const validNumbers = formattedResults.filter(r => r.status === 'valid');
  const invalidNumbers = formattedResults.filter(r => r.status === 'invalid');
  const pendingNumbers = formattedResults.filter(r => r.status === 'pending');
  
  const createWarmer = () => {
    try {
      if (validNumbers.length === 0) {
        toast.error('Não há números válidos para criar um aquecedor');
        return;
      }
      
      // Save to localStorage for transfer, include project info
      if (saveNumbersForTransfer(validNumbers, 'warmer', { projectId })) {
        navigate('/warmers/standard?from=verifier&name=Aquecedor+de+Números+Verificados');
        toast.success(`Criando aquecedor com ${validNumbers.length} números verificados`);
      }
    } catch (error) {
      console.error('Erro ao criar aquecedor:', error);
      toast.error('Falha ao criar aquecedor');
    }
  };
  
  const sendToBulkSender = () => {
    try {
      if (validNumbers.length === 0) {
        toast.error('Não há números válidos para enviar mensagens');
        return;
      }
      
      // Save formatted phone numbers for bulk sender, include project info
      if (saveNumbersForTransfer(validNumbers, 'bulk sender', { projectId })) {
        navigate('/bulk-sender?from=verifier');
        toast.success(`Preparados ${validNumbers.length} números verificados para envio em massa`);
      }
    } catch (error) {
      console.error('Erro ao enviar para bulk sender:', error);
      toast.error('Falha ao preparar números para envio em massa');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium">Resultados da Verificação</h3>
          <p className="text-sm text-muted-foreground">
            {formattedResults.length} números processados: {validNumbers.length} válidos, {invalidNumbers.length} inválidos, {pendingNumbers.length} pendentes
          </p>
        </div>
        
        {validNumbers.length > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={sendToBulkSender} 
              className="flex items-center gap-2"
            >
              <span className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagens
              </span>
            </Button>
            <Button 
              onClick={createWarmer} 
              className="flex items-center gap-2"
            >
              <span className="flex items-center">
                <Flame className="h-4 w-4 mr-2" />
                Criar Aquecedor
              </span>
            </Button>
          </div>
        )}
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <TabsList className="border-b rounded-none w-full justify-start">
              <TabsTrigger value="all">Todos ({formattedResults.length})</TabsTrigger>
              <TabsTrigger value="valid">Válidos ({validNumbers.length})</TabsTrigger>
              <TabsTrigger value="invalid">Inválidos ({invalidNumbers.length})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({pendingNumbers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="p-0">
              <VerifierTable data={formattedResults} filter="all" />
            </TabsContent>
            <TabsContent value="valid" className="p-0">
              <VerifierTable data={validNumbers} filter="valid" />
            </TabsContent>
            <TabsContent value="invalid" className="p-0">
              <VerifierTable data={invalidNumbers} filter="invalid" />
            </TabsContent>
            <TabsContent value="pending" className="p-0">
              <VerifierTable data={pendingNumbers} filter="pending" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
