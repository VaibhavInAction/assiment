import type { Metadata } from 'next';
import { LoginForm } from '@/components/sections/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,var(--accent),transparent_60%)] px-4 py-10">
      <LoginForm />
    </main>
  );
}
