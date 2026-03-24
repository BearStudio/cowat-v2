import { Children, ComponentProps, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/tailwind/utils';
import { useOpenWithExitAnimation } from '@/hooks/use-open-with-exit-animation';
import { useStaggerAnimation } from '@/hooks/use-stagger-animation';

import { Button } from '@/components/ui/button';
import {
  type FabVariantProps,
  fabVariants,
} from '@/components/ui/floating-action-button';

// Max exit duration: last item delay (items × exitStagger) + animation duration (150ms) + margin
const EXIT_DURATION_MS = 220;

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
  const { status, toggle, isVisible } =
    useOpenWithExitAnimation(EXIT_DURATION_MS);

  const items = Children.toArray(children);
  const stagger = useStaggerAnimation(items.length, status, {
    enterClass: 'animate-speed-dial-item-in',
    exitClass: 'animate-speed-dial-item-out',
  });

  const fabRoot = document.getElementById('fab-portal-root');

  return (
    <>
      {isVisible &&
        createPortal(
          <div
            className={cn(
              'fixed inset-0 z-20 bg-black/40 motion-reduce:animate-none',
              status === 'closing'
                ? 'animate-speed-dial-backdrop-out'
                : 'animate-speed-dial-backdrop-in'
            )}
            onClick={toggle}
          />,
          document.body
        )}
      {fabRoot &&
        createPortal(
          <div className="flex flex-col items-end gap-3">
            {isVisible && (
              <div className="grid grid-cols-[1fr_auto] gap-3" onClick={toggle}>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'col-span-2 grid grid-cols-subgrid items-center justify-items-end motion-reduce:animate-none',
                      stagger[index]?.animationClass
                    )}
                    style={{
                      animationDelay: `${stagger[index]?.animationDelay ?? 0}ms`,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
            <Button
              size="icon"
              variant={variant}
              className={fabVariants({ size: fabSize })}
              onClick={toggle}
            >
              <span
                className={cn(
                  'transition-transform duration-200 ease-out motion-reduce:transition-none',
                  status === 'open' ? 'rotate-45' : 'rotate-0'
                )}
              >
                {icon}
              </span>
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
  <>
    <span className="justify-self-end rounded-md bg-popover px-3 py-1.5 text-sm font-medium whitespace-nowrap text-popover-foreground shadow-md">
      {label}
    </span>
    {children}
  </>
);
