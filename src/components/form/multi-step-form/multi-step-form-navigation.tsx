import { ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

import { useMultiStepForm } from './context';

type MultiStepFormNavigationProps = {
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel: string;
  nextLabel: string;
  backLabel: string;
  banner?: ReactNode;
  className?: string;
};

export const MultiStepFormNavigation = ({
  onSubmit,
  isSubmitting,
  submitLabel,
  nextLabel,
  backLabel,
  banner,
  className,
}: MultiStepFormNavigationProps) => {
  const { isFirstStep, isLastStep, goNext, goBack } = useMultiStepForm();

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border bg-background pt-3 md:border-0 md:bg-transparent md:pt-0',
        className
      )}
    >
      {banner}
      <div
        className={cn(
          'flex gap-3 px-4 py-3 pb-[calc(3*var(--spacing)+var(--spacing-safe-bottom))]',
          'md:mx-auto md:grid md:w-full md:max-w-4xl md:grid-cols-2 md:pb-3'
        )}
      >
        {isFirstStep ? (
          <div className="hidden md:block" />
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="flex-1 md:w-full md:flex-none"
            onClick={goBack}
          >
            {backLabel}
          </Button>
        )}
        {isLastStep ? (
          <Button
            type="button"
            className="flex-1 md:w-full md:flex-none"
            loading={isSubmitting}
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1 md:w-full md:flex-none"
            onClick={goNext}
          >
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
