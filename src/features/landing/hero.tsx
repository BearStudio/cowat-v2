import { ArrowRight, Code2, Star, Zap } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button-link';

import { BookingStatusBadge } from '@/features/booking/booking-status-badge';
import {
  CardCommute,
  CardCommuteContent,
  CardCommuteHeader,
  CardCommuteTrigger,
} from '@/features/commute/card-commute';

const TRUST_SIGNALS = [
  { icon: Zap, label: 'Zéro friction' },
  { icon: Star, label: 'Open source' },
  { icon: Code2, label: 'Self-hostable' },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background treatment */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,var(--color-brand-100),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,color-mix(in_oklch,var(--color-brand-950)_60%,transparent),transparent)]"
      />
      {/* Dot grid */}
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
        {/* Left: text */}
        <div className="max-w-xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-widest text-brand-700 uppercase dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
            <span className="size-1.5 rounded-full bg-brand-500" />
            Covoiturage domicile-travail
          </div>

          {/* Headline */}
          <h1 className="text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Moins de voitures.
            <br />
            <span className="text-primary">Plus d'équipe.</span>
          </h1>

          {/* Subline */}
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Cowat organise les covoiturages dans votre organisation — trajets
            partagés, notifications Slack, zéro canal de trop. Simple pour les
            membres, puissant pour les RH.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink size="lg" to="/login">
              Rejoindre mon organisation
              <ArrowRight />
            </ButtonLink>
            <ButtonLink size="lg" variant="secondary" to="/login">
              Voir une démo
            </ButtonLink>
          </div>

          {/* Trust signals */}
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

        {/* Right: phone mockup */}
        <PhoneMockup />
      </div>
    </section>
  );
}

function PhoneMockup() {
  return (
    <div className="hidden lg:block">
      {/* Phone frame */}
      <div
        className="relative w-[280px] overflow-hidden rounded-[2.5rem] border-[6px] border-neutral-800 bg-neutral-50 shadow-2xl dark:border-neutral-700 dark:bg-neutral-950"
        style={{ rotate: '3deg' }}
      >
        {/* Dynamic island */}
        <div className="absolute top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 rounded-full bg-neutral-900 dark:bg-black" />

        {/* Screen content */}
        <div className="flex flex-col">
          {/* Fake app topbar */}
          <div className="bg-background px-4 pt-10 pb-3">
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              Jeudi 29 mai
            </p>
            <h2 className="text-base font-semibold">Trajets du jour</h2>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2 bg-muted/50 px-3 pb-4">
            <CardCommute bookingStatus="ACCEPTED">
              <CardCommuteTrigger>
                <CardCommuteHeader
                  driver={{ name: 'Sophie Bernard', image: null }}
                  type="ROUND"
                  totalSeats={4}
                  outwardTaken={2}
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

            <CardCommute bookingStatus="OUTSIDER">
              <CardCommuteTrigger>
                <CardCommuteHeader
                  driver={{ name: 'Marc Leroy', image: null }}
                  type="ONEWAY"
                  totalSeats={3}
                  outwardTaken={1}
                  outwardDeparture="08:30"
                />
              </CardCommuteTrigger>
              <CardCommuteContent>
                <span />
              </CardCommuteContent>
            </CardCommute>

            <CardCommute bookingStatus="OUTSIDER">
              <CardCommuteTrigger>
                <CardCommuteHeader
                  driver={{ name: 'Julie Faure', image: null }}
                  type="ROUND"
                  totalSeats={4}
                  outwardTaken={3}
                  inwardTaken={2}
                  outwardDeparture="09:00"
                  inwardDeparture="18:00"
                />
              </CardCommuteTrigger>
              <CardCommuteContent>
                <span />
              </CardCommuteContent>
            </CardCommute>
          </div>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t from-neutral-50 dark:from-neutral-950" />
        </div>
      </div>
    </div>
  );
}
