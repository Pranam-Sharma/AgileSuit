import { AuthLayout } from '@/modules/auth/auth-layout-new';
import { LoginForm } from '@/modules/auth/login-form-new';
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
