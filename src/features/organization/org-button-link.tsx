import { VariantProps } from 'class-variance-authority';
import { ComponentProps, ReactNode } from 'react';
import { match } from 'ts-pattern';

import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { buttonVariants } from '@/components/ui/button';
import {
  type FabVariantProps,
  fabVariants,
  ResponsiveFab,
} from '@/components/ui/floating-action-button';

import { OrgLink } from '@/features/organization/org-link';

type OrgButtonLinkProps = VariantProps<typeof buttonVariants> &
  ComponentProps<'a'> &
  ComponentProps<typeof OrgLink>;

function OrgButtonLink({
  className,
  children,
  variant,
  size,
  ...props
}: OrgButtonLinkProps) {
  return (
    <OrgLink
      {...props}
      className={cn(buttonVariants({ variant, size, className }))}
    >
      <span className="flex min-w-0 flex-1 items-center justify-center">
        {children}
      </span>
    </OrgLink>
  );
}

type OrgResponsiveIconButtonLinkProps = Omit<
  OrgButtonLinkProps,
  'size' | 'children'
> & {
  children?: ReactNode;
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  breakpoint?: number;
};

function OrgResponsiveIconButtonLink({
  label,
  size,
  breakpoint,
  children,
  ...props
}: OrgResponsiveIconButtonLinkProps) {
  const isMobile = useIsMobile(breakpoint);
  const buttonIconSize = match(size)
    .with('default', undefined, () => 'icon' as const)
    .with('xs', () => 'icon-xs' as const)
    .with('sm', () => 'icon-sm' as const)
    .with('lg', () => 'icon-lg' as const)
    .exhaustive();
  const buttonSize = isMobile ? buttonIconSize : size;

  return (
    <OrgButtonLink size={buttonSize} {...props}>
      {children}
      <span className={cn(isMobile && 'sr-only')}>{label}</span>
    </OrgButtonLink>
  );
}

type OrgFloatingActionButtonLinkProps = Omit<
  OrgButtonLinkProps,
  'size' | 'children'
> & {
  children?: ReactNode;
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  fabSize?: FabVariantProps['size'];
  breakpoint?: number;
};

function OrgFloatingActionButtonLink({
  label,
  size = 'sm',
  fabSize,
  breakpoint,
  children,
  className,
  ...props
}: OrgFloatingActionButtonLinkProps) {
  return (
    <ResponsiveFab
      breakpoint={breakpoint}
      desktop={
        <OrgButtonLink size={size} className={className} {...props}>
          {children}
          {label}
        </OrgButtonLink>
      }
      mobile={
        <OrgButtonLink
          size="icon"
          className={cn(fabVariants({ size: fabSize }), className)}
          {...props}
        >
          {children}
          <span className="sr-only">{label}</span>
        </OrgButtonLink>
      }
    />
  );
}

export {
  OrgButtonLink,
  OrgFloatingActionButtonLink,
  OrgResponsiveIconButtonLink,
};
