import { XIcon } from 'lucide-react';
import { ComponentProps, ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import {
  type FabVariantProps,
  fabVariants,
} from '@/components/ui/floating-action-button';

type SpeedDialProps = {
  icon: ReactNode;
  label: ReactNode;
  variant?: ComponentProps<typeof Button>['variant'];
  fabSize?: FabVariantProps['size'];
  children: ReactNode;
};

export const SpeedDial = ({
  icon,
  label,
  variant = 'secondary',
  fabSize,
  children,
}: SpeedDialProps) => {
  const [open, setOpen] = useState(false);

  const fabRoot = document.getElementById('fab-portal-root');

  return (
    <>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-20 bg-black/40"
            onClick={() => setOpen(false)}
          />,
          document.body
        )}
      {fabRoot &&
        createPortal(
          <div className="flex flex-col items-end gap-3">
            {open && (
              <div
                className="grid grid-cols-[1fr_auto] items-center gap-3"
                onClick={() => setOpen(false)}
              >
                {children}
              </div>
            )}
            <Button
              size="icon"
              variant={variant}
              className={fabVariants({ size: fabSize })}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <XIcon /> : icon}
              <span className="sr-only">{label}</span>
            </Button>
          </div>,
          fabRoot
        )}
    </>
  );
};

export const SpeedDialItem = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => (
  <div className="contents">
    <span className="justify-self-end rounded-md bg-popover px-3 py-1.5 text-sm font-medium whitespace-nowrap text-popover-foreground shadow-md">
      {label}
    </span>
    {children}
  </div>
);
