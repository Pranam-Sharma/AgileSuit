import { AuthLayout } from '@/components/auth/auth-layout-new';
import { SignUpForm } from '@/components/auth/signup-form-new';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create an account with AgileSuit.',
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center w-full h-full min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-600" />
        </div>
      }>
        <SignUpForm />
      </Suspense>
    </AuthLayout>
  );
}
