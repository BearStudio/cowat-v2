import {
  ArrowRight,
  Code2,
  EllipsisVerticalIcon,
  PlusIcon,
  Star,
  Wifi,
  Zap,
} from 'lucide-react';

import { CountBadge } from '@/components/count-badge';
import {
  IconBellDuotone,
  IconCarDuotone,
  IconHouseFill,
  IconUserCircleDuotone,
} from '@/components/icons/generated';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';

import { BookingStatusBadge } from '@/features/booking/booking-status-badge';
import {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
} from '@/features/commute/card-commute';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

const TRUST_SIGNALS = [
  { icon: Zap, label: 'Zéro friction' },
  { icon: Star, label: 'Open source' },
  { icon: Code2, label: 'Self-hostable' },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,var(--color-brand-100),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,color-mix(in_oklch,var(--color-brand-950)_60%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(var(--color-brand-400) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 70% 80% at 70% 50%, black 20%, transparent 80%)',
        }}
      />

      <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[1fr_auto]">
        <div className="max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-widest text-brand-700 uppercase dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
            <span className="size-1.5 rounded-full bg-brand-500" />
            Covoiturage domicile-travail
          </div>

          <h1 className="text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Moins de voitures.
            <br />
            <span className="text-primary">Plus d'équipe.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Cowat organise les covoiturages dans votre organisation — trajets
            partagés, notifications Slack, zéro canal de trop. Simple pour les
            membres, puissant pour les RH.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink size="lg" to="/login">
              Rejoindre mon organisation
              <ArrowRight />
            </ButtonLink>
            <ButtonLink size="lg" variant="secondary" to="/login">
              Voir une démo
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
            {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Icon className="size-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div
      aria-hidden
      className="relative hidden lg:block"
      style={{ rotate: '-2deg' }}
    >
      {/* Soft brand glow behind phone */}
      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-brand-300/40 via-brand-200/20 to-transparent blur-2xl dark:from-brand-700/30 dark:via-brand-900/20" />

      {/* Phone frame */}
      <div className="relative flex h-[640px] w-[320px] flex-col overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-900 bg-background shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)] dark:border-neutral-800 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)]">
        {/* iOS Status bar */}
        <div className="relative z-20 flex h-10 shrink-0 items-center justify-between bg-background px-6 text-[11px] font-semibold tabular-nums">
          <span>9:41</span>
          {/* Dynamic island */}
          <div className="absolute top-1.5 left-1/2 h-7 w-24 -translate-x-1/2 rounded-full bg-neutral-950 dark:bg-black" />
          <div className="flex items-center gap-1">
            <Wifi className="size-3" />
            <span className="ml-0.5 inline-flex h-2.5 w-5 items-center rounded-[3px] border border-current/70 p-[1px]">
              <span className="block h-full w-[80%] rounded-[1px] bg-current" />
            </span>
          </div>
        </div>

        {/* Real app layout */}
        <div className="flex flex-1 flex-col">
          <PageLayout>
            <PageLayoutTopBar
              endActions={
                <Button variant="ghost" size="icon-sm" type="button">
                  <EllipsisVerticalIcon />
                </Button>
              }
            >
              <PageLayoutTopBarTitle>Tableau de bord</PageLayoutTopBarTitle>
            </PageLayoutTopBar>
            <PageLayoutContent
              containerClassName="py-3 px-3"
              className="!pb-28"
            >
              <div className="flex flex-col gap-5">
                {/* Today */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 [animation-duration:1.5s]" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
                    </span>
                    <h2 className="text-lg font-semibold text-primary capitalize">
                      Aujourd'hui
                    </h2>
                  </div>

                  <div className="flex flex-col gap-3">
                    <CardCommute bookingStatus="ACCEPTED">
                      <CardCommuteTrigger>
                        <CardCommuteHeader
                          driver={{ name: 'Sophie Bernard', image: null }}
                          type="ROUND"
                          totalSeats={4}
                          outwardTaken={3}
                          inwardTaken={2}
                          outwardDeparture="08:15"
                          inwardDeparture="17:30"
                          badge={<BookingStatusBadge status="ACCEPTED" />}
                        />
                      </CardCommuteTrigger>
                      <CardCommuteContent>
                        <span />
                      </CardCommuteContent>
                    </CardCommute>

                    <CardCommute bookingStatus="DRIVER">
                      <CardCommuteTrigger>
                        <CardCommuteHeader
                          driver={{ name: 'Vous', image: null }}
                          type="ROUND"
                          totalSeats={4}
                          outwardTaken={2}
                          inwardTaken={3}
                          outwardDeparture="08:30"
                          inwardDeparture="18:00"
                          badge={<BookingStatusBadge status="DRIVER" />}
                        />
                      </CardCommuteTrigger>
                      <CardCommuteContent>
                        <span />
                      </CardCommuteContent>
                    </CardCommute>
                  </div>
                </div>

                {/* Tomorrow */}
                <div className="flex flex-col gap-2">
                  <h2 className="text-base font-semibold text-foreground capitalize">
                    Demain
                  </h2>

                  <CardCommute bookingStatus="REQUESTED">
                    <CardCommuteTrigger>
                      <CardCommuteHeader
                        driver={{ name: 'Marc Leroy', image: null }}
                        type="ONEWAY"
                        totalSeats={3}
                        outwardTaken={1}
                        outwardDeparture="08:30"
                        badge={<BookingStatusBadge status="REQUESTED" />}
                      />
                    </CardCommuteTrigger>
                    <CardCommuteContent>
                      <span />
                    </CardCommuteContent>
                  </CardCommute>
                </div>
              </div>
            </PageLayoutContent>
          </PageLayout>
        </div>

        {/* Floating action button (FAB) */}
        <div className="absolute right-4 bottom-24 z-30">
          <button
            type="button"
            className="flex size-14 items-center justify-center rounded-3xl border bg-background text-foreground shadow-lg shadow-black/10 active:scale-[0.97] dark:shadow-black/40"
          >
            <PlusIcon className="size-5" />
          </button>
        </div>

        {/* Bottom mobile nav (clone of MainNavMobile) */}
        <BottomNavMock />
      </div>
    </div>
  );
}

function BottomNavMock() {
  return (
    <nav
      className="absolute right-3 bottom-3 left-3 z-30 flex h-16 items-center rounded-3xl border border-black/[0.04] bg-white/80 shadow-lg shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.06] dark:bg-neutral-900/80 dark:shadow-black/20"
      style={{ '--active-index': 0 } as React.CSSProperties}
    >
      {/* Sliding indicator pill (active = dashboard, index 0) */}
      <div
        className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-xl bg-primary/[0.08] dark:bg-primary/[0.12]"
        style={{
          width: 'calc(25% - 0.5rem)',
          left: 'calc(var(--active-index) * 25% + 0.25rem)',
        }}
      />
      <NavItem icon={IconHouseFill} label="Trajets" active />
      <NavItem icon={IconCarDuotone} label="Mes trajets" />
      <NavItem icon={IconBellDuotone} label="Demandes" pendingCount={2} />
      <NavItem icon={IconUserCircleDuotone} label="Compte" />
    </nav>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
  pendingCount,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  pendingCount?: number;
}) {
  return (
    <span
      className={
        'relative flex flex-1 flex-col items-center justify-center gap-0.5 ' +
        (active ? 'text-primary' : 'text-neutral-400 dark:text-neutral-500')
      }
    >
      <span className="relative">
        <Icon className="size-[22px]" />
        <CountBadge count={pendingCount} variant="destructive" />
      </span>
      <span className="text-[10px] leading-tight font-medium">{label}</span>
    </span>
  );
}
