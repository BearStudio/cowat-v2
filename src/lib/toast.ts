import { toast as sonnerToast } from 'sonner';
import { WebHaptics } from 'web-haptics';

type Toast = typeof sonnerToast;

const haptics = new WebHaptics();

export const toast: Toast = Object.assign(
  (...args: Parameters<Toast>) => sonnerToast(...args),
  {
    ...sonnerToast,
    success: (...args: Parameters<Toast['success']>) => {
      haptics.trigger('success');
      return sonnerToast.success(...args);
    },
    error: (...args: Parameters<Toast['error']>) => {
      haptics.trigger('error');
      return sonnerToast.error(...args);
    },
  }
);
