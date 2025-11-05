
import { toast } from 'sonner';
import { VerificationData } from '../../../types';

interface UseProjectResultsProps {
  projectId: string;
}

export function useProjectResults({ projectId }: UseProjectResultsProps) {
  
  // Save verification results to project
  const saveResultsToProject = () => {
    // Store results in localStorage for persistence across page changes
    const results = JSON.parse(localStorage.getItem('verification_results') || '[]');
    
    // Save results to the project
    localStorage.setItem(`project_results_${projectId}`, JSON.stringify(results));
    
    // Update active project with verification results
    const projectsJson = localStorage.getItem('verifier_projects');
    if (projectsJson) {
      const projects = JSON.parse(projectsJson);
      const updatedProjects = projects.map((project: any) => {
        if (project.id === projectId) {
          return {
            ...project,
            numbers: results,
            lastVerification: new Date().toISOString()
          };
        }
        return project;
      });
      
      localStorage.setItem('verifier_projects', JSON.stringify(updatedProjects));
    }
    
    toast.success("Verification complete!");
  };
  
  return {
    saveResultsToProject
  };
}
