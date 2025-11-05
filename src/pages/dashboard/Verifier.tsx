
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useVerifierProjects } from '@/components/verifier/hooks/useVerifierProjects';
import { SimpleFileImport } from '@/components/verifier/SimpleFileImport';
import { VerificationWizard } from '@/components/verifier/VerificationWizard';
import { VerifierHeader } from '@/components/verifier/VerifierHeader';
import { VerifierProjectSummary } from '@/components/verifier/VerifierProjectSummary';
import { VerifierTabsContent } from '@/components/verifier/VerifierTabsContent';
import { useVerifierBackground } from '@/components/verifier/hooks/useVerifierBackground';

const Verifier = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isImportView, setIsImportView] = useState(false);

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    getActiveProjectNumbers,
    getActiveProject,
    removeProject
  } = useVerifierProjects();

  const activeProject = getActiveProject();
  const verificationData = getActiveProjectNumbers();
  
  // Show import view when no projects exist
  useEffect(() => {
    if (projects.length === 0) {
      setIsImportView(true);
    }
  }, [projects.length]);

  // Check for background verification processes
  useVerifierBackground({ setActiveProjectId, setIsWizardOpen });

  const handleStartVerification = () => {
    if (activeProjectId) {
      setIsWizardOpen(true);
      toast.success('Iniciando processo de verificação.');
    } else {
      toast.error('Selecione um projeto para iniciar a verificação.');
    }
  };

  const handleDeleteProject = () => {
    if (activeProjectId) {
      // Check if there's a verification in progress
      const verificationStateJson = localStorage.getItem('verification_background_state');
      if (verificationStateJson) {
        const verificationState = JSON.parse(verificationStateJson);
        if (verificationState.projectId === activeProjectId && verificationState.isVerifying) {
          toast.error("Não é possível excluir um projeto com verificação ativa. Pare a verificação primeiro.");
          return;
        }
      }
      
      removeProject(activeProjectId);
      toast.success("Projeto excluído");
      
      // If no projects remain, show import view
      if (projects.length <= 1) {
        setIsImportView(true);
      }
    }
  };

  const handleImportComplete = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsImportView(false);
    
    // Automatically open the verification wizard after import
    setTimeout(() => {
      setIsWizardOpen(true);
      toast.success('Projeto importado com sucesso! Iniciando verificação...');
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verificador de Números WhatsApp"
        description="Valide números de telefone antes de enviar mensagens"
        actions={
          <VerifierHeader
            projects={projects}
            activeProjectId={activeProjectId}
            setActiveProjectId={setActiveProjectId}
            setIsImportView={setIsImportView}
            setIsWizardOpen={setIsWizardOpen}
            handleDeleteProject={handleDeleteProject}
          />
        }
      />

      {(!activeProjectId && projects.length === 0) || isImportView ? (
        <Card>
          <CardContent className="pt-6">
            <SimpleFileImport onImportComplete={handleImportComplete} />
          </CardContent>
        </Card>
      ) : isWizardOpen ? (
        <Card>
          <CardContent className="pt-6">
            <VerificationWizard
              projectId={activeProjectId!}
              onComplete={() => setIsWizardOpen(false)}
              onCancel={() => setIsWizardOpen(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {activeProject && (
            <VerifierProjectSummary 
              activeProject={activeProject} 
              verificationData={verificationData} 
              onStartVerification={handleStartVerification}
            />
          )}
          
          <VerifierTabsContent verificationData={verificationData} />
        </>
      )}
    </div>
  );
}

export default Verifier;
