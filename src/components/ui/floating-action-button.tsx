import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentProps, ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';

export const fabVariants = cva(
  'rounded-xl shadow-lg transition-[color,box-shadow,transform] active:scale-[0.97]',
  {
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
  }
);

export type FabVariantProps = VariantProps<typeof fabVariants>;

const getFabPortalRoot = () => document.getElementById('fab-portal-root');

export const FabPortal = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const root = getFabPortalRoot();
  if (!root) return null;
  return createPortal(<div className={cn(className)}>{children}</div>, root);
};

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
