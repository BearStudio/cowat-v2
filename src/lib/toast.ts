import { toast as sonnerToast } from 'sonner';

import { hapticError, hapticSuccess } from '@/lib/haptic';

type Toast = typeof sonnerToast;

/**
 * Haptic-enhanced toast wrapper.
 * Automatically triggers haptic feedback on success/error toasts.
 */
export const toast: Toast = Object.assign(
  (...args: Parameters<Toast>) => sonnerToast(...args),
  {
    ...sonnerToast,
    success: (...args: Parameters<Toast['success']>) => {
      hapticSuccess();
      return sonnerToast.success(...args);
    },
    error: (...args: Parameters<Toast['error']>) => {
      hapticError();
      return sonnerToast.error(...args);
    },
  }
);
