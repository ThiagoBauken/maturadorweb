
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { WarmerTypeSelector } from '@/components/warmers';
import { WizardNavigation } from '@/components/common/linear-wizard';
import { NumberRotationSettings } from '@/components/warmers/NumberRotationSettings';
import { WarmerForm } from '../types';
import { availableSessions } from '../utils';

interface BasicInfoStepProps {
  formData: WarmerForm;
  handleChange: (field: keyof WarmerForm, value: any) => void;
  isEditing: boolean;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  formData,
  handleChange,
  isEditing
}) => {
  // Prepare accounts for the number rotation component
  const accounts = availableSessions.map(session => ({
    id: session.id,
    name: session.name,
    phone: session.phone,
    status: session.status
  }));

  // Handle rotation settings changes
  const handleNumberRotationEnabledChange = (enabled: boolean) => {
    handleChange('numberRotation', enabled);
  };

  const handleRotationTypeChange = (type: 'all-to-all' | 'round-robin' | 'random') => {
    // Map rotation types to our form data structure
    if (type === 'all-to-all') {
      handleChange('simultaneousSending', true);
    } else {
      handleChange('simultaneousSending', false);
      // Set the rotation mode based on selection
      handleChange('rotationMode', type === 'round-robin' ? 'sequential' : 'random');
    }
  };

  // Determine the current rotation type based on form data
  const getCurrentRotationType = (): 'all-to-all' | 'round-robin' | 'random' => {
    if (formData.simultaneousSending) {
      return 'all-to-all';
    } else {
      return formData.rotationMode === 'sequential' ? 'round-robin' : 'random';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de Warmer</Label>
            <WarmerTypeSelector
              selectedType={formData.type}
              onSelectType={(type) => handleChange('type', type)}
              disabled={isEditing}
            />
          </div>

          {formData.type === 'standard-warmer' && (
            <div className="space-y-2">
              <Label>Subtipo de Warmer</Label>
              <RadioGroup 
                value={formData.subType || 'number-to-number'} 
                onValueChange={(value) => handleChange('subType', value)}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="number-to-number" id="type-standard" />
                  <Label htmlFor="type-standard" className="font-normal cursor-pointer">
                    Number-to-Number Warmer
                  </Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="number-to-group" id="type-group" />
                  <Label htmlFor="type-group" className="font-normal cursor-pointer">
                    Group Warmer
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Warmer</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Warmer Principal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descreva o propósito deste warmer"
              rows={2}
            />
          </div>

          {/* WhatsApp Number Rotation Settings */}
          <NumberRotationSettings
            enabled={formData.numberRotation}
            rotationType={getCurrentRotationType()}
            onEnabledChange={handleNumberRotationEnabledChange}
            onTypeChange={handleRotationTypeChange}
            accounts={accounts}
            selectedAccounts={formData.accounts}
            onAccountsChange={(accounts) => handleChange('accounts', accounts)}
            className="pt-4"
          />

          {formData.type === 'standard-warmer' && formData.subType === 'number-to-group' && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Nome do Grupo do WhatsApp</Label>
              <Input
                id="groupName"
                value={formData.groupName}
                onChange={(e) => handleChange('groupName', e.target.value)}
                placeholder="Digite o nome exato do grupo do WhatsApp"
              />
              <p className="text-sm text-muted-foreground">
                O grupo deve existir e sua conta do WhatsApp deve ser membro dele
              </p>
            </div>
          )}
        </div>
      </div>
      <WizardNavigation />
    </>
  );
};
