import { createContext, ReactNode, use, useState } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

export type MultiStepFormStep = {
  label: string;
  content: ReactNode;
};

type MultiStepFormContextValue = {
  steps: MultiStepFormStep[];
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (step: number) => void;
  goBack: () => void;
  goNext: () => Promise<void>;
};

const MultiStepFormContext = createContext<MultiStepFormContextValue | null>(
  null
);

export const useMultiStepForm = () => {
  const ctx = use(MultiStepFormContext);
  if (!ctx) throw new Error('Missing <MultiStepForm /> parent component');
  return ctx;
};

type MultiStepFormProps = {
  steps: MultiStepFormStep[];
  onBeforeNext?: (currentStep: number) => Promise<boolean> | boolean;
  children: ReactNode;
};

export const MultiStepForm = ({
  steps,
  onBeforeNext,
  children,
}: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const value: MultiStepFormContextValue = {
    steps,
    currentStep,
    isFirstStep,
    isLastStep,
    goToStep: setCurrentStep,
    goBack: () => setCurrentStep((s) => Math.max(0, s - 1)),
    goNext: async () => {
      const canProceed = onBeforeNext ? await onBeforeNext(currentStep) : true;
      if (canProceed && !isLastStep) setCurrentStep((s) => s + 1);
    },
  };

  return <MultiStepFormContext value={value}>{children}</MultiStepFormContext>;
};

type MultiStepFormContentProps = {
  className?: string;
};

export const MultiStepFormContent = ({
  className,
}: MultiStepFormContentProps) => {
  const { steps, currentStep, goToStep } = useMultiStepForm();

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Progress bar */}
      <div className="flex gap-1.5">
        {steps.map((step, i) => {
          const isVisited = i <= currentStep;
          const isCurrent = i === currentStep;

          return (
            <button
              key={i}
              type="button"
              disabled={!isVisited || isCurrent}
              onClick={() => goToStep(i)}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                isVisited ? 'bg-primary' : 'bg-muted',
                isVisited && !isCurrent && 'cursor-pointer hover:bg-primary/70'
              )}
              aria-label={step.label}
              aria-current={isCurrent ? 'step' : undefined}
            />
          );
        })}
      </div>

      {/* Step label */}
      <h2 className="text-lg font-semibold">{steps[currentStep]?.label}</h2>

      {/* Step content */}
      {steps[currentStep]?.content}
    </div>
  );
};

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
