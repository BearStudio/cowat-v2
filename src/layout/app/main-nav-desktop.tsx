import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';

import { OrgSwitcher } from '@/features/organization/org-switcher';
import { getMainNavLinks, NavLinkItem } from '@/layout/app/main-nav-config';

export const MainNavDesktop = () => {
  const { t } = useTranslation(['layout']);
  const { orgSlug } = useParams({ strict: false });
  const navLinks = getMainNavLinks(orgSlug ?? '');
  const HEIGHT = 'calc(56px + env(safe-area-inset-top))';
  return (
    <div className="hidden md:flex">
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
            <Link to="/app/$orgSlug" params={{ orgSlug: orgSlug ?? '' }}>
              <Logo className="w-24" />
            </Link>
            <OrgSwitcher />
          </div>
          <nav className="flex gap-0.5">
            {navLinks.map(({ labelTranslationKey, ...item }) => (
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
  badge: Badge,
  children,
  ...linkProps
}: NavLinkItem) => {
  const IconActive = iconActive ?? Icon;
  return (
    <Link
      {...linkProps}
      className="flex items-center justify-center gap-2 rounded-md px-2.5 py-2 text-neutral-500 transition hover:bg-black/5 dark:text-neutral-400 dark:hover:bg-white/5 [&.active]:text-primary"
    >
      <span className="relative">
        <Icon className="size-4 opacity-60 [.active_&]:hidden" />
        <IconActive className="hidden size-4 [.active_&]:block" />
        {Badge && <Badge />}
      </span>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};
