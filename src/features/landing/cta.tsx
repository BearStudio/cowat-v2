import { ArrowRight } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button-link';

export function LandingCta() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        Demandez un accès pour{' '}
        <span className="text-primary">votre organisation.</span>
      </h2>
      <p className="max-w-md text-balance text-muted-foreground">
        Cowat est encore en accès limité. Dites-nous qui vous êtes et nous
        créons votre espace en quelques heures.
      </p>
      <ButtonLink size="lg" to="/login">
        Demander un accès
        <ArrowRight />
      </ButtonLink>
      <p className="text-xs text-muted-foreground">
        Réponse sous 24h · Aucun engagement · Self-hosted possible
      </p>
    </section>
  );
}
