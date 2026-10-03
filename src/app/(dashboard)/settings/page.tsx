import type { Metadata } from 'next';
import { SettingsSection } from '@/components/sections/SettingsSection';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return <SettingsSection />;
}
