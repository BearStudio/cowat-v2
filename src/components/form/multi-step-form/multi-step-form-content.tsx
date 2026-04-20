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
    <div className={cn('flex flex-col gap-6 pb-2', className)}>
      {/* Progress bar */}
      <div className="flex h-2.5 items-start gap-1.5">
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
                'hit-area-y-6 hit-area flex-1 rounded-full transition-colors duration-300',
                isCurrent && 'h-2.5 bg-primary',
                !isCurrent && 'h-1.5',
                !isVisited && !isCurrent && 'bg-muted-foreground/20',
                isVisited &&
                  !isCurrent &&
                  'cursor-pointer bg-primary/40 hover:bg-primary/70'
              )}
              aria-label={step.name}
              aria-current={isCurrent ? 'step' : undefined}
            />
          );
        })}
      </div>

      {/* Step label */}
      <h2 className="text-lg font-semibold">{steps[currentStepIndex]?.name}</h2>
    </div>
  );
};
