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

const NAV_SECTIONS = ['/commutes', '/requests', '/account'] as const;

/**
 * Returns the nav index (0-3) for a given pathname under /app/$orgSlug.
 * Dashboard = 0, commutes = 1, requests = 2, account = 3.
 */
export function getNavIndex(pathname: string): number {
  const match = pathname.match(/^\/app\/[^/]+(\/.*)?$/);
  const section = match?.[1] ?? '';
  for (let i = 0; i < NAV_SECTIONS.length; i++) {
    if (section.startsWith(NAV_SECTIONS[i]!)) return i + 1;
  }
  return 0;
}

export const mainNavLinks = linkOptions([
  {
    labelTranslationKey: 'layout:nav.dashboard',
    navIndex: 0,
    icon: IconHouseDuotone,
    iconActive: IconHouseFill,
    from: '/app/$orgSlug' as const,
    to: '/app/$orgSlug',
    activeOptions: { exact: true },
  },
  {
    labelTranslationKey: 'layout:nav.commutes',
    navIndex: 1,
    icon: IconCarDuotone,
    iconActive: IconCarFill,
    from: '/app/$orgSlug' as const,
    to: '/app/$orgSlug/commutes',
  },
  {
    labelTranslationKey: 'layout:nav.requests',
    navIndex: 2,
    icon: IconBellDuotone,
    iconActive: IconBellFill,
    badge: NavBadge,
    from: '/app/$orgSlug' as const,
    to: '/app/$orgSlug/requests',
  },
  {
    labelTranslationKey: 'layout:nav.account',
    navIndex: 3,
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
