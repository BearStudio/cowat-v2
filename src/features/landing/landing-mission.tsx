import { CircleDollarSign, Heart, Leaf } from 'lucide-react';

const REASONS = [
  {
    icon: Heart,
    title: 'Plus de liens entre collègues',
    description:
      "Le trajet du matin devient un moment partagé. Les nouveaux arrivants rencontrent l'équipe avant même d'arriver au bureau.",
  },
  {
    icon: Leaf,
    title: "Moins d'empreinte carbone",
    description:
      "Quatre voitures qui deviennent une, c'est trois trajets en moins chaque jour. L'impact écologique est immédiat et mesurable.",
  },
  {
    icon: CircleDollarSign,
    title: 'Des économies réelles',
    description:
      "Carburant, péages, parking : partagés. Vos membres gardent plus d'argent en poche, et l'entreprise réduit ses coûts mobilité.",
  },
];

export function LandingMission() {
  return (
    <section className="border-y bg-muted/40">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 flex flex-col gap-4">
          <div className="w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            La mission
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Une voiture pleine,{' '}
            <span className="text-primary">trois bonnes raisons.</span>
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Le covoiturage en organisation n'est pas qu'une question de
            logistique. C'est un geste qui fait du bien — aux gens, à la
            planète, au portefeuille.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {REASONS.map((reason) => (
            <div
              key={reason.title}
              className="flex flex-col gap-3 rounded-xl border bg-background p-6"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <reason.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{reason.title}</h3>
              <p className="text-sm text-muted-foreground">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
