
import { 
  WizardContainer,
  StepNavigation,
  ConfigurationActions
} from './wizard-components';
import { WizardStep } from '@/components/common/linear-wizard';
import { ImportStep } from './wizard-steps/ImportStep';
import { ConfigurationStep } from './wizard-steps/ConfigurationStep';
import { VerificationStep } from './wizard-steps/VerificationStep';
import { ResultsStep } from './wizard-steps/ResultsStep';
import { VerificationWizardProps } from './types/wizard-types';
import { useVerificationWizard } from './wizard-hooks/useVerificationWizard';

interface EnhancedVerificationWizardProps extends VerificationWizardProps {
  projectId: string;
}

export function VerificationWizard({ projectId, onComplete, onCancel }: EnhancedVerificationWizardProps) {
  const {
    importData,
    config,
    results,
    isVerifying,
    currentStep,
    savedConfigs,
    handleImportDataUpdate,
    setConfig,
    setResults,
    setIsVerifying,
    goToNextStep,
    goToPreviousStep,
    handleSaveConfig,
    handleLoadConfig,
    handleComplete,
    handleCancel
  } = useVerificationWizard({ projectId, onComplete, onCancel });

  // Step names for the progress indicator
  const stepTitles = ['Importar', 'Configurar', 'Verificar', 'Resultados'];
  
  return (
    <div className="relative">
      {/* Configuration Actions */}
      {currentStep === 1 && (
        <ConfigurationActions 
          config={config}
          savedConfigs={savedConfigs}
          onSaveConfig={handleSaveConfig}
          onLoadConfig={handleLoadConfig}
        />
      )}
      
      <WizardContainer 
        currentStep={currentStep}
        stepTitles={stepTitles}
      >
        <WizardStep step={0}>
          <ImportStep 
            importData={importData}
            setImportData={handleImportDataUpdate}
            config={config}
          />
          <StepNavigation 
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            onCancel={handleCancel}
            isFirstStep={true}
            isNextDisabled={importData.phoneNumbers.length === 0}
            nextLabel="Avançar: Configurar"
          />
        </WizardStep>
        
        <WizardStep step={1}>
          <ConfigurationStep 
            config={config}
            setConfig={setConfig}
            numbersCount={importData.phoneNumbers.length}
          />
          <StepNavigation 
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            onCancel={handleCancel}
            isFirstStep={false}
            nextLabel="Avançar: Iniciar Verificação"
          />
        </WizardStep>
        
        <WizardStep step={2}>
          <VerificationStep 
            importData={importData}
            config={config}
            setResults={setResults}
            isVerifying={isVerifying}
            setIsVerifying={setIsVerifying}
            projectId={projectId}
          />
          <StepNavigation 
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            onCancel={handleCancel}
            isFirstStep={false}
            isNextDisabled={isVerifying || results.length === 0}
            isPreviousDisabled={isVerifying}
            nextLabel="Avançar: Ver Resultados"
          />
        </WizardStep>
        
        <WizardStep step={3}>
          <ResultsStep 
            results={results}
            projectId={projectId}
          />
          <StepNavigation 
            onNext={handleComplete}
            onPrevious={goToPreviousStep}
            onCancel={handleCancel}
            isFirstStep={false}
            nextLabel="Finalizar"
          />
        </WizardStep>
      </WizardContainer>
    </div>
  );
}
