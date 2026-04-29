import { Check } from 'lucide-react';

const POINTS = [
  'Trajets organisés, pas perdus dans 200 messages',
  'Notifications Slack et push, sans canal supplémentaire',
  'Réservations, statuts et annulations sans aller-retour',
];

export function LandingSlack() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="flex flex-col gap-4">
        <div className="w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Un espace dédié
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Vos canaux Slack sont{' '}
          <span className="text-muted-foreground line-through">
            déjà saturés.
          </span>
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Créer un canal de plus pour le covoit, c'est ajouter du bruit à une
          surface déjà encombrée. Cowat sort de la mêlée : un espace structuré
          juste pour ça, qui pousse les bonnes notifications là où vos équipes
          sont déjà — Slack, mobile.
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2 text-sm">
              <Check className="size-4 shrink-0 text-primary" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
