import { vi } from 'vitest';

/** Shared stand-ins for next/navigation so tests can assert on routing. */
export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

export const mockNavigation = { pathname: '/' };
