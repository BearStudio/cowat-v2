import { ReactNode, useId, useLayoutEffect, useRef } from 'react';

import { useMultiStepForm } from './context';

type MultiStepFormStepProps = {
  name: string;
  onNext?: () => Promise<boolean> | boolean;
  children: ReactNode;
};

export const MultiStepFormStep = ({
  name,
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
      name,
      onNext: () => onNextRef.current?.() ?? true,
    });
  }, [id, name, _registerStep]);

  if (!isStepCurrent(id)) return null;
  return <>{children}</>;
};
