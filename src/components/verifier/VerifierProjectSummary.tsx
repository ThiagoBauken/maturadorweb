
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from '@/components/ui/button';

interface VerifierProjectSummaryProps {
  activeProject: any;
  verificationData: any[];
  onStartVerification?: () => void;
}

export function VerifierProjectSummary({ 
  activeProject, 
  verificationData,
  onStartVerification 
}: VerifierProjectSummaryProps) {
  if (!activeProject) return null;
  
  const pendingCount = verificationData.filter(d => d.status === 'pending').length;
  const validCount = verificationData.filter(d => d.status === 'valid').length;
  const invalidCount = verificationData.filter(d => d.status === 'invalid').length;
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          {activeProject.name}
          <Badge variant="outline" className="ml-2">
            {verificationData.length} números
          </Badge>
        </h2>
        {activeProject.lastVerification && (
          <p className="text-sm text-muted-foreground">
            Última verificação: {new Date(activeProject.lastVerification).toLocaleString()}
          </p>
        )}
      </div>
      
      {pendingCount > 0 && (
        <Alert className="max-w-md bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Números não verificados</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{pendingCount} números precisam de verificação</span>
            {onStartVerification && (
              <Button 
                size="sm" 
                className="ml-4 bg-primary hover:bg-primary/90" 
                onClick={onStartVerification}
              >
                Iniciar Verificação
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {pendingCount === 0 && validCount > 0 && (
        <Alert className="max-w-md bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Verificação Completa</AlertTitle>
          <AlertDescription>
            {validCount} válidos e {invalidCount} inválidos encontrados
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
