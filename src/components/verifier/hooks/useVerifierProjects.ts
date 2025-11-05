
import { useState, useEffect } from 'react';
import { usePhoneNumberFormatter } from '@/pages/dashboard/BulkSender/hooks/recipient/usePhoneNumberFormatter';
import { toast } from 'sonner';
import { VerificationData } from '../types';

interface VerifierProject {
  id: string;
  name: string;
  numbers: VerificationData[];
  createdAt: string;
  lastVerification?: string;
}

export function useVerifierProjects() {
  const [projects, setProjects] = useState<VerifierProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { formatPhoneNumber } = usePhoneNumberFormatter();
  
  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem('verifier_projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
        
        // Set the most recent project as active if no active project
        if (parsedProjects.length > 0 && !activeProjectId) {
          setActiveProjectId(parsedProjects[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading verifier projects:', error);
    }
  }, []);
  
  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('verifier_projects', JSON.stringify(projects));
    }
  }, [projects]);
  
  // Create a new project
  const createProject = (name: string, numbers: VerificationData[] = []) => {
    const id = `project_${Date.now()}`;
    const newProject: VerifierProject = {
      id,
      name,
      numbers,
      createdAt: new Date().toISOString()
    };
    
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(id);
    
    toast.success(`Project "${name}" created`);
    return id;
  };
  
  // Add numbers to a project
  const addNumbersToProject = (projectId: string, numbers: VerificationData[]) => {
    setProjects(prev => {
      return prev.map(project => {
        if (project.id === projectId) {
          // Format the phone numbers and remove duplicates
          const formattedNumbers = numbers.map(num => ({
            ...num,
            phoneNumber: formatPhoneNumber(num.phoneNumber)
          }));
          
          // Remove duplicates based on phone number
          const existingNumbers = project.numbers.map(n => n.phoneNumber);
          const uniqueNewNumbers = formattedNumbers.filter(
            n => !existingNumbers.includes(n.phoneNumber)
          );
          
          if (uniqueNewNumbers.length === 0) {
            toast.info('No new numbers to add (all were duplicates)');
            return project;
          }
          
          const updatedNumbers = [...project.numbers, ...uniqueNewNumbers];
          
          return {
            ...project,
            numbers: updatedNumbers,
            lastVerification: new Date().toISOString()
          };
        }
        return project;
      });
    });
  };
  
  // Update project numbers (replace all)
  const updateProjectNumbers = (projectId: string, numbers: VerificationData[]) => {
    setProjects(prev => {
      return prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            numbers,
            lastVerification: new Date().toISOString()
          };
        }
        return project;
      });
    });
  };
  
  // Remove a project
  const removeProject = (projectId: string) => {
    const projectToRemove = projects.find(p => p.id === projectId);
    if (!projectToRemove) return;
    
    setProjects(prev => prev.filter(project => project.id !== projectId));
    
    // If the active project was removed, set the first available project as active
    if (activeProjectId === projectId) {
      const remainingProjects = projects.filter(p => p.id !== projectId);
      setActiveProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
    }
    
    toast.success(`Project "${projectToRemove.name}" removed`);
  };
  
  // Get active project data
  const getActiveProject = () => {
    return projects.find(p => p.id === activeProjectId) || null;
  };
  
  // Get active project numbers
  const getActiveProjectNumbers = (): VerificationData[] => {
    const activeProject = getActiveProject();
    return activeProject ? activeProject.numbers : [];
  };
  
  return {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    addNumbersToProject,
    updateProjectNumbers,
    removeProject,
    getActiveProject,
    getActiveProjectNumbers
  };
}
