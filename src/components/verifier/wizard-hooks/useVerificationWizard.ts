
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { VerificationData } from '../types';
import { 
  VerificationWizardProps, 
  VerificationConfig, 
  ImportData,
  defaultConfig
} from '../types/wizard-types';
import { useImportDataProcessor } from '../hooks/useImportDataProcessor';
import { useSavedConfigurations } from '../hooks/useSavedConfigurations';
import { useVerifierProjects } from '../hooks/useVerifierProjects';

interface UseVerificationWizardProps extends VerificationWizardProps {
  projectId: string;
}

export function useVerificationWizard({ 
  projectId, 
  onComplete, 
  onCancel 
}: UseVerificationWizardProps) {
  const navigate = useNavigate();
  
  const [importData, setImportData] = useState<ImportData>({
    phoneNumbers: [],
    names: [],
    source: 'manual',
    countryCode: '+1'
  });
  
  const [config, setConfig] = useState<VerificationConfig>({
    ...defaultConfig,
    sessionLimits: {
      ...defaultConfig.sessionLimits,
      enabled: true,
      maxNumbersPerSession: 50,
      maxSessionsPerDay: 2,
      cooldownPeriod: 3600
    },
    rateLimits: {
      ...defaultConfig.rateLimits,
      enabled: true,
      requestsPerMinute: 10,
      maxDailyRequests: 200
    }
  });
  
  const [results, setResults] = useState<VerificationData[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const { savedConfigs, saveCurrentConfig, loadConfig } = useSavedConfigurations();
  const { processImportData } = useImportDataProcessor(config);
  const { addNumbersToProject } = useVerifierProjects();
  
  const handleSaveConfig = () => {
    saveCurrentConfig(config);
  };
  
  const handleLoadConfig = (configName: string) => {
    const loadedConfig = loadConfig(configName);
    if (loadedConfig) {
      setConfig(loadedConfig);
    }
  };
  
  const handleComplete = () => {
    // Save results to the current project
    if (results.length > 0) {
      addNumbersToProject(projectId, results);
    }
    
    if (onComplete) {
      onComplete(results);
    } else {
      // Show options to use the valid numbers
      const validNumbers = results.filter(r => r.status === 'valid');
      
      if (validNumbers.length > 0) {
        const confirmed = window.confirm(`Deseja usar os ${validNumbers.length} números verificados? Clique em OK para criar um aquecedor ou Cancelar para retornar ao dashboard.`);
        
        if (confirmed) {
          // Store the valid numbers for the warmer creation page
          localStorage.setItem('verified_numbers', JSON.stringify(validNumbers));
          navigate('/warmers/standard?from=verifier&name=Aquecedor+de+Números+Verificados');
          toast.success(`Criando aquecedor com ${validNumbers.length} números verificados`);
        } else {
          toast.success(`Verificação concluída: ${results.length} números processados`);
        }
      } else {
        toast.success(`Verificação concluída: ${results.length} números processados`);
      }
    }
  };
  
  // Handle imported data with duplicate detection
  const handleImportDataUpdate = (newImportData: ImportData) => {
    const processedData = processImportData(newImportData);
    setImportData(processedData);
  };

  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCancel = onCancel || (() => navigate(-1));
  
  return {
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
  };
}
