import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';

import { OrgLink } from '@/features/organization/org-link';
import { OrgSwitcher } from '@/features/organization/org-switcher';
import {
  getNavIndex,
  mainNavLinks,
  NavLinkItem,
} from '@/layout/app/main-nav-config';

export const MainNavDesktop = () => {
  const { t } = useTranslation(['layout']);
  const HEIGHT = 'calc(56px + env(safe-area-inset-top))';
  return (
    <div className="hidden [view-transition-name:main-nav] md:flex">
      <div
        style={{
          height: HEIGHT,
        }}
      />
      <header
        className="fixed top-0 right-0 left-0 flex items-center border-b border-b-neutral-200 bg-white pt-safe-top dark:border-b-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <OrgLink to="/app/$orgSlug">
              <Logo className="w-24" />
            </OrgLink>
            <OrgSwitcher />
          </div>
          <nav className="flex gap-0.5">
            {mainNavLinks.map(({ labelTranslationKey, ...item }) => (
              <Item key={item.to} {...item}>
                {t(labelTranslationKey)}
              </Item>
            ))}
          </nav>
        </div>
      </header>
    </div>
  );
};

const Item = ({
  icon: Icon,
  iconActive,
  navIndex,
  badge: Badge,
  children,
  ...linkProps
}: NavLinkItem) => {
  const IconActive = iconActive ?? Icon;
  return (
    <Link
      {...linkProps}
      viewTransition={{
        types: ({ fromLocation }) => {
          const fromIndex = fromLocation
            ? getNavIndex(fromLocation.pathname)
            : navIndex;
          if (fromIndex === navIndex) return [];
          return fromIndex < navIndex ? ['slide-left'] : ['slide-right'];
        },
      }}
      className="flex items-center justify-center gap-2 rounded-md px-2.5 py-2 text-neutral-500 transition-[transform,color,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black/5 active:scale-95 dark:text-neutral-400 dark:hover:bg-white/5 [&.active]:scale-105 [&.active]:text-primary"
    >
      <span className="relative">
        <Icon className="size-4 opacity-60 in-[.active]:hidden" />
        <IconActive className="hidden size-4 in-[.active]:block" />
        {Badge && <Badge />}
      </span>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};
