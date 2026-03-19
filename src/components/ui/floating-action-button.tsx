import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';

export const fabVariants = cva('rounded-full shadow-lg', {
  variants: {
    size: {
      default: "size-16 [&_svg:not([class*='size-'])]:size-6",
      sm: "size-14 [&_svg:not([class*='size-'])]:size-5",
      lg: "size-18 [&_svg:not([class*='size-'])]:size-7",
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const fabContainerClasses =
  'fixed z-30 flex flex-col items-center gap-3 bottom-[calc(64px+env(safe-area-inset-bottom)+1rem)] right-4';

export type FabVariantProps = VariantProps<typeof fabVariants>;

export const FabPortal = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) =>
  createPortal(
    <div
      className={cn(fabContainerClasses, className)}
      style={{ viewTransitionName: 'fab' }}
    >
      {children}
    </div>,
    document.body
  );

export const ResponsiveFab = ({
  mobile,
  desktop,
  breakpoint,
}: {
  mobile: ReactNode;
  desktop: ReactNode;
  breakpoint?: number;
}) => {
  const isMobile = useIsMobile(breakpoint);
  if (!isMobile) return desktop;
  return <FabPortal>{mobile}</FabPortal>;
};

export const FloatingActionButton = ({
  icon,
  label,
  size = 'sm',
  fabSize,
  breakpoint,
  className,
  ...props
}: Omit<ComponentProps<typeof Button>, 'size' | 'children'> & {
  icon: ReactNode;
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  fabSize?: FabVariantProps['size'];
  breakpoint?: number;
}) => (
  <ResponsiveFab
    breakpoint={breakpoint}
    desktop={
      <Button size={size} className={className} {...props}>
        {icon}
        {label}
      </Button>
    }
    mobile={
      <Button
        size="icon"
        className={cn(fabVariants({ size: fabSize }), className)}
        {...props}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </Button>
    }
  />
);
