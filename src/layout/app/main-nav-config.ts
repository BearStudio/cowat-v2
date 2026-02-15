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

export const getMainNavLinks = (orgSlug: string) =>
  linkOptions([
    {
      labelTranslationKey: 'layout:nav.dashboard',
      icon: IconHouseDuotone,
      iconActive: IconHouseFill,
      to: '/app/$orgSlug',
      params: { orgSlug },
      activeOptions: { exact: true },
    },
    {
      labelTranslationKey: 'layout:nav.commutes',
      icon: IconCarDuotone,
      iconActive: IconCarFill,
      to: '/app/$orgSlug/commutes',
      params: { orgSlug },
    },
    {
      labelTranslationKey: 'layout:nav.requests',
      icon: IconBellDuotone,
      iconActive: IconBellFill,
      badge: NavBadge,
      to: '/app/$orgSlug/requests',
      params: { orgSlug },
    },
    {
      labelTranslationKey: 'layout:nav.account',
      icon: IconUserCircleDuotone,
      iconActive: IconUserCircleFill,
      to: '/app/$orgSlug/account',
      params: { orgSlug },
    },
  ]);

export type NavLinkItem = Omit<
  ReturnType<typeof getMainNavLinks>[number],
  'labelTranslationKey'
> & { children?: React.ReactNode; badge?: React.ComponentType };
