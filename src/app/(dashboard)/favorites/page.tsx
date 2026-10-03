import type { Metadata } from 'next';
import { FavoritesSection } from '@/components/sections/FavoritesSection';

export const metadata: Metadata = { title: 'Favorites' };

export default function FavoritesPage() {
  return <FavoritesSection />;
}
