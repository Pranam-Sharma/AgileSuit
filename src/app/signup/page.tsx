import { AuthLayout } from '@/components/auth/auth-layout-new';
import { SignUpForm } from '@/components/auth/signup-form-new';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create an account with AgileSuit.',
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
