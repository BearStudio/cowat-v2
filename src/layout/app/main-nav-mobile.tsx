import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import {
  getNavIndex,
  mainNavLinks,
  NavLinkItem,
} from '@/layout/app/main-nav-config';

const HEIGHT = 'calc(64px + env(safe-area-inset-bottom))';

export const MainNavMobile = () => {
  const { t } = useTranslation(['layout']);
  return (
    <div className="[view-transition-name:main-nav-mobile] md:hidden">
      <div
        style={{
          height: HEIGHT,
        }}
      />
      <nav
        className="fixed right-0 bottom-0 left-0 flex rounded-t-3xl border-t border-t-neutral-200 bg-white px-4 pb-safe-bottom dark:border-t-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
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
      className="flex flex-1 flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 [&.active]:text-primary"
    >
      <span className="relative">
        <Icon className="size-6 opacity-60 in-[.active]:hidden" />
        <IconActive className="hidden size-6 in-[.active]:block" />
        {Badge && <Badge />}
      </span>
      <span className="text-2xs font-medium">{children}</span>
    </Link>
  );
};
