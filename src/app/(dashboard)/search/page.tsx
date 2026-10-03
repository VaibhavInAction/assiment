import type { Metadata } from 'next';
import { SearchSection } from '@/components/sections/SearchSection';

export const metadata: Metadata = { title: 'Search' };

export default function SearchPage() {
  return <SearchSection />;
}
