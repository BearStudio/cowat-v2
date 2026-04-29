import {
  Bell,
  BookTemplate,
  CalendarDays,
  Check,
  MapPin,
  Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Tableau de bord du jour',
    description:
      "Tous les trajets disponibles aujourd'hui et les jours suivants, en un coup d'œil. Pas de recherche, pas de filtre — juste la bonne info au bon moment.",
  },
  {
    icon: MapPin,
    title: 'Trajets multi-arrêts',
    description:
      "Un trajet de A à C peut passer par B. Aller simple, retour, ou les deux. Chaque passager réserve l'arrêt qui lui correspond.",
  },
  {
    icon: BookTemplate,
    title: 'Templates récurrents',
    description:
      'Vous faites le même trajet chaque semaine ? Sauvegardez-le comme template et appliquez-le aux jours qui vous arrangent.',
  },
  {
    icon: Bell,
    title: 'Notifications là où vous êtes',
    description:
      "Slack et notifications push. Vos membres reçoivent l'info dans les outils qu'ils utilisent déjà, sans installer un nouveau truc.",
  },
  {
    icon: Users,
    title: 'Espace par organisation',
    description:
      "Vos collègues, vos trajets, vos données. Chaque organisation est isolée. Personne d'extérieur ne voit ce qui se passe chez vous.",
  },
  {
    icon: Check,
    title: 'Auto-acceptation optionnelle',
    description:
      'Validez chaque demande, ou laissez Cowat les accepter automatiquement. Vous gardez la main sur votre voiture.',
  },
];

export function LandingFeatures() {
  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <div className="w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Fonctionnalités
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Pensé pour le covoit du quotidien.
          </h2>
          <p className="max-w-xl text-balance text-muted-foreground">
            Pas une plateforme grand public. Pas un canal de chat. Un outil
            dédié, calibré pour les besoins réels d'une équipe qui partage ses
            trajets.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-3 rounded-xl border bg-background p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
