import { Link } from '@tanstack/react-router';

import { Logo } from '@/components/brand/logo';
import { buttonVariants } from '@/components/ui/button';

export const PageLanding = () => {
  return (
    <div className="landing-root">
      {/* Nav */}
      <header className="landing-nav">
        <Logo className="landing-logo" />
        <Link
          to="/login"
          className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        >
          Se connecter
        </Link>
      </header>

      {/* Hero */}
      <main className="landing-hero">
        <div className="landing-blob" aria-hidden />
        <div className="landing-hero-content">
          <p className="landing-eyebrow">Covoiturage pour organisations</p>
          <h1 className="landing-headline">
            Le trajet du matin,{' '}
            <em className="landing-headline-em">fait ensemble.</em>
          </h1>
          <p className="landing-subline">
            Cowat connecte vos équipes sur la route. Moins de voitures vides,
            plus de liens entre collègues — et une empreinte carbone qui fond.
          </p>
          <div className="landing-cta">
            <Link to="/login" className={buttonVariants({ size: 'lg' })}>
              Se connecter
            </Link>
            <a
              href="mailto:hello@cowat.app"
              className={buttonVariants({ size: 'lg', variant: 'ghost' })}
            >
              Demander un accès →
            </a>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="landing-features">
        <Feature
          icon="🌱"
          title="Plus responsable"
          description="Chaque trajet partagé, c'est une voiture de moins sur la route. L'impact s'accumule, vraiment."
        />
        <Feature
          icon="🤝"
          title="Plus humain"
          description="Le covoiturage tisse des liens là où l'open space ne suffit pas. Une communauté qui se déplace ensemble."
        />
        <Feature
          icon="⚙️"
          title="Géré pour vous"
          description="Les managers ont une vue claire sur les trajets de l'organisation. Simple, sans friction."
        />
      </section>

      {/* Access note */}
      <section className="landing-access">
        <p className="landing-access-text">
          Cowat est disponible sur invitation.{' '}
          <a href="mailto:hello@cowat.app" className="landing-access-link">
            Contactez-nous
          </a>{' '}
          pour rejoindre la communauté.
        </p>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Logo className="landing-footer-logo" />
        <p className="landing-footer-copy">
          © {new Date().getFullYear()} Cowat
        </p>
      </footer>

      <style>{styles}</style>
    </div>
  );
};

const Feature = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="landing-feature">
    <span className="landing-feature-icon" aria-hidden>
      {icon}
    </span>
    <h2 className="landing-feature-title">{title}</h2>
    <p className="landing-feature-desc">{description}</p>
  </div>
);

