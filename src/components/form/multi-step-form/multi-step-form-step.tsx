import { ReactNode, useId, useLayoutEffect, useRef } from 'react';

import { useMultiStepForm } from './context';

type MultiStepFormStepProps = {
  label: string;
  onNext?: () => Promise<boolean> | boolean;
  children: ReactNode;
};

export const MultiStepFormStep = ({
  label,
  onNext,
  children,
}: MultiStepFormStepProps) => {
  const id = useId();
  const { _registerStep, isStepCurrent } = useMultiStepForm();

  // Keep onNext in a ref so the registered callback always calls the latest version
  const onNextRef = useRef(onNext);
  useLayoutEffect(() => {
    onNextRef.current = onNext;
  });

  useLayoutEffect(() => {
    return _registerStep({
      id,
      label,
      onNext: () => onNextRef.current?.() ?? true,
    });
  }, [id, label, _registerStep]);

  if (!isStepCurrent(id)) return null;

  return <>{children}</>;
};
