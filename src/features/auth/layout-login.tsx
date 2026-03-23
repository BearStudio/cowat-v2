import { Link } from '@tanstack/react-router';
import { ReactNode } from 'react';

import { Logo } from '@/components/brand/logo';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

import authImage from './auth-image.png';

export const LayoutLogin = (props: {
  children?: ReactNode;
  footer?: ReactNode;
}) => {
  return (
    <div
      className="flex flex-1 flex-col bg-white pt-safe-top pb-safe-bottom lg:flex-row dark:bg-neutral-950"
      data-testid="layout-login"
    >
      {/* Mobile image banner */}
      <div className="relative shrink-0 overflow-hidden lg:hidden">
        <img
          src={authImage}
          alt=""
          className="h-80 w-full object-cover object-[45%_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/60 via-brand-900/40 to-brand-950/60" />
      </div>

      <div className="relative -mt-6 flex w-full flex-1 flex-col gap-4 rounded-t-3xl bg-white p-6 max-md:overflow-hidden md:p-10 lg:-mt-0 lg:rounded-t-none dark:bg-neutral-950">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <Logo className="w-24" />
          </Link>
          <div className="flex flex-wrap justify-end gap-x-4">
            <ThemeSwitcher iconOnly />
            <LocalSwitcher />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{props.children}</div>
        </div>
        {props.footer}
      </div>

      {/* Desktop right panel */}
      <div className="relative m-4 hidden flex-1 overflow-hidden rounded-3xl lg:flex">
        <img
          src={authImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/80 via-brand-900/60 to-brand-950/80" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
      </div>
    </div>
  );
};
