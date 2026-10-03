import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import '@/lib/i18n';
import { server } from './msw';

// Animations are not under test; finish them instantly.
MotionGlobalConfig.skipAnimations = true;

vi.mock('next/navigation', async () => {
  const { mockNavigation, mockRouter } = await import('./navigation');
  return {
    useRouter: () => mockRouter,
    usePathname: () => mockNavigation.pathname,
    useSearchParams: () => new URLSearchParams(),
  };
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  window.localStorage.clear();
  vi.clearAllMocks();
  const { mockNavigation } = await import('./navigation');
  mockNavigation.pathname = '/';
});

afterAll(() => server.close());
