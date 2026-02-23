import { ReactNode, useId, useLayoutEffect, useRef } from 'react';

import { useMultiStepForm } from './context';

type MultiStepFormStepProps = {
  name: string;
  order?: number;
  onNext?: () => Promise<boolean> | boolean;
  children: ReactNode;
};

export const MultiStepFormStep = ({
  name,
  order,
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
      order,
      onNext: () => onNextRef.current?.() ?? true,
    });
  }, [id, name, order, _registerStep]);

  if (!isStepCurrent(id)) return null;
  return <>{children}</>;
};
