
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

interface NewProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string | undefined;
}

export function NewProjectDialog({
  isOpen,
  onOpenChange,
  projectName
}: NewProjectDialogProps) {
  const navigate = useNavigate();

  const createNewProject = () => {
    navigate('/bulk-sender?new=true');
    onOpenChange(false);
    window.location.reload(); // Quick way to reset the state
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            This will clear the current message draft and create a new project.
            {projectName && ' Any unsaved changes to the current project will be lost.'}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={createNewProject}>
              Create New Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
