import { linkOptions } from '@tanstack/react-router';

import {
  IconBellDuotone,
  IconBellFill,
  IconCarDuotone,
  IconCarFill,
  IconHouseDuotone,
  IconHouseFill,
  IconUserCircleDuotone,
  IconUserCircleFill,
} from '@/components/icons/generated';

import { NavBadge } from '@/layout/app/nav-badge';

export const mainNavLinks = linkOptions([
  {
    labelTranslationKey: 'layout:nav.dashboard',
    icon: IconHouseDuotone,
    iconActive: IconHouseFill,
    from: '/app/$orgSlug' as const,
    to: '/app/$orgSlug',
    activeOptions: { exact: true },
  },
  {
    labelTranslationKey: 'layout:nav.commutes',
    icon: IconCarDuotone,
    iconActive: IconCarFill,
    from: '/app/$orgSlug' as const,
    to: '/app/$orgSlug/commutes',
  },
  {
    labelTranslationKey: 'layout:nav.requests',
    icon: IconBellDuotone,
    iconActive: IconBellFill,
    badge: NavBadge,
    from: '/app/$orgSlug' as const,
    to: '/app/$orgSlug/requests',
  },
  {
    labelTranslationKey: 'layout:nav.account',
    icon: IconUserCircleDuotone,
    iconActive: IconUserCircleFill,
    from: '/app/$orgSlug' as const,
    to: '/app/$orgSlug/account',
  },
]);

export type NavLinkItem = Omit<
  (typeof mainNavLinks)[number],
  'labelTranslationKey'
> & { children?: React.ReactNode; badge?: React.ComponentType };
