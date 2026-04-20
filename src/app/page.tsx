
import { AuthRedirector } from '@/components/auth/auth-redirector';
import { HomePageResolver } from '@/components/landing/home-page-resolver';

// ...
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <AuthRedirector>
      <HomePageResolver />
    </AuthRedirector>
  );
}
