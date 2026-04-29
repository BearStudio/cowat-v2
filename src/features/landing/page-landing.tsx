import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Bell,
  BookTemplate,
  CalendarDays,
  Check,
  CircleDollarSign,
  Heart,
  Leaf,
  LogIn,
  MapPin,
  Menu,
  Users,
} from 'lucide-react';

import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export function PageLanding() {
  return (
    <div className="flex flex-1 flex-col">
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

      <div className="relative flex flex-1 flex-col">
        <div className="absolute inset-0">
          <ScrollArea className="h-full">
            <main className="flex flex-col">
              {/* Hero */}
              <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
                <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  Covoiturage domicile-travail
                </div>
                <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Le covoiturage{' '}
                  <span className="text-primary">pour votre équipe.</span>
                </h1>
                <p className="max-w-xl text-lg text-balance text-muted-foreground">
                  Cowat organise les trajets partagés au sein de votre
                  organisation. Moins de voitures, plus de liens, zéro friction.
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

              {/* La mission */}
              <section className="border-y bg-muted/40">
                <div className="mx-auto max-w-5xl px-6 py-20">
                  <div className="mb-12 flex flex-col gap-4">
                    <div className="w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                      La mission
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                      Une voiture pleine,{' '}
                      <span className="text-primary">
                        trois bonnes raisons.
                      </span>
                    </h2>
                    <p className="max-w-xl text-muted-foreground">
                      Le covoiturage en organisation n'est pas qu'une question
                      de logistique. C'est un geste qui fait du bien — aux gens,
                      à la planète, au portefeuille.
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

              {/* Un espace dédié */}
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
                    Créer un canal de plus pour le covoit, c'est ajouter du
                    bruit à une surface déjà encombrée. Cowat sort de la mêlée :
                    un espace structuré juste pour ça, qui pousse les bonnes
                    notifications là où vos équipes sont déjà — Slack, mobile.
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {SLACK_POINTS.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="size-4 shrink-0 text-primary" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Fonctionnalités */}
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
                      Pas une plateforme grand public. Pas un canal de chat. Un
                      outil dédié, calibré pour les besoins réels d'une équipe
                      qui partage ses trajets.
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

              {/* CTA */}
              <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                  Demandez un accès pour{' '}
                  <span className="text-primary">votre organisation.</span>
                </h2>
                <p className="max-w-md text-balance text-muted-foreground">
                  Cowat est encore en accès limité. Dites-nous qui vous êtes et
                  nous créons votre espace en quelques heures.
                </p>
                <ButtonLink size="lg" to="/login">
                  Demander un accès
                  <ArrowRight />
                </ButtonLink>
                <p className="text-xs text-muted-foreground">
                  Réponse sous 24h · Aucun engagement · Self-hosted possible
                </p>
              </section>
            </main>

            <footer className="border-t border-border">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
                <span>
                  © {new Date().getFullYear()} Cowat. Tous droits réservés.
                </span>
                <div className="flex gap-6">
                  <span className="cursor-pointer transition-colors hover:text-foreground">
                    Mentions légales
                  </span>
                  <span className="cursor-pointer transition-colors hover:text-foreground">
                    Confidentialité
                  </span>
                </div>
              </div>
            </footer>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

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

const SLACK_POINTS = [
  'Trajets organisés, pas perdus dans 200 messages',
  'Notifications Slack et push, sans canal supplémentaire',
  'Réservations, statuts et annulations sans aller-retour',
];

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
