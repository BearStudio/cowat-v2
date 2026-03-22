import { Link, useMatches } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import {
  getNavIndex,
  mainNavLinks,
  NavLinkItem,
} from '@/layout/app/main-nav-config';

const NAV_HEIGHT = 64;

export const MainNavMobile = () => {
  const { t } = useTranslation(['layout']);
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const activeIndex = lastMatch ? getNavIndex(lastMatch.fullPath) : 0;

  return (
    <div className="md:hidden">
      <nav
        className="fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 flex items-center rounded-3xl border border-black/[0.04] bg-white/80 shadow-lg shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150 [view-transition-name:main-nav-mobile] dark:border-white/[0.06] dark:bg-neutral-900/80 dark:shadow-black/20"
        style={
          {
            height: `${NAV_HEIGHT}px`,
            '--active-index': activeIndex,
          } as React.CSSProperties
        }
      >
        {/* Sliding indicator pill */}
        <div
          className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-xl bg-primary/[0.08] transition-[left] duration-[400ms] ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-primary/[0.12]"
          style={{
            width: `calc(25% - 0.5rem)`,
            left: `calc(var(--active-index) * 25% + 0.25rem)`,
          }}
        />

        {mainNavLinks.map(({ labelTranslationKey, ...item }) => (
          <Item key={item.to} {...item}>
            {t(labelTranslationKey)}
          </Item>
        ))}
      </nav>
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
      className="relative flex flex-1 flex-col items-center justify-center gap-0.5 text-neutral-400 transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] dark:text-neutral-500 [&.active]:text-primary"
    >
      <span className="relative transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.82]">
        <Icon className="size-[22px] in-[.active]:hidden" />
        <IconActive className="hidden size-[22px] in-[.active]:block" />
        {Badge && <Badge />}
      </span>
      <span className="text-[10px] leading-tight font-medium">{children}</span>
    </Link>
  );
};
