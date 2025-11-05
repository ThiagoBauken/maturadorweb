
import React from 'react';
import { WarmerDetails, WarmerStats } from './WarmerDetails';
import { Button } from '@/components/ui/button';
import { Plus, Flame, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface WarmerListProps {
  warmers: WarmerStats[];
  onDelete?: (id: string) => void;
  onTogglePause?: (id: string, currentStatus: string) => void;
  onEdit?: (id: string) => void;
  onRestart?: (id: string) => void;
  className?: string;
  emptyMessage?: string;
  showCreateButtons?: boolean;
}

export function WarmerList({
  warmers,
  onDelete,
  onTogglePause,
  onEdit,
  onRestart,
  className = '',
  emptyMessage = 'No warmers found. Create your first warmer to start.',
  showCreateButtons = true
}: WarmerListProps) {
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id);
    } else {
      toast.success(`Warmer deleted`);
    }
  };

  const handleTogglePause = (id: string, status: string) => {
    if (onTogglePause) {
      onTogglePause(id, status);
    } else {
      const newStatus = status === 'active' ? 'paused' : 'active';
      toast.success(`Warmer ${newStatus === 'active' ? 'activated' : 'paused'}`);
    }
  };

  const handleCreateStandardWarmer = () => {
    navigate('/warmers/standard');
  };

  const handleCreateAdvancedWarmer = () => {
    navigate('/warmers/create');
  };

  return (
    <div className={className}>
      {warmers.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-md p-10 text-center">
          <p className="text-muted-foreground mb-4">
            {emptyMessage}
          </p>
          {showCreateButtons && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleCreateStandardWarmer} variant="outline" className="flex items-center gap-1">
                <Flame className="h-4 w-4" />
                Standard
              </Button>
              <Button onClick={handleCreateAdvancedWarmer} className="flex items-center gap-1">
                <Zap className="h-4 w-4 mr-1" />
                Advanced
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {warmers.map((warmer) => (
            <WarmerDetails
              key={warmer.id}
              warmer={warmer}
              onDelete={handleDelete}
              onTogglePause={handleTogglePause}
              onEdit={onEdit}
              onRestart={onRestart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
