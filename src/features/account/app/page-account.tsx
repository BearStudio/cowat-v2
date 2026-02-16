import {
  ChevronRightIcon,
  MapPinIcon,
  RepeatIcon,
  SettingsIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { DisplayPreferences } from '@/features/account/display-preferences';
import { MemberPreferences } from '@/features/account/member-preferences';
import { NotificationPreferences } from '@/features/account/notification-preferences';
import { UserCard } from '@/features/account/user-card';
import { authClient } from '@/features/auth/client';
import { Role } from '@/features/auth/permissions';
import { BuildInfoDrawer } from '@/features/build-info/build-info-drawer';
import { BuildInfoVersion } from '@/features/build-info/build-info-version';
import { OrgLink } from '@/features/organization/org-link';
import { OrgSwitcher } from '@/features/organization/org-switcher';
import { useOrganizations } from '@/features/organization/use-organizations';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
} from '@/layout/app/page-layout';

export const PageAccount = () => {
  const { t } = useTranslation(['account']);
  const session = authClient.useSession();
  const { organizations, activeOrgId } = useOrganizations();

  const userRole = session.data?.user.role;
  const activeOrg = organizations?.find((org) => org.id === activeOrgId);

  // Show manager link if user is app admin OR org owner
  const showManagerLink =
    (userRole &&
      authClient.admin.checkRolePermission({
        role: userRole as Role,
        permission: { apps: ['manager'] },
      })) ||
    (activeOrg &&
      authClient.organization.checkRolePermission({
        role: activeOrg.role as 'owner' | 'admin' | 'member',
        permission: { organization: ['delete'] },
      }));

  return (
    <PageLayout>
      <PageLayoutTopBar>
        <h1 className="text-base font-medium md:text-sm">
          {t('account:title')}
        </h1>
      </PageLayoutTopBar>
      <PageLayoutContent>
        <div className="flex flex-col gap-6">
          <div className="md:hidden">
            <OrgSwitcher />
          </div>

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
            <MemberPreferences />
            <NotificationPreferences />
            {showManagerLink && (
              <OrgLink
                to="/manager"
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                <SettingsIcon className="size-5 text-muted-foreground" />
                <span className="flex-1">{t('account:managerLink')}</span>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </OrgLink>
            )}
            <OrgLink
              to="/app/$orgSlug/account/locations"
              className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
            >
              <MapPinIcon className="size-5 text-muted-foreground" />
              <span className="flex-1">{t('account:locationsLink')}</span>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </OrgLink>
            <OrgLink
              to="/app/$orgSlug/account/commute-templates"
              className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:bg-accent"
            >
              <RepeatIcon className="size-5 text-muted-foreground" />
              <span className="flex-1">
                {t('account:commuteTemplatesLink')}
              </span>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
            </OrgLink>
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
