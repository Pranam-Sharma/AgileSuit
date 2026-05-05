import type { Metadata } from 'next';
import { SettingsClient } from '@/modules/settings/settings-client';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your AgileSuit settings.',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
