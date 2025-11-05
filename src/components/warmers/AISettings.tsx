
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, AlertCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AISettingsProps {
  enabled: boolean;
  provider: 'deepseek' | 'openai';
  prompt: string;
  replyPercentage: number;
  apiKey: string;
  onEnabledChange: (enabled: boolean) => void;
  onProviderChange: (provider: 'deepseek' | 'openai') => void;
  onPromptChange: (prompt: string) => void;
  onReplyPercentageChange: (value: number) => void;
  onApiKeyChange: (value: string) => void;
  className?: string;
}

export function AISettings({
  enabled,
  provider,
  prompt,
  replyPercentage,
  apiKey,
  onEnabledChange,
  onProviderChange,
  onPromptChange,
  onReplyPercentageChange,
  onApiKeyChange,
  className = ''
}: AISettingsProps) {
  const defaultPrompts = [
    "Você é um contato do WhatsApp e vai simular uma conversa natural. Suas respostas devem ser curtas, informais e com erros de digitação ocasionais.",
    "Simule uma conversa amigável sobre trabalho. Responda de forma breve e use emojis ocasionalmente.",
    "Responda como se fosse um amigo próximo, usando linguagem informal e gírias. Mantenha respostas curtas.",
    "Simule um colega de trabalho discutindo projetos. Use português formal, mas mantenha as respostas breves.",
    "Responda como um familiar próximo. Use expressões carinhosas e pergunte sobre o dia."
  ];

  const handleApplyDefaultPrompt = (promptText: string) => {
    onPromptChange(promptText);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="enable-ai" 
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(!!checked)}
        />
        <Label htmlFor="enable-ai" className="flex items-center gap-2 font-medium cursor-pointer">
          <BrainCircuit className="h-4 w-4" />
          Habilitar Conversa com IA
        </Label>
      </div>
      
      {enabled && (
        <div className="pl-6 space-y-4 border-l-2 border-l-muted">
          <p className="text-sm text-muted-foreground">
            Use IA para gerar respostas dinâmicas e manter a conversa fluindo naturalmente.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Provedor de IA</Label>
            <Select 
              value={provider} 
              onValueChange={(value) => onProviderChange(value as 'deepseek' | 'openai')}
            >
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Selecione o provedor de IA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepseek">DeepSeek AI</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">Chave de API ({provider})</Label>
            <Input 
              id="api-key" 
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-muted-foreground">
              A chave será armazenada apenas neste dispositivo e usada para gerar respostas.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="reply-percentage">Frequência de Respostas</Label>
              <span className="text-sm font-medium">{replyPercentage}%</span>
            </div>
            <Slider
              id="reply-percentage"
              value={[replyPercentage]}
              min={10}
              max={100}
              step={5}
              onValueChange={(values) => onReplyPercentageChange(values[0])}
            />
            <p className="text-xs text-muted-foreground">
              Define a porcentagem de mensagens que receberão uma resposta automática da IA.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Prompt para a IA</Label>
            <Textarea 
              id="ai-prompt" 
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Instruções para a IA sobre como responder..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              O prompt orienta como a IA responde. Exemplo: "Responda como um colega de trabalho amigável discutindo projetos."
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Prompts Pré-definidos</Label>
            <div className="grid grid-cols-1 gap-2">
              {defaultPrompts.map((defaultPrompt, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  size="sm"
                  className="justify-start h-auto py-2 text-left"
                  onClick={() => handleApplyDefaultPrompt(defaultPrompt)}
                >
                  <span className="truncate">{defaultPrompt.substring(0, 60)}...</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center p-3 bg-amber-50 rounded-md text-amber-800 gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <p>As respostas da IA consumirão créditos da sua conta {provider}. Monitore o uso para evitar cobranças inesperadas.</p>
          </div>
        </div>
      )}
    </div>
  );
}
