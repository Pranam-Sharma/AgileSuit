
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin',
    description: 'Manage your organization.',
};

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold">Admin Panel</h1>
        <p className="mt-4">Admin features coming soon!</p>
    </div>
  );
}
