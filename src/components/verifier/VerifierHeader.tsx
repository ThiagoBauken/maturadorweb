
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ChevronDown, Archive, RefreshCw } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

interface VerifierHeaderProps {
  projects: any[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  setIsImportView: (value: boolean) => void;
  setIsWizardOpen: (value: boolean) => void;
  handleDeleteProject: () => void;
}

export function VerifierHeader({
  projects,
  activeProjectId,
  setActiveProjectId,
  setIsImportView,
  setIsWizardOpen,
  handleDeleteProject
}: VerifierHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
      {projects.length > 0 && (
        <Select 
          value={activeProjectId || ''} 
          onValueChange={setActiveProjectId}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name} ({project.numbers.length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => setIsImportView(true)}
          className="gap-1"
        >
          <span className="flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Import File
          </span>
        </Button>
        
        {activeProjectId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDeleteProject} className="text-destructive">
                <Archive className="h-4 w-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button 
          onClick={() => setIsWizardOpen(true)}
          className="gap-1"
          disabled={!activeProjectId}
        >
          <span className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-1" />
            Start Verification
          </span>
        </Button>
      </div>
    </div>
  );
}
