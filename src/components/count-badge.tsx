import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/tailwind/utils';

const countBadgeVariants = cva(
  'inline-flex items-center justify-center rounded-full text-[10px] leading-none font-bold',
  {
    variants: {
      variant: {
        destructive: 'absolute -top-1 -right-1 size-4 bg-negative-500 text-white ring-2 ring-white md:size-3 md:text-[8px] dark:ring-neutral-900',
        subtle: 'ml-1 size-5 bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'subtle',
    },
  }
);

type CountBadgeProps = VariantProps<typeof countBadgeVariants> & {
  count: number | undefined;
  className?: string;
};

export const CountBadge = ({ count, variant, className }: CountBadgeProps) => {
  if (!count) return null;

  return (
    <span className={cn(countBadgeVariants({ variant }), className)}>
      {count > 99 ? '99+' : count}
    </span>
  );
};
