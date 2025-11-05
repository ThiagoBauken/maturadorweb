
import React from 'react';
import { WizardNavigation } from '@/components/common/linear-wizard';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { WarmerForm } from '../types';
import { ScheduleConfig } from '@/components/common/schedule';
import { Day } from '@/components/common/schedule';
import { weekDays } from '../utils';

interface SchedulingStepProps {
  formData: WarmerForm;
  handleScheduleChange: (schedule: ScheduleConfig) => void;
}

export const SchedulingStep: React.FC<SchedulingStepProps> = ({
  formData,
  handleScheduleChange
}) => {
  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-medium">Horários de Funcionamento</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure quando seu warmer estará ativo. Fora desses horários, o warmer ficará em pausa.
              </p>
              
              <div className="pt-2">
                <Label>Dias da Semana</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 mt-2">
                  {weekDays.map(day => (
                    <div 
                      key={day.value}
                      className={`flex items-center p-2 border rounded-md cursor-pointer ${
                        formData.schedule.days.includes(day.value as Day) ? 'border-primary bg-primary/5' : 'border-input'
                      }`}
                      onClick={() => {
                        if (formData.schedule.days.includes(day.value as Day)) {
                          handleScheduleChange({
                            ...formData.schedule,
                            days: formData.schedule.days.filter(d => d !== day.value as Day)
                          });
                        } else {
                          handleScheduleChange({
                            ...formData.schedule,
                            days: [...formData.schedule.days, day.value as Day]
                          });
                        }
                      }}
                    >
                      <Checkbox 
                        id={`day-${day.value}`}
                        checked={formData.schedule.days.includes(day.value as Day)}
                        onCheckedChange={() => {
                          if (formData.schedule.days.includes(day.value as Day)) {
                            handleScheduleChange({
                              ...formData.schedule,
                              days: formData.schedule.days.filter(d => d !== day.value as Day)
                            });
                          } else {
                            handleScheduleChange({
                              ...formData.schedule,
                              days: [...formData.schedule.days, day.value as Day]
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <Label 
                        htmlFor={`day-${day.value}`}
                        className="font-normal cursor-pointer text-sm"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <Label>Horários de Atividade</Label>
                {formData.schedule.timeRanges.map((timeRange, index) => (
                  <div key={index} className="flex items-center gap-4 mt-2">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={`start-time-${index}`} className="text-xs">Início</Label>
                      <Input 
                        id={`start-time-${index}`}
                        type="time"
                        value={timeRange.start}
                        onChange={(e) => {
                          const newTimeRanges = [...formData.schedule.timeRanges];
                          newTimeRanges[index] = { ...newTimeRanges[index], start: e.target.value };
                          handleScheduleChange({
                            ...formData.schedule,
                            timeRanges: newTimeRanges
                          });
                        }}
                      />
                    </div>
                    
                    <div className="space-y-1 flex-1">
                      <Label htmlFor={`end-time-${index}`} className="text-xs">Fim</Label>
                      <Input 
                        id={`end-time-${index}`}
                        type="time"
                        value={timeRange.end}
                        onChange={(e) => {
                          const newTimeRanges = [...formData.schedule.timeRanges];
                          newTimeRanges[index] = { ...newTimeRanges[index], end: e.target.value };
                          handleScheduleChange({
                            ...formData.schedule,
                            timeRanges: newTimeRanges
                          });
                        }}
                      />
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      type="button"
                      className="mt-6"
                      onClick={() => {
                        if (formData.schedule.timeRanges.length > 1) {
                          const newTimeRanges = formData.schedule.timeRanges.filter((_, i) => i !== index);
                          handleScheduleChange({
                            ...formData.schedule,
                            timeRanges: newTimeRanges
                          });
                        }
                      }}
                      disabled={formData.schedule.timeRanges.length <= 1}
                    >
                      Remover
                    </Button>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  type="button"
                  className="mt-3"
                  onClick={() => {
                    handleScheduleChange({
                      ...formData.schedule,
                      timeRanges: [...formData.schedule.timeRanges, { start: '09:00', end: '17:00' }]
                    });
                  }}
                >
                  Adicionar Horário
                </Button>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Configure diferentes faixas de horário para simular comportamento humano realista
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <WizardNavigation />
    </>
  );
};
