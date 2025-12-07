
import { AuthRedirector } from '@/components/auth/auth-redirector';
import { FeaturesSection } from '@/components/landing/features';
import { LandingPage } from '@/components/landing/landing-page';
import { ResourcesSection } from '@/components/landing/resources';
import { SolutionsSection } from '@/components/landing/solutions';

export default function Home() {
  return (
    <AuthRedirector>
      <LandingPage>
        <SolutionsSection />
        <FeaturesSection />
        <ResourcesSection />
      </LandingPage>
    </AuthRedirector>
  );
}
