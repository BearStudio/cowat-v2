import { Match } from 'effect';
import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/lib/tailwind/utils';
import { useIsMobile } from '@/hooks/use-mobile';

import { Button } from '@/components/ui/button';

export const ResponsiveIconButton = ({
  size = 'default',
  children,
  label,
  breakpoint,
  ...props
}: Omit<ComponentProps<typeof Button>, 'size'> & {
  label: ReactNode;
  size?: 'xs' | 'sm' | 'default' | 'lg';
  breakpoint?: number;
}) => {
  const isMobile = useIsMobile(breakpoint);
  const buttonIconSize = Match.value(size).pipe(
    Match.when('default', () => 'icon' as const),
    Match.when('xs', () => 'icon-xs' as const),
    Match.when('sm', () => 'icon-sm' as const),
    Match.when('lg', () => 'icon-lg' as const),
    Match.exhaustive
  );
  const buttonSize = isMobile ? buttonIconSize : size;

  return (
    <Button size={buttonSize} {...props}>
      {children}
      <span className={cn(isMobile && 'sr-only')}>{label}</span>
    </Button>
  );
};
