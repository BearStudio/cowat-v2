import { ScrollArea } from '@/components/ui/scroll-area';

import { LandingCta } from './cta';
import { LandingFeatures } from './features';
import { LandingFooter } from './footer';
import { LandingHeader } from './header';
import { LandingHero } from './hero';
import { LandingMission } from './mission';
import { LandingSlack } from './slack';

export function PageLanding() {
  return (
    <div className="flex flex-1 flex-col">
      <LandingHeader />

      <div className="relative flex flex-1 flex-col">
        <div className="absolute inset-0">
          <ScrollArea className="h-full">
            <main className="flex flex-col">
              <LandingHero />
              <LandingMission />
              <LandingSlack />
              <LandingFeatures />
              <LandingCta />
            </main>
            <LandingFooter />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
