import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';

type StepConfig = {
  label: string;
  content: ReactNode;
};

type StepperNavProps = {
  steps: StepConfig[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  ns: 'commute' | 'commuteTemplate';
};

type StepperProps = {
  steps: StepConfig[];
  currentStep: number;
  onStepClick: (step: number) => void;
};

export const StepperNavigation = ({
  steps,
  currentStep,
  onNext,
  onBack,
  onSubmit,
  isSubmitting,
  ns,
}: StepperNavProps) => {
  const { t } = useTranslation([ns]);
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex gap-3 border-t border-border bg-background px-4 py-3 pb-[calc(3*var(--spacing)+var(--spacing-safe-bottom))]">
      {!isFirstStep && (
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onBack}
        >
          {t(`${ns}:stepper.back`)}
        </Button>
      )}
      {isLastStep ? (
        <Button
          type="button"
          className="flex-1"
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {t(`${ns}:stepper.submit`)}
        </Button>
      ) : (
        <Button type="button" className="flex-1" onClick={onNext}>
          {t(`${ns}:stepper.next`)}
        </Button>
      )}
    </div>
  );
};

export const Stepper = ({ steps, currentStep, onStepClick }: StepperProps) => {
  return (
    <div className="flex flex-col gap-6">
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
              onClick={() => onStepClick(i)}
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
