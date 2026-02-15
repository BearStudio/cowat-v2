import { Link } from '@tanstack/react-router';
import {
  BarChart3Icon,
  BuildingIcon,
  PanelLeftIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { WithPermissions } from '@/features/auth/with-permission';
import { OrgSwitcher } from '@/features/organization/org-switcher';
import { NavUser } from '@/layout/manager/nav-user';

export const NavSidebar = (props: {
  orgSlug: string;
  children?: ReactNode;
}) => {
  const { t } = useTranslation(['layout']);
  const { orgSlug } = props;
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-auto"
                  render={
                    <Link to="/manager/$orgSlug" params={{ orgSlug }}>
                      <span>
                        <Logo className="w-24 group-data-[collapsible=icon]:w-18" />
                      </span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarTrigger
              className="group-data-[collapsible=icon]:hidden"
              icon={
                <>
                  <XIcon className="md:hidden" />
                  <PanelLeftIcon className="hidden md:block rtl:rotate-180" />
                </>
              }
            />
          </div>
        </SidebarHeader>
        <div className="px-2 py-1">
          <OrgSwitcher />
        </div>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{t('layout:nav.application')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link to="/manager/$orgSlug/stats" params={{ orgSlug }}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        isActive={isActive}
                        render={
                          <span>
                            <BarChart3Icon />
                            <span>{t('layout:nav.stats')}</span>
                          </span>
                        }
                      />
                    )}
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <WithPermissions
            permissions={[
              {
                user: ['list'],
              },
            ]}
          >
            <SidebarGroup>
              <SidebarGroupLabel>
                {t('layout:nav.configuration')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link to="/manager/$orgSlug/users" params={{ orgSlug }}>
                      {({ isActive }) => (
                        <SidebarMenuButton
                          isActive={isActive}
                          render={
                            <span>
                              <UsersIcon />
                              <span>{t('layout:nav.users')}</span>
                            </span>
                          }
                        />
                      )}
                    </Link>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <Link
                      to="/manager/$orgSlug/organizations"
                      params={{ orgSlug }}
                    >
                      {({ isActive }) => (
                        <SidebarMenuButton
                          isActive={isActive}
                          render={
                            <span>
                              <BuildingIcon />
                              <span>{t('layout:nav.organizations')}</span>
                            </span>
                          }
                        />
                      )}
                    </Link>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </WithPermissions>
        </SidebarContent>
        <SidebarFooter>
          <NavUser orgSlug={orgSlug} />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{props.children}</SidebarInset>
    </SidebarProvider>
  );
};
