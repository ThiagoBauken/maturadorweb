
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { VerificationConfig } from '../types/wizard-types';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface ConfigurationStepProps {
  config: VerificationConfig;
  setConfig: (config: VerificationConfig) => void;
  numbersCount: number;
}

export function ConfigurationStep({ config, setConfig, numbersCount }: ConfigurationStepProps) {
  const updateConfig = (field: keyof VerificationConfig, value: any) => {
    setConfig({ ...config, [field]: value });
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Configure Verification</h2>
      <p className="text-muted-foreground">
        Customize how your verification process will work
      </p>
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label htmlFor="batch-size" className="mr-2">Batch Size</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Number of phone numbers to verify in one batch
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium">{config.batchSize}</span>
            </div>
            <Slider
              id="batch-size"
              value={[config.batchSize]}
              min={10}
              max={500}
              step={10}
              onValueChange={(values) => updateConfig('batchSize', values[0])}
              className="py-4"
            />
            <p className="text-xs text-muted-foreground">
              {numbersCount > 0 && `Will be processed in approximately ${Math.ceil(numbersCount / config.batchSize)} batch(es)`}
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Label className="mr-2">Verification Method</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>API: Faster, uses direct WhatsApp API</p>
                  <p>Web: More reliable, uses web techniques</p>
                  <p>Hybrid: Combines both methods</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <RadioGroup 
              value={config.verificationMethod} 
              onValueChange={(value: 'api' | 'web' | 'hybrid') => updateConfig('verificationMethod', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="api" id="api" />
                <div>
                  <Label htmlFor="api" className="font-medium">API Method</Label>
                  <p className="text-sm text-muted-foreground">Faster, but may have rate limits</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="web" id="web" />
                <div>
                  <Label htmlFor="web" className="font-medium">Web Method</Label>
                  <p className="text-sm text-muted-foreground">More reliable, but slower</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <div>
                  <Label htmlFor="hybrid" className="font-medium">Hybrid (Recommended)</Label>
                  <p className="text-sm text-muted-foreground">Balance of speed and reliability</p>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="concurrent-requests" className="mr-2">Concurrent Requests</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    How many numbers to verify simultaneously
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="concurrent-requests"
                type="number"
                min={1}
                max={20}
                value={config.concurrentRequests}
                onChange={(e) => updateConfig('concurrentRequests', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="retry-count" className="mr-2">Retry Count</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Number of retries for failed verifications
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="retry-count"
                type="number"
                min={0}
                max={5}
                value={config.retryCount}
                onChange={(e) => updateConfig('retryCount', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="timeout-seconds" className="mr-2">Timeout (seconds)</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    How long to wait before timing out a verification
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                id="timeout-seconds"
                type="number"
                min={5}
                max={120}
                value={config.timeoutSeconds}
                onChange={(e) => updateConfig('timeoutSeconds', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Additional Options</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable-country-validation">Country Code Validation</Label>
                <p className="text-xs text-muted-foreground">
                  Validate if the country code exists and is in the correct format
                </p>
              </div>
              <Switch 
                id="enable-country-validation"
                checked={config.enableCountryValidation}
                onCheckedChange={(checked) => updateConfig('enableCountryValidation', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="validate-duplicates">Duplicate Detection</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically detect and remove duplicate phone numbers
                </p>
              </div>
              <Switch 
                id="validate-duplicates"
                checked={config.validateDuplicates}
                onCheckedChange={(checked) => updateConfig('validateDuplicates', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
