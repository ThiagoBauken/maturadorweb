
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { VerificationConfig, SAVED_CONFIGS_KEY } from '../types/wizard-types';

export interface SavedConfig {
  name: string;
  config: VerificationConfig;
}

export function useSavedConfigurations() {
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  
  // Load saved configurations from localStorage on component mount
  useEffect(() => {
    const savedConfigsStr = localStorage.getItem(SAVED_CONFIGS_KEY);
    if (savedConfigsStr) {
      try {
        const configs = JSON.parse(savedConfigsStr);
        setSavedConfigs(configs);
      } catch (err) {
        console.error('Error loading saved configurations:', err);
      }
    }
  }, []);

  const saveCurrentConfig = (config: VerificationConfig) => {
    // Prompt user for configuration name
    const configName = prompt('Enter a name for this configuration:');
    if (!configName) return;
    
    // Check if name already exists
    const exists = savedConfigs.some(cfg => cfg.name === configName);
    if (exists) {
      const overwrite = confirm(`Configuration "${configName}" already exists. Overwrite?`);
      if (!overwrite) return;
    }
    
    // Save the configuration
    const newConfig = { name: configName, config };
    const updatedConfigs = exists 
      ? savedConfigs.map(cfg => cfg.name === configName ? newConfig : cfg)
      : [...savedConfigs, newConfig];
    
    setSavedConfigs(updatedConfigs);
    localStorage.setItem(SAVED_CONFIGS_KEY, JSON.stringify(updatedConfigs));
    toast.success(`Configuration "${configName}" saved successfully`);
  };
  
  const loadConfig = (configName: string) => {
    const selectedConfig = savedConfigs.find(cfg => cfg.name === configName);
    if (selectedConfig) {
      toast.info(`Configuration "${configName}" loaded`);
      return selectedConfig.config;
    }
    return null;
  };

  return {
    savedConfigs,
    saveCurrentConfig,
    loadConfig
  };
}
