import { ReactNode, useCallback, useState } from 'react';

import { MultiStepFormContext, StepConfig } from './context';

export const MultiStepForm = ({
  children,
  freeNavigation = false,
}: {
  children: ReactNode;
  freeNavigation?: boolean;
}) => {
  const [steps, setSteps] = useState<StepConfig[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(
    () => new Set([0])
  );

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = steps.length > 0 && currentStepIndex === steps.length - 1;

  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setVisitedIndices((prev) => new Set([...prev, index]));
  }, []);

  const goBack = useCallback(() => {
    const next = Math.max(0, currentStepIndex - 1);
    setCurrentStepIndex(next);
    setVisitedIndices((prev) => new Set([...prev, next]));
  }, [currentStepIndex]);

  const goNext = useCallback(async () => {
    const step = steps[currentStepIndex];
    const canProceed = step ? await step.onNext() : true;
    if (canProceed && !isLastStep) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      setVisitedIndices((prev) => new Set([...prev, next]));
    }
  }, [steps, currentStepIndex, isLastStep]);

  const isStepCurrent = useCallback(
    (id: string) => steps[currentStepIndex]?.id === id,
    [steps, currentStepIndex]
  );

  const isStepVisited = useCallback(
    (id: string) => {
      if (freeNavigation) return steps.some((s) => s.id === id);
      const index = steps.findIndex((s) => s.id === id);
      return index !== -1 && visitedIndices.has(index);
    },
    [steps, visitedIndices, freeNavigation]
  );

  const _registerStep = useCallback((config: StepConfig) => {
    setSteps((prev) => {
      if (prev.some((s) => s.id === config.id)) return prev;
      return [...prev, config];
    });
    return () => {
      setSteps((prev) => prev.filter((s) => s.id !== config.id));
    };
  }, []);

  return (
    <MultiStepFormContext
      value={{
        steps,
        currentStepIndex,
        isFirstStep,
        isLastStep,
        isStepCurrent,
        isStepVisited,
        goToStep,
        goBack,
        goNext,
        _registerStep,
      }}
    >
      {children}
    </MultiStepFormContext>
  );
};
