import { ArrowRight, Code2, Star, Zap } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button-link';

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

      <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
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
      </div>
    </section>
  );
}
