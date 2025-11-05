
import { Button } from '@/components/ui/button';
import { SaveIcon, FolderOpen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VerificationConfig } from '../types/wizard-types';
import { SavedConfig } from '../hooks/useSavedConfigurations';

interface ConfigurationActionsProps {
  config: VerificationConfig;
  savedConfigs: SavedConfig[];
  onSaveConfig: () => void;
  onLoadConfig: (configName: string) => void;
}

export function ConfigurationActions({
  config,
  savedConfigs,
  onSaveConfig,
  onLoadConfig
}: ConfigurationActionsProps) {
  return (
    <div className="absolute top-2 right-2 flex space-x-2 z-10">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onSaveConfig}
        className="flex items-center gap-1"
      >
        <SaveIcon className="h-4 w-4" />
        Save
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            disabled={savedConfigs.length === 0}
          >
            <FolderOpen className="h-4 w-4" />
            Load
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {savedConfigs.map((cfg) => (
            <DropdownMenuItem 
              key={cfg.name}
              onClick={() => onLoadConfig(cfg.name)}
            >
              {cfg.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
