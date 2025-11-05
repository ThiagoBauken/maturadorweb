
import { VerificationConfig } from '../../types/wizard-types';
import { VerificationControls } from './VerificationControls';

interface VerificationHeaderProps {
  config: VerificationConfig;
  verificationStarted: boolean;
  isVerifying: boolean;
  isPaused: boolean;
  startVerification: () => void;
  pauseVerification: () => void;
  resumeVerification: () => void;
  stopVerification: () => void;
}

export function VerificationHeader({
  config,
  verificationStarted,
  isVerifying,
  isPaused,
  startVerification,
  pauseVerification,
  resumeVerification,
  stopVerification
}: VerificationHeaderProps) {
  // Determine status text
  let statusText = "Aguardando início...";
  if (verificationStarted) {
    if (isPaused) {
      statusText = "Verificação pausada";
    } else if (isVerifying) {
      statusText = "Verificação em andamento";
    } else {
      statusText = "Verificação concluída ou parada";
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
      <div>
        <h3 className="text-lg font-medium">Status da Verificação</h3>
        <p className="text-sm text-muted-foreground">
          {statusText} • Método: {config.verificationMethod.toUpperCase()} • Lote: {config.batchSize}
        </p>
      </div>
      <VerificationControls
        verificationStarted={verificationStarted}
        isVerifying={isVerifying}
        isPaused={isPaused}
        startVerification={startVerification}
        pauseVerification={pauseVerification}
        resumeVerification={resumeVerification}
        stopVerification={stopVerification}
      />
    </div>
  );
}
