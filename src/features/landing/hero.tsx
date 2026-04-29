import { ArrowRight } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button-link';

export function LandingHero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
      <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
        Covoiturage domicile-travail
      </div>
      <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        Le covoiturage <span className="text-primary">pour votre équipe.</span>
      </h1>
      <p className="max-w-xl text-lg text-balance text-muted-foreground">
        Cowat organise les trajets partagés au sein de votre organisation. Moins
        de voitures, plus de liens, zéro friction.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink size="lg" to="/login">
          Rejoindre mon organisation
          <ArrowRight />
        </ButtonLink>
        <ButtonLink size="lg" variant="secondary" to="/login">
          En savoir plus
        </ButtonLink>
      </div>
    </section>
  );
}
