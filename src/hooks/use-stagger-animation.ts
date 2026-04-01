import { useMemo } from 'react';

import { type OpenStatus } from './use-open-with-exit-animation';

type StaggerAnimationOptions = {
  enterClass: string;
  exitClass: string;
  /** ms between each item on enter. Items appear bottom-to-top. Default: 50 */
  enterStagger?: number;
  /** ms between each item on exit. Items disappear top-to-bottom. Default: 20 */
  exitStagger?: number;
};

/**
 * Computes animation class and delay for each item in a staggered list,
 * based on the current open/closing status.
 *
 * Enter: bottom-to-top (last item animates first, closest to the trigger).
 * Exit:  top-to-bottom (first item animates first), faster than enter.
 */
export function useStaggerAnimation(
  count: number,
  status: OpenStatus,
  options: StaggerAnimationOptions
) {
  const {
    enterClass,
    exitClass,
    enterStagger = 50,
    exitStagger = 20,
  } = options;
  const isClosing = status === 'closing';

  return useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        animationClass: isClosing ? exitClass : enterClass,
        animationDelay: isClosing
          ? index * exitStagger
          : (count - 1 - index) * enterStagger,
      })),
    [count, isClosing, enterClass, exitClass, enterStagger, exitStagger]
  );
}
