import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';

import { ButtonLink } from '@/components/ui/button-link';
import {
  type FabVariantProps,
  ResponsiveFab,
  fabVariants,
} from '@/components/ui/floating-action-button';

export const FloatingActionButtonLink = ({
  icon,
  label,
  size = 'sm',
  fabSize,
  breakpoint,
  className,
  ...props
}: Omit<ComponentProps<typeof ButtonLink>, 'size' | 'children'> & {
  icon: ReactNode;
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  fabSize?: FabVariantProps['size'];
  breakpoint?: number;
}) => (
  <ResponsiveFab
    breakpoint={breakpoint}
    desktop={
      <ButtonLink size={size} className={className} {...props}>
        {icon}
        {label}
      </ButtonLink>
    }
    mobile={
      <ButtonLink
        size="icon"
        className={cn(fabVariants({ size: fabSize }), className)}
        {...props}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </ButtonLink>
    }
  />
);
