import { Link, useParams } from '@tanstack/react-router';
import { ChevronRightIcon, MapPinIcon, RepeatIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { DisplayPreferences } from '@/features/account/display-preferences';
import { NotificationPreferences } from '@/features/account/notification-preferences';
import { UserCard } from '@/features/account/user-card';
import { BuildInfoDrawer } from '@/features/build-info/build-info-drawer';
import { BuildInfoVersion } from '@/features/build-info/build-info-version';
import { OrgSwitcher } from '@/features/organization/org-switcher';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  const { t } = useTranslation(['account']);
  const { orgSlug } = useParams({ strict: false });

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">
          {t('account:title')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-4">
          <div className="md:hidden">
            <OrgSwitcher />
          </div>
          <UserCard />
          <Link
            to="/app/$orgSlug/account/locations"
            params={{ orgSlug: orgSlug! }}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <MapPinIcon className="size-5 text-muted-foreground" />
            <span className="flex-1">{t('account:locationsLink')}</span>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Link>
          <Link
            to="/app/$orgSlug/account/commute-templates"
            params={{ orgSlug: orgSlug! }}
            className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <RepeatIcon className="size-5 text-muted-foreground" />
            <span className="flex-1">{t('account:commuteTemplatesLink')}</span>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Link>
          <NotificationPreferences />
          <DisplayPreferences />
          <BuildInfoDrawer>
            <Button variant="ghost" size="xs" className="opacity-60">
              <BuildInfoVersion />
            </Button>
          </BuildInfoDrawer>
        </div>
      </PageLayoutContent>
    </PageLayout>
  );
};
