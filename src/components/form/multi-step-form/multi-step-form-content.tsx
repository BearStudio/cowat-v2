import { cn } from '@/lib/tailwind/utils';

import { useMultiStepForm } from './context';

type MultiStepFormContentProps = {
  className?: string;
};

export const MultiStepFormContent = ({
  className,
}: MultiStepFormContentProps) => {
  const { steps, currentStepIndex, isStepVisited, goToStep } =
    useMultiStepForm();

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Progress bar */}
      <div className="flex gap-1.5">
        {steps.map((step, i) => {
          const isVisited = isStepVisited(step.id);
          const isCurrent = i === currentStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              disabled={!isVisited || isCurrent}
              onClick={() => goToStep(i)}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                isVisited && isCurrent && 'bg-primary',
                !isVisited && 'bg-muted',
                isVisited &&
                  !isCurrent &&
                  'cursor-pointer bg-primary/20 hover:bg-primary/70'
              )}
              aria-label={step.label}
              aria-current={isCurrent ? 'step' : undefined}
            />
          );
        })}
      </div>

      {/* Step label */}
      <h2 className="text-lg font-semibold">
        {steps[currentStepIndex]?.label}
      </h2>
    </div>
  );
};
