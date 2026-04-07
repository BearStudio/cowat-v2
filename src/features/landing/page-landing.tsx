import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Logo } from '@/components/brand/logo';
import { buttonVariants } from '@/components/ui/button';
import { LocalSwitcher } from '@/components/ui/local-switcher';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export const PageLanding = () => {
  const { t } = useTranslation(['landing']);

  return (
    <div className="landing-root">
      {/* Nav */}
      <header className="landing-nav">
        <Logo className="landing-logo" />
        <div className="flex items-center gap-1">
          <ThemeSwitcher iconOnly />
          <LocalSwitcher iconOnly />
          <Link
            to="/login"
            className={buttonVariants({ size: 'sm', variant: 'ghost' })}
          >
            {t('landing:cta.login')}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="landing-hero">
        <div className="landing-blob landing-blob-1" aria-hidden />
        <div className="landing-blob landing-blob-2" aria-hidden />
        <div className="landing-hero-content">
          <h1 className="landing-headline">
            {t('landing:hero.headline')}
            <br />
            <em className="landing-headline-em">
              {t('landing:hero.headlineEm')}
            </em>
          </h1>
          <p className="landing-subline">{t('landing:hero.subline')}</p>
          <div className="landing-cta">
            <Link to="/login" className={buttonVariants({ size: 'lg' })}>
              {t('landing:cta.login')}
            </Link>
            <a
              href="mailto:hello@cowat.app"
              className={buttonVariants({ size: 'lg', variant: 'ghost' })}
            >
              {t('landing:cta.requestAccess')}
            </a>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="landing-features">
        <Feature
          number="01"
          title={t('landing:features.post.title')}
          description={t('landing:features.post.description')}
        />
        <Feature
          number="02"
          title={t('landing:features.book.title')}
          description={t('landing:features.book.description')}
        />
        <Feature
          number="03"
          title={t('landing:features.ride.title')}
          description={t('landing:features.ride.description')}
        />
      </section>

      {/* Features CTA */}
      <section className="landing-features-cta">
        <p className="landing-features-cta-text">
          {t('landing:featuresCta.text')}
        </p>
        <div className="landing-features-cta-actions">
          <Link to="/login" className={buttonVariants({ size: 'lg' })}>
            {t('landing:featuresCta.login')}
          </Link>
          <a
            href="mailto:hello@cowat.app"
            className={buttonVariants({ size: 'lg', variant: 'secondary' })}
          >
            {t('landing:featuresCta.requestAccess')}
          </a>
        </div>
      </section>

      {/* Story */}
      <section className="landing-story">
        <div className="landing-story-text">
          <h2 className="landing-story-title">{t('landing:story.title')}</h2>
          <div className="landing-story-body">
            <p>{t('landing:story.paragraph1')}</p>
            <p>{t('landing:story.paragraph2')}</p>
            <p>{t('landing:story.paragraph3')}</p>
          </div>
        </div>
        <div className="landing-story-visual" aria-hidden>
          <Logo className="landing-story-logo" />
        </div>
      </section>

      {/* Access note */}
      <section className="landing-access">
        <p className="landing-access-title">{t('landing:access.title')}</p>
        <p className="landing-access-text">
          {t('landing:access.text')}{' '}
          <a href="mailto:hello@cowat.app" className="landing-access-link">
            {t('landing:access.link')}
          </a>{' '}
          {t('landing:access.textAfter')}
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
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="landing-feature">
    <span className="landing-feature-number" aria-hidden>
      {number}
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
    background-color: var(--color-neutral-50);
    color: var(--color-neutral-950);
    overflow-x: hidden;
  }

  :is(.dark) .landing-root {
    background-color: var(--color-neutral-950);
    color: var(--color-neutral-100);
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
    pointer-events: none;
    border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
    filter: blur(40px);
  }

  .landing-blob-1 {
    top: -12%;
    right: -8%;
    width: clamp(280px, 50vw, 650px);
    aspect-ratio: 1;
    background: radial-gradient(
      ellipse at 55% 45%,
      oklch(0.82 0.12 235 / 0.28),
      oklch(0.78 0.09 245 / 0.12) 50%,
      transparent 72%
    );
    animation: landing-blob-1 16s ease-in-out infinite alternate;
  }

  .landing-blob-2 {
    bottom: -5%;
    left: -10%;
    width: clamp(200px, 35vw, 450px);
    aspect-ratio: 1.2;
    background: radial-gradient(
      ellipse at 50% 50%,
      oklch(0.85 0.08 220 / 0.2),
      oklch(0.8 0.06 250 / 0.08) 55%,
      transparent 75%
    );
    border-radius: 40% 60% 50% 50% / 60% 40% 60% 40%;
    animation: landing-blob-2 20s ease-in-out infinite alternate;
  }

  :is(.dark) .landing-blob-1 {
    background: radial-gradient(
      ellipse at 55% 45%,
      oklch(0.35 0.12 240 / 0.3),
      oklch(0.3 0.08 235 / 0.12) 50%,
      transparent 72%
    );
  }

  :is(.dark) .landing-blob-2 {
    background: radial-gradient(
      ellipse at 50% 50%,
      oklch(0.3 0.1 250 / 0.2),
      oklch(0.25 0.06 240 / 0.08) 55%,
      transparent 75%
    );
  }

  @keyframes landing-blob-1 {
    0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
    50%  { transform: translate(-4%, 6%) rotate(12deg) scale(1.06); }
    100% { transform: translate(2%, -3%) rotate(-5deg) scale(0.97); }
  }

  @keyframes landing-blob-2 {
    0%   { transform: translate(0, 0) rotate(0deg) scale(1); }
    50%  { transform: translate(5%, -4%) rotate(-8deg) scale(1.08); }
    100% { transform: translate(-2%, 3%) rotate(6deg) scale(0.95); }
  }

  .landing-hero-content {
    position: relative;
    max-width: 44rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .landing-headline {
    font-size: clamp(2.25rem, 5.5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: -0.025em;
    margin: 0;
    color: var(--color-neutral-900);
  }

  :is(.dark) .landing-headline {
    color: var(--color-neutral-100);
  }

  .landing-headline-em {
    font-style: normal;
    color: var(--color-brand-600);
  }

  :is(.dark) .landing-headline-em {
    color: var(--color-brand-400);
  }

  .landing-subline {
    font-size: clamp(1rem, 2vw, 1.125rem);
    line-height: 1.65;
    color: var(--color-neutral-500);
    max-width: 36rem;
    margin: 0;
  }

  .landing-cta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  /* Features */
  .landing-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
    gap: 0;
    border-top: 1px solid var(--color-neutral-200);
    margin: 0 clamp(1.25rem, 5vw, 3rem);
  }

  :is(.dark) .landing-features {
    border-color: var(--color-neutral-800);
  }

  .landing-feature {
    padding: clamp(1.75rem, 4vw, 2.5rem);
    border-right: 1px solid var(--color-neutral-200);
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  :is(.dark) .landing-feature {
    border-color: var(--color-neutral-800);
  }

  .landing-feature:last-child {
    border-right: none;
  }

  .landing-feature-number {
    font-size: 0.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--color-brand-500);
    letter-spacing: 0.04em;
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
    color: var(--color-neutral-500);
    margin: 0;
  }

  /* Features CTA */
  .landing-features-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 5vw, 3rem);
    background-color: var(--color-brand-50);
    border-top: 1px solid var(--color-brand-100);
    border-bottom: 1px solid var(--color-brand-100);
  }

  :is(.dark) .landing-features-cta {
    background-color: oklch(0.18 0.02 240);
    border-color: var(--color-neutral-800);
  }

  .landing-features-cta-text {
    font-size: clamp(1.125rem, 2.5vw, 1.375rem);
    font-weight: 600;
    letter-spacing: -0.015em;
    margin: 0;
    color: var(--color-neutral-900);
  }

  :is(.dark) .landing-features-cta-text {
    color: var(--color-neutral-100);
  }

  .landing-features-cta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  /* Story */
  .landing-story {
    padding: clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem);
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(2rem, 4vw, 3rem);
    align-items: center;
  }

  @media (min-width: 768px) {
    .landing-story {
      grid-template-columns: 1fr 1fr;
    }
  }

  .landing-story-text {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .landing-story-visual {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .landing-story-logo {
    width: clamp(10rem, 20vw, 16rem);
    height: auto;
    opacity: 0.06;
  }

  :is(.dark) .landing-story-logo {
    opacity: 0.08;
  }

  .landing-story-title {
    font-size: clamp(1.5rem, 3.5vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0;
    color: var(--color-neutral-900);
  }

  :is(.dark) .landing-story-title {
    color: var(--color-neutral-100);
  }

  .landing-story-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .landing-story-body p {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--color-neutral-600);
    margin: 0;
  }

  :is(.dark) .landing-story-body p {
    color: var(--color-neutral-400);
  }

  /* Access */
  .landing-access {
    padding: clamp(3rem, 6vw, 5rem) clamp(1.25rem, 5vw, 3rem);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .landing-access-title {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-brand-600);
    margin: 0;
  }

  :is(.dark) .landing-access-title {
    color: var(--color-brand-400);
  }

  .landing-access-text {
    font-size: 0.9375rem;
    color: var(--color-neutral-500);
    margin: 0;
    max-width: 28rem;
  }

  .landing-access-link {
    color: var(--color-brand-600);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
    transition: color 0.15s;
  }

  .landing-access-link:hover {
    color: var(--color-brand-700);
  }

  :is(.dark) .landing-access-link {
    color: var(--color-brand-400);
  }

  :is(.dark) .landing-access-link:hover {
    color: var(--color-brand-300);
  }

  /* Footer */
  .landing-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(1.25rem, 3vw, 1.75rem) clamp(1.25rem, 5vw, 3rem);
    border-top: 1px solid var(--color-neutral-200);
  }

  :is(.dark) .landing-footer {
    border-color: var(--color-neutral-800);
  }

  .landing-footer-logo {
    height: 1.25rem;
    width: auto;
    opacity: 0.4;
  }

  .landing-footer-copy {
    font-size: 0.8125rem;
    color: var(--color-neutral-400);
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .landing-blob {
      animation: none;
    }
  }
`;
