import { Link } from '@tanstack/react-router';
import { ArrowRight, LogIn, Menu } from 'lucide-react';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export function LandingHeader() {
  return (
    <header className="z-10 border-b border-border/50 bg-white/80 backdrop-blur dark:bg-neutral-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-5 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 sm:flex">
          <ThemeSwitcher iconOnly />
          <LocalSwitcher />
          <ButtonLink variant="ghost" size="sm" to="/login">
            Se connecter
          </ButtonLink>
          <ButtonLink size="sm" to="/login">
            Commencer
          </ButtonLink>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeSwitcher iconOnly />
          <LocalSwitcher />
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Menu" />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent
              side="top"
              showCloseButton={false}
              className="px-6 pt-4 pb-6"
            >
              <div className="flex flex-col gap-3">
                <ButtonLink
                  variant="secondary"
                  size="sm"
                  to="/login"
                  className="w-full justify-center"
                >
                  <LogIn />
                  Se connecter
                </ButtonLink>
                <ButtonLink
                  size="sm"
                  to="/login"
                  className="w-full justify-center"
                >
                  <ArrowRight />
                  Commencer
                </ButtonLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
