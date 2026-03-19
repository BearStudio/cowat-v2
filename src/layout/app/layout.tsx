import { ReactNode, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';

import { fabContainerClasses } from '@/components/ui/floating-action-button';

import { MainNavDesktop } from '@/layout/app/main-nav-desktop';
import { MainNavMobile } from '@/layout/app/main-nav-mobile';

export const FAB_PORTAL_ID = 'fab-portal-root';

export const Layout = (props: { children?: ReactNode }) => {
  const showMainNavDesktop = useShouldShowNavStore(
    (s) => s.mode === 'all' || s.mode === 'desktop-only'
  );
  const showMainNavMobile = useShouldShowNavStore((s) => s.mode === 'all');
  return (
    <div className="flex flex-1 flex-col" data-testid="layout-app">
      {showMainNavDesktop && <MainNavDesktop />}
      <div className="flex flex-1 flex-col [view-transition-name:page-content]">
        {props.children}
      </div>
      {showMainNavMobile && <MainNavMobile />}
      {createPortal(
        <div
          id={FAB_PORTAL_ID}
          className={fabContainerClasses}
          style={{ viewTransitionName: 'fab' }}
        />,
        document.body
      )}
    </div>
  );
};

type ShouldShowNavMode = 'all' | 'desktop-only' | 'none';

interface ShouldShowNavState {
  mode: ShouldShowNavMode;
  update: (shouldShowNav: ShouldShowNavMode) => void;
}

const useShouldShowNavStore = create<ShouldShowNavState>()((set) => ({
  mode: 'all',
  update: (shouldShowNav) => {
    set({
      mode: shouldShowNav,
    });
  },
}));

export const useShouldShowNav = (shouldShowNav: ShouldShowNavMode) => {
  const update = useShouldShowNavStore((s) => s.update);
  useLayoutEffect(() => {
    update(shouldShowNav);
    return () => update('all');
  }, [update, shouldShowNav]);
};
