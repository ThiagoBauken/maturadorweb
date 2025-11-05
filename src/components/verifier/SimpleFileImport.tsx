
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/common/file-upload/FileUpload';
import { FileProcessor, ProcessedData } from '@/components/common/file-upload/FileProcessor';
import { toast } from 'sonner';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';
import { VerificationData } from './types';
import { useVerifierProjects } from './hooks/useVerifierProjects';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, LoaderCircle } from 'lucide-react';

interface SimpleFileImportProps {
  onImportComplete: (projectId: string) => void;
}

export function SimpleFileImport({ onImportComplete }: SimpleFileImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  const { createProject } = useVerifierProjects();
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setImportSuccess(false);
    toast.info(`Arquivo "${file.name}" selecionado`);
  };
  
  const handleProcessedData = (data: ProcessedData) => {
    setProcessedData(data);
    
    if (data && data.columns && data.columns.length > 0) {
      // Auto-detect phone number column
      const phoneColumnGuess = data.columns.find((header: string) => 
        header.toLowerCase().includes('phone') || 
        header.toLowerCase().includes('telefone') || 
        header.toLowerCase().includes('celular') ||
        header.toLowerCase().includes('mobile') ||
        header.toLowerCase().includes('número') ||
        header.toLowerCase().includes('number')
      );
      
      // Auto-detect name column
      const nameColumnGuess = data.columns.find((header: string) => 
        header.toLowerCase().includes('name') || 
        header.toLowerCase().includes('nome') ||
        header.toLowerCase().includes('contact')
      );
      
      // Create project automatically
      if (phoneColumnGuess && selectedFile) {
        setIsProcessing(true);
        processImport(phoneColumnGuess, nameColumnGuess || '');
      } else if (data.data && data.data.length > 0 && selectedFile) {
        // If we couldn't detect columns but have data, try to process the first column
        setIsProcessing(true);
        const firstColumn = data.columns[0];
        processImport(firstColumn, '');
      }
    }
  };
  
  const processImport = (phoneColumn: string, nameColumn: string = '') => {
    if (!processedData || !selectedFile) {
      toast.error('Nenhum arquivo processado');
      setIsProcessing(false);
      return;
    }
    
    try {
      // Extract phone numbers and names from the processed data
      const verificationData: VerificationData[] = processedData.data
        .filter(row => row[phoneColumn]) // Filter out rows without phone numbers
        .map((row, index) => {
          const phoneValue = String(row[phoneColumn] || '');
          // Handle both object and primitive values
          const phoneNumber = formatPhoneNumber(phoneValue);
          const name = nameColumn && row[nameColumn] ? String(row[nameColumn]) : '';
          
          return {
            id: `imported-${Date.now()}-${index}`,
            phoneNumber,
            name,
            status: 'pending' as const, // Explicitly set as literal type 'pending'
            verificationDate: null
          };
        })
        .filter(item => item.phoneNumber && item.phoneNumber.trim() !== '');
      
      // Remove duplicates
      const uniqueNumbers = new Set<string>();
      const uniqueVerificationData = verificationData.filter(item => {
        if (uniqueNumbers.has(item.phoneNumber)) {
          return false;
        }
        uniqueNumbers.add(item.phoneNumber);
        return true;
      });
      
      if (uniqueVerificationData.length === 0) {
        toast.error('Nenhum número válido encontrado no arquivo');
        setIsProcessing(false);
        return;
      }
      
      // Create project automatically with file name
      const projectName = selectedFile.name.split('.')[0];
      const projectId = createProject(projectName, uniqueVerificationData);
      
      toast.success(`Projeto "${projectName}" criado com ${uniqueVerificationData.length} números`);
      setImportSuccess(true);
      
      // Call the onImportComplete callback with the projectId and start verification
      // Reduced delay to improve user experience
      setTimeout(() => {
        onImportComplete(projectId);
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Falha ao importar dados');
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Importar números para verificação</h2>
      <p className="text-muted-foreground mb-4">
        Cada arquivo importado será criado automaticamente como um projeto separado
      </p>
      
      {importSuccess ? (
        <Alert className="bg-green-50 border-green-300">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Importação concluída!</AlertTitle>
          <AlertDescription>
            Seus números foram importados com sucesso e estão prontos para verificação.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="bg-muted/30 p-6 rounded-lg border border-border">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <LoaderCircle className="h-10 w-10 text-primary animate-spin mb-4" />
              <p>Processando seu arquivo...</p>
              <p className="text-sm text-muted-foreground">Isso levará apenas um momento</p>
            </div>
          ) : (
            <>
              <FileUpload 
                acceptedTypes={['csv', 'xlsx', 'txt']}
                maxSizeInMB={5}
                onFileSelect={handleFileSelect}
                buttonText="Selecionar arquivo"
                dragActiveText="Solte o arquivo aqui"
                dragInactiveText="ou arraste e solte o arquivo aqui"
              />
              
              {selectedFile && (
                <FileProcessor
                  file={selectedFile}
                  onProcessed={handleProcessedData}
                  onError={(error) => toast.error(error)}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
