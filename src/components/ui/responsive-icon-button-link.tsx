import { Match } from 'effect';
import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { ButtonLink } from '@/components/ui/button-link';

export const ResponsiveIconButtonLink = ({
  label,
  size,
  breakpoint,
  children,
  ...props
}: Omit<ComponentProps<typeof ButtonLink>, 'size' | 'children'> & {
  children?: ReactNode;
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  breakpoint?: number;
}) => {
  const isMobile = useIsMobile(breakpoint);
  const buttonIconSize = Match.value(size).pipe(
    Match.when('default', () => 'icon' as const),
    Match.when(undefined, () => 'icon' as const),
    Match.when('xs', () => 'icon-xs' as const),
    Match.when('sm', () => 'icon-sm' as const),
    Match.when('lg', () => 'icon-lg' as const),
    Match.exhaustive
  );
  const buttonSize = isMobile ? buttonIconSize : size;

  return (
    <ButtonLink size={buttonSize} {...props}>
      {children}
      <span className={cn(isMobile && 'sr-only')}>{label}</span>
    </ButtonLink>
  );
};
