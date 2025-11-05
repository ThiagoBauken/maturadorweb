
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  isFirstStep: boolean;
  isNextDisabled?: boolean;
  isPreviousDisabled?: boolean;
  nextLabel: string;
}

export function StepNavigation({
  onNext,
  onPrevious,
  onCancel,
  isFirstStep,
  isNextDisabled = false,
  isPreviousDisabled = false,
  nextLabel
}: StepNavigationProps) {
  return (
    <div className="flex justify-between items-center mt-12 py-6 pt-8 sticky bottom-0 bg-background z-[5] border-t">
      <div>
        {isFirstStep ? (
          <Button 
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            onClick={onCancel}
            variant="outline"
          >
            Cancelar
          </Button>
        ) : (
          <Button 
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            onClick={onPrevious}
            disabled={isPreviousDisabled}
            variant="outline"
          >
            Voltar
          </Button>
        )}
      </div>
      <div>
        <Button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
