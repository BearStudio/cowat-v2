import { useEffect, useRef, useState } from 'react';

export type OpenStatus = 'closed' | 'open' | 'closing';

/**
 * Manages an open/closing/closed state machine that keeps elements mounted
 * during their exit animation before unmounting.
 */
export function useOpenWithExitAnimation(exitDuration = 220) {
  const [status, setStatus] = useState<OpenStatus>('closed');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const toggle = () => {
    if (status === 'closed') {
      setStatus('open');
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus('closing');
      timerRef.current = setTimeout(() => setStatus('closed'), exitDuration);
    }
  };

  return {
    status,
    toggle,
    isVisible: status === 'open' || status === 'closing',
  };
}
