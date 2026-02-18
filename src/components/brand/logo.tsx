import type { SVGProps } from 'react';

import { cn } from '@/lib/tailwind/utils';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 200 40"
    fill="none"
    {...props}
    className={cn('text-primary', props.className)}
  >
    <title>Cowat</title>
    <text
      x="50%"
      y="50%"
      dominantBaseline="central"
      textAnchor="middle"
      fill="currentColor"
      fontSize="32"
      fontWeight="bold"
      fontFamily="Public Sans, system-ui, sans-serif"
    >
      Cowat
    </text>
  </svg>
);
