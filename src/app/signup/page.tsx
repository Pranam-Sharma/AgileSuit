import { AuthLayout } from '@/components/auth/auth-layout';
import { SignUpForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign Up',
    description: 'Create an account with AgileSuit.',
};

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Enter your email below to create your account"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
