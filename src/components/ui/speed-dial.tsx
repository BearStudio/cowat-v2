import { XIcon } from 'lucide-react';
import { ComponentProps, ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/tailwind/utils';

import { Button } from '@/components/ui/button';
import {
  fabContainerClasses,
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

  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}
      <div className={cn(fabContainerClasses, 'items-end')}>
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
      </div>
    </>,
    document.body
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
