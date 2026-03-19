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
      className="flex flex-1 bg-white pt-safe-top pb-safe-bottom dark:bg-neutral-950"
      data-testid="layout-login"
    >
      <div className="flex w-full flex-1 flex-col gap-4 p-6 max-md:overflow-hidden md:p-10">
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

      {/* Right panel */}
      <div className="relative hidden w-full flex-1 overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center lg:gap-4">
        {/* Blurred background layer */}
        <img
          src={authImage}
          alt=""
          className="absolute inset-0 size-full object-cover blur-[2px]"
        />
        {/* Sharp head layer with radial mask */}
        <img
          src={authImage}
          alt=""
          className="absolute inset-0 size-full object-cover"
          style={{
            maskImage:
              'radial-gradient(ellipse 35% 30% at 45% 35%, black 40%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 35% 30% at 45% 35%, black 40%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/80 via-brand-900/60 to-brand-950/80" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
        <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs text-white/70 italic">
          Meuh-ci de covoiturer 🐄
        </p>
      </div>
    </div>
  );
};
