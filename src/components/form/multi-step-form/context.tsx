import { createContext, use } from 'react';

export type StepConfig = {
  id: string;
  name: string;
  order?: number;
  onNext: () => Promise<boolean> | boolean;
};

export type MultiStepFormContextValue = {
  steps: StepConfig[];
  currentStepIndex: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isStepCurrent: (id: string) => boolean;
  isStepVisited: (id: string) => boolean;
  goToStep: (index: number) => void;
  goBack: () => void;
  goNext: () => Promise<void>;
  _registerStep: (config: StepConfig) => () => void;
};

export const MultiStepFormContext =
  createContext<MultiStepFormContextValue | null>(null);

export const useMultiStepForm = () => {
  const ctx = use(MultiStepFormContext);
  if (!ctx) throw new Error('Missing <MultiStepForm /> parent component');
  return ctx;
};
