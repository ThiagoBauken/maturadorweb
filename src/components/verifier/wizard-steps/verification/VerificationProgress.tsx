
import { Progress } from '@/components/ui/progress';

interface VerificationProgressProps {
  progress: number;
}

export function VerificationProgress({ progress }: VerificationProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
