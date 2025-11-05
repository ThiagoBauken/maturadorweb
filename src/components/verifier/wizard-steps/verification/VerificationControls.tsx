import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VerificationControlsProps {
  verificationStarted: boolean;
  isVerifying: boolean;
  isPaused: boolean;
  startVerification: () => void;
  pauseVerification: () => void;
  resumeVerification: () => void;
  stopVerification: () => void;
}

export function VerificationControls({
  verificationStarted,
  isVerifying,
  isPaused,
  startVerification,
  pauseVerification,
  resumeVerification,
  stopVerification
}: VerificationControlsProps) {
  const handleStartClick = () => {
    startVerification();
    toast.success('Verificação iniciada!');
  };
  
  return (
    <div className="flex space-x-2">
      {!verificationStarted ? (
        <Button 
          onClick={handleStartClick} 
          className="flex items-center bg-primary hover:bg-primary/90"
        >
          <Play className="mr-1 h-4 w-4" />
          Iniciar Verificação
        </Button>
      ) : isVerifying ? (
        <>
          {isPaused ? (
            <Button 
              onClick={resumeVerification} 
              variant="outline" 
              className="flex items-center"
            >
              <Play className="mr-1 h-4 w-4" />
              Continuar
            </Button>
          ) : (
            <Button 
              onClick={pauseVerification} 
              variant="outline" 
              className="flex items-center"
            >
              <Pause className="mr-1 h-4 w-4" />
              Pausar
            </Button>
          )}
          <Button 
            onClick={stopVerification} 
            variant="destructive" 
            className="flex items-center"
          >
            <StopCircle className="mr-1 h-4 w-4" />
            Parar
          </Button>
        </>
      ) : (
        <Button 
          onClick={handleStartClick} 
          variant="outline" 
          className="flex items-center"
        >
          <Play className="mr-1 h-4 w-4" />
          Reiniciar
        </Button>
      )}
    </div>
  );
}
