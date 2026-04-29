import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Car,
  Clock,
  Leaf,
  LogIn,
  MapPin,
  Menu,
  Shield,
  Users,
} from 'lucide-react';

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
            <img src="/Logo.png" alt="Cowat" className="h-8" />
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
                  Partagez la route,{' '}
                  <span className="text-primary">simplifiez le trajet</span>
                </h1>
                <p className="max-w-xl text-lg text-balance text-muted-foreground">
                  Cowat connecte les salariés d'une même organisation pour
                  covoiturer facilement. Moins de voitures, moins de stress,
                  plus de lien social.
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

              {/* Features */}
              <section className="border-y bg-muted/40">
                <div className="mx-auto grid max-w-5xl gap-8 px-6 py-20 sm:grid-cols-2 lg:grid-cols-3">
                  {FEATURES.map((feature) => (
                    <div key={feature.title} className="flex flex-col gap-3">
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
              </section>

              {/* CTA */}
              <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-balance">
                  Prêt à covoiturer ?
                </h2>
                <p className="max-w-md text-balance text-muted-foreground">
                  Rejoignez votre organisation sur Cowat et commencez à partager
                  vos trajets dès aujourd'hui.
                </p>
                <ButtonLink size="lg" to="/login">
                  Commencer maintenant
                  <ArrowRight />
                </ButtonLink>
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

const FEATURES = [
  {
    icon: Car,
    title: 'Trajets partagés',
    description:
      'Trouvez des collègues qui habitent sur votre chemin et organisez vos covoiturages en quelques clics.',
  },
  {
    icon: Clock,
    title: 'Planification simple',
    description:
      'Gérez vos trajets récurrents ou ponctuels, modifiez vos disponibilités à la volée.',
  },
  {
    icon: MapPin,
    title: 'Itinéraires optimisés',
    description:
      'Les trajets sont calculés pour minimiser les détours et maximiser le confort de chacun.',
  },
  {
    icon: Users,
    title: 'Communauté de confiance',
    description:
      'Uniquement les salariés de votre organisation — un réseau fermé et sécurisé.',
  },
  {
    icon: Leaf,
    title: 'Impact écologique',
    description:
      'Chaque covoiturage réduit les émissions de CO₂ et contribue à un avenir plus durable.',
  },
  {
    icon: Shield,
    title: 'Données protégées',
    description:
      'Vos informations personnelles restent confidentielles et ne sont jamais partagées avec des tiers.',
  },
];
