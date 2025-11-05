
import React from 'react';
import { WizardNavigation, WizardSummary } from '@/components/common/linear-wizard';
import { WarmerForm } from '../types';
import { getTypeIcon, getTypeText, getSubtypeIcon, getSubtypeText, weekDays, availableSessions } from '../utils';
import { Day } from '@/components/common/schedule';

interface ReviewStepProps {
  formData: WarmerForm;
  isEditing: boolean;
  handleSubmit: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  isEditing,
  handleSubmit
}) => {
  return (
    <>
      <WizardSummary
        title="Resumo do Warmer"
        description="Revise a configuração do seu warmer antes de criar"
        items={[
          { 
            label: "Tipo de Warmer", 
            value: (
              <div className="flex items-center">
                {getTypeIcon(formData.type)}
                <span className="ml-2">
                  {getTypeText(formData.type)}
                </span>
              </div>
            ) 
          },
          { 
            label: "Subtipo de Warmer", 
            value: (
              <div className="flex items-center">
                {getSubtypeIcon(formData.subType)}
                <span className="ml-2">
                  {getSubtypeText(formData.subType)}
                </span>
              </div>
            )
          },
          { label: "Nome", value: formData.name },
          { label: "Descrição", value: formData.description || "Não fornecida" },
          { 
            label: "Contas", 
            value: formData.accounts.map(id => {
              const session = availableSessions.find(s => s.id === id);
              return session ? session.name : id;
            }).join(", ") 
          },
          ...(formData.subType === 'number-to-number' ? [
            { label: "Rotação de Números", value: formData.numberRotation ? "Habilitada" : "Desabilitada" }
          ] : []),
          ...(formData.subType === 'number-to-group' ? [
            { label: "Nome do Grupo", value: formData.groupName || "Não especificado" }
          ] : []),
          { 
            label: "Total de Mensagens", 
            value: formData.targetCount !== null ? formData.targetCount : "Contínuo (sem limite)" 
          },
          { 
            label: "Duração do Warming", 
            value: typeof formData.warmerDuration === 'string' && formData.warmerDuration === 'custom' ? 'Personalizado' : `${formData.warmerDuration} dias` 
          },
          { 
            label: "Intervalos de Descanso", 
            value: formData.restIntervalEnabled ? 
              `${formData.minRestDuration}-${formData.maxRestDuration} min (${formData.restFrequencyType === 'message-count' ? `a cada ${formData.messageCountBeforeRest} msgs` : `a cada ${formData.timePeriodBeforeRest} min`})` : 
              "Desabilitados" 
          },
          { 
            label: "Números Alvo", 
            value: formData.targetNumbers && formData.targetNumbers.length > 0 ? 
              `${formData.targetNumbers.length} números verificados importados` : 
              "Sem números alvo específicos" 
          },
          { 
            label: "Mídia", 
            value: formData.mediaEnabled ? 
              `Habilitada (${formData.mediaTypes.join(", ")})` : 
              "Desabilitada" 
          },
          { 
            label: "IA para Respostas", 
            value: formData.aiEnabled ? 
              `${formData.aiProvider} (${formData.aiReplyPercentage}% de mensagens com resposta)` : 
              "Desabilitada" 
          },
          { 
            label: "Intervalo Entre Mensagens", 
            value: formData.useRandomDelay ? 
              `${formData.minDelay}-${formData.maxDelay} minutos (${formData.delayPattern})` : 
              `${formData.minDelay} minutos (fixo)` 
          },
          { 
            label: "Padrão de Delay", 
            value: `${formData.delayPattern} (variação de ${formData.randomTimeVariation}%)`
          },
          { 
            label: "Warming Progressivo", 
            value: formData.progressiveWarmingEnabled ? "Habilitado" : "Desabilitado" 
          },
          { 
            label: "Limites Diários", 
            value: formData.dailyLimits ? `${formData.maxDailyMessages} mensagens/dia` : "Desabilitados" 
          },
          { 
            label: "Horário de Funcionamento", 
            value: (
              <div className="space-y-1">
                <div>
                  Dias: {formData.schedule.days.map(day => {
                    const dayObj = weekDays.find(d => d.value === day);
                    return dayObj ? dayObj.label : day;
                  }).join(", ")}
                </div>
                <div>
                  Horário: {formData.schedule.timeRanges.map(range => 
                    `${range.start} - ${range.end}`
                  ).join(", ")}
                </div>
              </div>
            ) 
          },
          { 
            label: "Comportamento", 
            value: (
              <div className="space-y-1">
                <div>Emojis: {formData.enableEmojis ? "Habilitado" : "Desabilitado"}</div>
                <div>Indicador de Digitação: {formData.enableTypingIndicator ? "Habilitado" : "Desabilitado"}</div>
                <div>Confirmações de Leitura: {formData.enableReadReceipts ? "Habilitado" : "Desabilitado"}</div>
              </div>
            ) 
          }
        ]}
      />
      <WizardNavigation 
        completeLabel={isEditing ? "Atualizar Warmer" : "Criar Warmer"}
        onComplete={handleSubmit}
      />
    </>
  );
};
