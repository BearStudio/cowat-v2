import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { DisplayPreferences } from '@/features/account/display-preferences';
import { MemberPreferences } from '@/features/account/member-preferences';
import { UserCard } from '@/features/account/user-card';
import { BuildInfoDrawer } from '@/features/build-info/build-info-drawer';
import { BuildInfoVersion } from '@/features/build-info/build-info-version';
import { OrgSettingsCard } from '@/features/organization/manager/org-settings-card';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/manager/page-layout';

export const PageAccount = () => {
  const { t } = useTranslation(['account']);
  return (
    <PageLayout>
      <PageLayoutTopBar>
        <PageLayoutTopBarTitle>{t('account:title')}</PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('account:sections.personal')}
            </h2>
            <UserCard />
            <DisplayPreferences />
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t('account:sections.organization')}
            </h2>
            <OrgSettingsCard />
            <MemberPreferences />
          </section>

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