const styles = `
  .landing-root {
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    font-family: var(--font-sans);
    background-color: oklch(0.983 0.006 95);
    color: oklch(0.22 0.012 240);
    overflow-x: hidden;
  }

  @media (prefers-color-scheme: dark) {
    .landing-root {
      background-color: oklch(0.14 0.01 250);
      color: oklch(0.93 0.008 95);
    }
  }

  :is(.dark) .landing-root {
    background-color: oklch(0.14 0.01 250);
    color: oklch(0.93 0.008 95);
  }

  /* Nav */
  .landing-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(1.25rem, 3vw, 1.75rem) clamp(1.25rem, 5vw, 3rem);
  }

  .landing-logo {
    height: 1.75rem;
    width: auto;
  }

  /* Hero */
  .landing-hero {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    padding: clamp(3rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem);
    min-height: 80svh;
  }

  .landing-blob {
    position: absolute;
    top: -10%;
    right: -5%;
    width: clamp(300px, 55vw, 700px);
    aspect-ratio: 1;
    background: radial-gradient(
      ellipse at 60% 40%,
      oklch(0.88 0.09 150 / 0.35),
      oklch(0.88 0.07 220 / 0.12) 55%,
      transparent 75%
    );
    border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
    pointer-events: none;
    animation: landing-blob-drift 12s ease-in-out infinite alternate;
  }

  @media (prefers-color-scheme: dark) {
    .landing-blob {
      background: radial-gradient(
        ellipse at 60% 40%,
        oklch(0.45 0.1 150 / 0.2),
        oklch(0.4 0.07 220 / 0.08) 55%,
        transparent 75%
      );
    }
  }

  :is(.dark) .landing-blob {
    background: radial-gradient(
      ellipse at 60% 40%,
      oklch(0.45 0.1 150 / 0.2),
      oklch(0.4 0.07 220 / 0.08) 55%,
      transparent 75%
    );
  }

  @keyframes landing-blob-drift {
    from { transform: translate(0, 0) rotate(0deg) scale(1); }
    to   { transform: translate(-3%, 4%) rotate(8deg) scale(1.04); }
  }

  .landing-hero-content {
    position: relative;
    max-width: 42rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    animation: landing-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes landing-fade-up {
    from { opacity: 0; transform: translateY(1.5rem); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .landing-eyebrow {
    font-size: 0.8125rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: oklch(0.55 0.14 150);
    animation: landing-fade-up 0.6s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @media (prefers-color-scheme: dark) {
    .landing-eyebrow { color: oklch(0.72 0.14 150); }
  }
  :is(.dark) .landing-eyebrow { color: oklch(0.72 0.14 150); }

  .landing-headline {
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.025em;
    margin: 0;
    animation: landing-fade-up 0.7s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .landing-headline-em {
    font-style: normal;
    color: oklch(0.52 0.15 150);
  }

  @media (prefers-color-scheme: dark) {
    .landing-headline-em { color: oklch(0.72 0.14 150); }
  }
  :is(.dark) .landing-headline-em { color: oklch(0.72 0.14 150); }

  .landing-subline {
    font-size: clamp(1rem, 2vw, 1.125rem);
    line-height: 1.65;
    color: oklch(0.45 0.01 240);
    max-width: 36rem;
    margin: 0;
    animation: landing-fade-up 0.7s 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @media (prefers-color-scheme: dark) {
    .landing-subline { color: oklch(0.72 0.008 95); }
  }
  :is(.dark) .landing-subline { color: oklch(0.72 0.008 95); }

  .landing-cta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    animation: landing-fade-up 0.7s 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  /* Features */
  .landing-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
    gap: 0;
    border-top: 1px solid oklch(0.88 0.005 240);
    margin: 0 clamp(1.25rem, 5vw, 3rem);
  }

  @media (prefers-color-scheme: dark) {
    .landing-features { border-color: oklch(0.28 0.01 240); }
  }
  :is(.dark) .landing-features { border-color: oklch(0.28 0.01 240); }

  .landing-feature {
    padding: clamp(1.75rem, 4vw, 2.5rem);
    border-right: 1px solid oklch(0.88 0.005 240);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    animation: landing-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }

  @media (prefers-color-scheme: dark) {
    .landing-feature { border-color: oklch(0.28 0.01 240); }
  }
  :is(.dark) .landing-feature { border-color: oklch(0.28 0.01 240); }

  .landing-feature:last-child {
    border-right: none;
  }

  .landing-feature-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .landing-feature-title {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    margin: 0;
  }

  .landing-feature-desc {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: oklch(0.5 0.01 240);
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    .landing-feature-desc { color: oklch(0.65 0.008 95); }
  }
  :is(.dark) .landing-feature-desc { color: oklch(0.65 0.008 95); }

  /* Access */
  .landing-access {
    padding: clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 3rem);
    text-align: center;
  }

  .landing-access-text {
    font-size: 0.9375rem;
    color: oklch(0.52 0.01 240);
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    .landing-access-text { color: oklch(0.65 0.008 95); }
  }
  :is(.dark) .landing-access-text { color: oklch(0.65 0.008 95); }

  .landing-access-link {
    color: oklch(0.52 0.15 150);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
    transition: color 0.15s;
  }

  .landing-access-link:hover {
    color: oklch(0.42 0.15 150);
  }

  @media (prefers-color-scheme: dark) {
    .landing-access-link { color: oklch(0.72 0.14 150); }
    .landing-access-link:hover { color: oklch(0.82 0.12 150); }
  }
  :is(.dark) .landing-access-link { color: oklch(0.72 0.14 150); }
  :is(.dark) .landing-access-link:hover { color: oklch(0.82 0.12 150); }

  /* Footer */
  .landing-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(1.25rem, 3vw, 1.75rem) clamp(1.25rem, 5vw, 3rem);
    border-top: 1px solid oklch(0.88 0.005 240);
  }

  @media (prefers-color-scheme: dark) {
    .landing-footer { border-color: oklch(0.28 0.01 240); }
  }
  :is(.dark) .landing-footer { border-color: oklch(0.28 0.01 240); }

  .landing-footer-logo {
    height: 1.25rem;
    width: auto;
    opacity: 0.45;
  }

  .landing-footer-copy {
    font-size: 0.8125rem;
    color: oklch(0.6 0.008 240);
    margin: 0;
  }

  @media (prefers-color-scheme: dark) {
    .landing-footer-copy { color: oklch(0.55 0.008 95); }
  }
  :is(.dark) .landing-footer-copy { color: oklch(0.55 0.008 95); }

  @media (prefers-reduced-motion: reduce) {
    .landing-hero-content,
    .landing-eyebrow,
    .landing-headline,
    .landing-subline,
    .landing-cta,
    .landing-feature,
    .landing-blob {
      animation: none;
    }
  }
`;
