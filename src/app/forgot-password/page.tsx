import { AuthLayout } from '@/components/auth/auth-layout-new';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your AgileSuit password.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
