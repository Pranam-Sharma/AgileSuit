import { FeaturesSection } from '@/components/landing/features';
import { LandingPage } from '@/components/landing/landing-page';
import { ResourcesSection } from '@/components/landing/resources';
import { SolutionsSection } from '@/components/landing/solutions';

export default function Home() {
  return (
    <LandingPage>
      <SolutionsSection />
      <FeaturesSection />
      <ResourcesSection />
    </LandingPage>
  );
}
