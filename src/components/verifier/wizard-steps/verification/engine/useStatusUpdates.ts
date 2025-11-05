import { StatusItem } from '@/components/common/status';
import { Session, StatusUpdatesProps } from './types';
import { toast } from 'sonner';

export function useStatusUpdates({
  setStatusItems,
  sessions,
  config
}: StatusUpdatesProps) {
  const initializeStatusItems = () => {
    const availableSessions = sessions.filter(s => s.status === 'active');
    
    const initialStatusItems: StatusItem[] = [
      {
        id: 'verification-process',
        status: 'processing',
        title: 'Processo de Verificação',
        description: 'Iniciando verificação...',
        progress: 0
      },
      {
        id: 'rate-limits',
        status: 'success',
        title: 'Limites de Taxa',
        description: 'Dentro dos limites aceitáveis',
      },
      {
        id: 'session-usage',
        status: 'info',
        title: 'Utilização de Sessões',
        description: `${availableSessions.length} sessões disponíveis`,
      }
    ];
    
    setStatusItems(() => initialStatusItems);
    return initialStatusItems;
  };
  
  const addStatusUpdate = (status: 'info' | 'warning' | 'error' | 'success', title: string, description: string) => {
    const statusUpdate: StatusItem = {
      id: `status-${Date.now()}`,
      status,
      title,
      description,
      timestamp: new Date().toISOString()
    };
    
    setStatusItems(prev => [...prev, statusUpdate]);
    return statusUpdate;
  };
  
  const updatePauseStatus = (isPaused: boolean) => {
    if (isPaused) {
      toast.info('Verificação pausada');
      
      addStatusUpdate(
        'warning',
        'Verificação Pausada',
        'Processo de verificação foi pausado pelo usuário'
      );
    } else {
      toast.info('Verificação retomada');
      
      addStatusUpdate(
        'info',
        'Verificação Retomada',
        'Processo de verificação foi retomado'
      );
    }
  };
  
  const updateStopStatus = () => {
    toast.info('Verificação interrompida');
    
    setStatusItems(prev => {
      const updated = [...prev];
      const index = updated.findIndex(item => item.id === 'verification-process');
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          status: 'warning',
          description: 'Verificação interrompida pelo usuário',
        };
      }
      
      return [
        ...updated,
        {
          id: `status-stop-${Date.now()}`,
          status: 'error',
          title: 'Verificação Interrompida',
          description: 'Processo de verificação foi interrompido pelo usuário',
          timestamp: new Date().toISOString()
        }
      ];
    });
  };
  
  return {
    initializeStatusItems,
    addStatusUpdate,
    updatePauseStatus,
    updateStopStatus
  };
}
