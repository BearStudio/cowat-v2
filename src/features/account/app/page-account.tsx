import { Link } from '@tanstack/react-router';
import { ChevronRightIcon, MapPinIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { DisplayPreferences } from '@/features/account/display-preferences';
import { UserCard } from '@/features/account/user-card';
import { BuildInfoDrawer } from '@/features/build-info/build-info-drawer';
import { BuildInfoVersion } from '@/features/build-info/build-info-version';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  const { t } = useTranslation(['account']);

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">
          {t('account:title')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-4">
          <UserCard />
          <Link
            to="/app/account/locations"
            className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <MapPinIcon className="size-5 text-muted-foreground" />
            <span className="flex-1">Locations</span>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Link>
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
