import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { getMainNavLinks, NavLinkItem } from '@/layout/app/main-nav-config';

const HEIGHT = 'calc(64px + env(safe-area-inset-bottom))';

export const MainNavMobile = ({ orgSlug }: { orgSlug: string }) => {
  const { t } = useTranslation(['layout']);
  const navLinks = getMainNavLinks(orgSlug);
  return (
    <div className="md:hidden">
      <div
        style={{
          height: HEIGHT,
        }}
      />
      <nav
        className="fixed right-0 bottom-0 left-0 flex border-t border-t-neutral-200 bg-white px-4 pb-safe-bottom dark:border-t-neutral-800 dark:bg-neutral-900"
        style={{ height: HEIGHT }}
      >
        {navLinks.map(({ labelTranslationKey, ...item }) => (
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
  badge: Badge,
  children,
  ...linkProps
}: NavLinkItem) => {
  const IconActive = iconActive ?? Icon;
  return (
    <Link
      {...linkProps}
      className="flex flex-1 flex-col items-center justify-center text-neutral-500 dark:text-neutral-400 [&.active]:text-primary"
    >
      <span className="relative">
        <Icon className="size-6 opacity-60 [.active_&]:hidden" />
        <IconActive className="hidden size-6 [.active_&]:block" />
        {Badge && <Badge />}
      </span>
      <span className="text-2xs font-medium">{children}</span>
    </Link>
  );
};
