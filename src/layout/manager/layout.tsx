import { ReactNode } from 'react';

import { NavSidebar } from '@/layout/manager/nav-sidebar';

export const Layout = (props: { children?: ReactNode; orgSlug: string }) => {
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-manager">
      <NavSidebar orgSlug={props.orgSlug}>{props.children}</NavSidebar>
    </div>
  );
};
