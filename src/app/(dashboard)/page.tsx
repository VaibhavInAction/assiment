import type { Metadata } from 'next';
import { FeedSection } from '@/components/sections/FeedSection';

export const metadata: Metadata = { title: 'Your Feed' };

export default function FeedPage() {
  return <FeedSection />;
}
