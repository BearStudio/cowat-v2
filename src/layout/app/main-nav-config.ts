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

export const MAIN_NAV_LINKS = linkOptions([
  {
    labelTranslationKey: 'layout:nav.dashboard',
    icon: IconHouseDuotone,
    iconActive: IconHouseFill,
    to: '/app',
    activeOptions: { exact: true },
  },
  {
    labelTranslationKey: 'layout:nav.commutes',
    icon: IconCarDuotone,
    iconActive: IconCarFill,
    to: '/app/commutes',
  },
  {
    labelTranslationKey: 'layout:nav.requests',
    icon: IconBellDuotone,
    iconActive: IconBellFill,
    badge: NavBadge,
    to: '/app/requests',
  },
  {
    labelTranslationKey: 'layout:nav.account',
    icon: IconUserCircleDuotone,
    iconActive: IconUserCircleFill,
    to: '/app/account',
  },
]);

export type NavLinkItem = Omit<
  (typeof MAIN_NAV_LINKS)[number],
  'labelTranslationKey'
> & { children?: React.ReactNode; badge?: React.ComponentType };
