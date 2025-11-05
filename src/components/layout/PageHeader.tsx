
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  className, 
  actions 
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">{actions}</div>
      )}
    </div>
  );
}
