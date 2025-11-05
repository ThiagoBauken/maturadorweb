
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDownUp, Users } from 'lucide-react';

interface NumberRotationSettingsProps {
  enabled: boolean;
  rotationType: 'all-to-all' | 'round-robin' | 'random';
  onEnabledChange: (enabled: boolean) => void;
  onTypeChange: (type: 'all-to-all' | 'round-robin' | 'random') => void;
  className?: string;
  accounts?: { id: string; name: string; phone: string; status: string }[];
  selectedAccounts: string[];
  onAccountsChange: (accounts: string[]) => void;
}

export function NumberRotationSettings({
  enabled,
  rotationType,
  onEnabledChange,
  onTypeChange,
  className = '',
  accounts = [],
  selectedAccounts,
  onAccountsChange
}: NumberRotationSettingsProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableAccountIds = accounts
        .filter(account => account.status === 'connected')
        .map(account => account.id);
      onAccountsChange(availableAccountIds);
    } else {
      onAccountsChange([]);
    }
  };

  const toggleAccount = (accountId: string) => {
    if (selectedAccounts.includes(accountId)) {
      onAccountsChange(selectedAccounts.filter(id => id !== accountId));
    } else {
      onAccountsChange([...selectedAccounts, accountId]);
    }
  };

  const allConnectedSelected = accounts
    .filter(account => account.status === 'connected')
    .every(account => selectedAccounts.includes(account.id));

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="enable-rotation" 
          checked={enabled}
          onCheckedChange={(checked) => onEnabledChange(!!checked)}
        />
        <Label htmlFor="enable-rotation" className="flex items-center gap-2 font-medium cursor-pointer">
          <ArrowDownUp className="h-4 w-4" />
          Habilitar rotação de números (contas conversam entre si)
        </Label>
      </div>
      
      {enabled && (
        <div className="pl-6 space-y-3 border-l-2 border-l-muted">
          <p className="text-sm text-muted-foreground">
            Quando habilitado, várias contas WhatsApp conversam entre si para aquecer múltiplos números.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="rotation-type">Padrão de Rotação</Label>
            <Select 
              value={rotationType} 
              onValueChange={(value) => onTypeChange(value as 'all-to-all' | 'round-robin' | 'random')}
            >
              <SelectTrigger id="rotation-type">
                <SelectValue placeholder="Selecione um padrão de rotação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-to-all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Aquecimento simultâneo (todos os números conversam entre si)</span>
                  </div>
                </SelectItem>
                <SelectItem value="round-robin">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4" />
                    <span>Fila sequencial (número 1, depois número 2, etc)</span>
                  </div>
                </SelectItem>
                <SelectItem value="random">
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="h-4 w-4" />
                    <span>Aleatório (seleciona números aleatoriamente)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {accounts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Contas do WhatsApp</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="select-all-accounts" 
                    checked={allConnectedSelected}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label 
                    htmlFor="select-all-accounts" 
                    className="text-sm cursor-pointer"
                  >
                    Selecionar todas
                  </Label>
                </div>
              </div>
              
              <div className="space-y-2">
                {accounts.map(account => (
                  <div 
                    key={account.id}
                    className={`flex items-center justify-between p-2 rounded-md border ${
                      account.status === 'connected' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {account.status === 'connected' && (
                        <Checkbox 
                          id={`account-${account.id}`}
                          checked={selectedAccounts.includes(account.id)}
                          onCheckedChange={() => toggleAccount(account.id)}
                        />
                      )}
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-xs text-muted-foreground">{account.phone}</p>
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      account.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
