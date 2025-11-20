import { AuthLayout } from '@/components/auth/auth-layout-new';
import { LoginForm } from '@/components/auth/login-form-new';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Login to your account.',
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
