
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProjectNameFieldProps {
  projectName: string;
  setProjectName: (name: string) => void;
}

export function ProjectNameField({ projectName, setProjectName }: ProjectNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="project-name">Project Name</Label>
      <Input 
        id="project-name" 
        placeholder="Enter a name for this messaging project"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />
    </div>
  );
}
