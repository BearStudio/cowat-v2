import { toast as sonnerToast } from 'sonner';

import { triggerHaptic } from '@/lib/haptics';

type Toast = typeof sonnerToast;

export const toast: Toast = Object.assign(
  (...args: Parameters<Toast>) => sonnerToast(...args),
  {
    ...sonnerToast,
    success: (...args: Parameters<Toast['success']>) => {
      triggerHaptic('success');
      return sonnerToast.success(...args);
    },
    error: (...args: Parameters<Toast['error']>) => {
      triggerHaptic('error');
      return sonnerToast.error(...args);
    },
  }
);
