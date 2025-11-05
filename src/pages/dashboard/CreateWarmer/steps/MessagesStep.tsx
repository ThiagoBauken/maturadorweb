
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WizardNavigation } from '@/components/common/linear-wizard';
import { MediaSelector } from '@/components/warmers/MediaSelector';
import { WarmerForm } from '../types';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCog } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface MessagesStepProps {
  formData: WarmerForm;
  handleChange: (field: keyof WarmerForm, value: any) => void;
  handleMediaFrequencyChange: (type: string, value: number) => void;
}

export const MessagesStep: React.FC<MessagesStepProps> = ({
  formData,
  handleChange,
  handleMediaFrequencyChange
}) => {
  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="targetCount">Total de Mensagens por Número (Opcional)</Label>
              <div className="text-xs text-muted-foreground">
                Deixe em branco para warming contínuo
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                id="targetCount" 
                type="number"
                min={1}
                max={500}
                value={formData.targetCount !== null ? formData.targetCount : ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseInt(e.target.value);
                  handleChange('targetCount', value);
                }}
                placeholder="Sem limite"
              />
              <span className="text-muted-foreground">mensagens</span>
            </div>
            <p className="text-sm text-muted-foreground">
              O warming continua indefinidamente se nenhum valor for definido
            </p>
          </div>

          {/* AI Integration Section - Simplified */}
          <Card className="border-purple-200">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <BrainCog className="h-5 w-5 text-purple-500" />
                <Label className="font-medium">Automação de Conversa com IA</Label>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Prompt da IA</Label>
                  <Textarea 
                    id="ai-prompt" 
                    value={formData.aiPrompt}
                    onChange={(e) => handleChange('aiPrompt', e.target.value)}
                    placeholder="Instruções para a IA simular uma conversa natural"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    O prompt define como a IA vai responder e se comportar durante a conversa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          <div className="space-y-2">
            <Label>Templates de Mensagens</Label>
            <div className="space-y-2">
              {formData.messageTemplates.map((template, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input 
                    value={template}
                    onChange={(e) => {
                      const newTemplates = [...formData.messageTemplates];
                      newTemplates[index] = e.target.value;
                      handleChange('messageTemplates', newTemplates);
                    }}
                    placeholder="Template de mensagem"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    type="button"
                    onClick={() => {
                      const newTemplates = formData.messageTemplates.filter((_, i) => i !== index);
                      handleChange('messageTemplates', newTemplates);
                    }}
                    disabled={formData.messageTemplates.length <= 1}
                  >
                    Remover
                  </Button>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={() => {
                  handleChange('messageTemplates', [...formData.messageTemplates, '']);
                }}
              >
                Adicionar Template
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Múltiplos templates serão usados aleatoriamente para parecer mais natural
            </p>
          </div>

          <MediaSelector
            enabled={formData.mediaEnabled}
            onEnableChange={(enabled) => handleChange('mediaEnabled', enabled)}
            selectedTypes={formData.mediaTypes}
            onTypeChange={(types) => handleChange('mediaTypes', types)}
            mediaFrequency={formData.mediaFrequency}
            onMediaFrequencyChange={handleMediaFrequencyChange}
            editable={true}
            mediaPerConversation={true}
          />

          <div className="space-y-2 pt-2">
            <Label>Configurações de Comportamento</Label>
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enable-emojis"
                  checked={formData.enableEmojis}
                  onCheckedChange={(checked) => {
                    handleChange('enableEmojis', !!checked);
                  }}
                />
                <Label 
                  htmlFor="enable-emojis" 
                  className="font-normal cursor-pointer"
                >
                  Incluir emojis aleatoriamente nas mensagens
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enable-typing"
                  checked={formData.enableTypingIndicator}
                  onCheckedChange={(checked) => {
                    handleChange('enableTypingIndicator', !!checked);
                  }}
                />
                <Label 
                  htmlFor="enable-typing" 
                  className="font-normal cursor-pointer"
                >
                  Mostrar indicador de digitação antes de enviar
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="enable-receipts"
                  checked={formData.enableReadReceipts}
                  onCheckedChange={(checked) => {
                    handleChange('enableReadReceipts', !!checked);
                  }}
                />
                <Label 
                  htmlFor="enable-receipts" 
                  className="font-normal cursor-pointer"
                >
                  Habilitar confirmações de leitura
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <WizardNavigation />
    </>
  );
};
