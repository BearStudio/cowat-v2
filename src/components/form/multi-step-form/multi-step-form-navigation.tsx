import { Button } from '@/components/ui/button';

import { useMultiStepForm } from './context';

type MultiStepFormNavigationProps = {
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  nextLabel: string;
  backLabel: string;
};

export const MultiStepFormNavigation = ({
  onSubmit,
  isSubmitting,
  submitLabel,
  nextLabel,
  backLabel,
}: MultiStepFormNavigationProps) => {
  const { isFirstStep, isLastStep, goNext, goBack } = useMultiStepForm();

  return (
    <div className="flex gap-3 border-t border-border bg-background px-4 py-3 pb-[calc(3*var(--spacing)+var(--spacing-safe-bottom))]">
      {!isFirstStep && (
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={goBack}
        >
          {backLabel}
        </Button>
      )}
      {isLastStep ? (
        <Button
          type="button"
          className="flex-1"
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      ) : (
        <Button type="button" className="flex-1" onClick={goNext}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
};
