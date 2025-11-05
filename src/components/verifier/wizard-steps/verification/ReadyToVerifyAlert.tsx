
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Play } from 'lucide-react';

export function ReadyToVerifyAlert() {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertTitle>Pronto para Verificar</AlertTitle>
      <AlertDescription className="flex items-center">
        <span>Clique no botão <span className="inline-flex items-center mx-1 font-medium"><Play className="h-3 w-3 mr-1" />Iniciar Verificação</span> acima para começar o processo de verificação</span>
      </AlertDescription>
    </Alert>
  );
}
