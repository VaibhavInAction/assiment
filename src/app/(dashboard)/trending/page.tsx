import type { Metadata } from 'next';
import { TrendingSection } from '@/components/sections/TrendingSection';

export const metadata: Metadata = { title: 'Trending' };

export default function TrendingPage() {
  return <TrendingSection />;
}
