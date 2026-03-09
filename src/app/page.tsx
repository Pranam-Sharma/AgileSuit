
import { AuthRedirector } from '@/modules/auth/auth-redirector';
import { FeaturesSection } from '@/modules/landing/features';
import { LandingPage } from '@/modules/landing/landing-page';
import { ResourcesSection } from '@/modules/landing/resources';
import { SolutionsSection } from '@/modules/landing/solutions';

// ...
export const dynamic = 'force-dynamic';

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
