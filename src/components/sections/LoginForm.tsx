'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';

type Field = 'name' | 'email' | 'password';
type Mode = 'signin' | 'signup';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO_ACCOUNT = { name: 'Demo User', email: 'demo@pulseboard.dev' };

/** "jane.doe@site.com" -> "Jane Doe" */
export function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const words = local.split(/[._-]+/).filter(Boolean);
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ') || 'User';
}

export function validateCredentials(values: Record<Field, string>, mode: Mode): Partial<Record<Field, true>> {
  const errors: Partial<Record<Field, true>> = {};
  if (mode === 'signup' && !values.name.trim()) errors.name = true;
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = true;
  if (values.password.length < 6) errors.password = true;
  return errors;
}

/**
 * Mock authentication. Any valid email and a 6+ character password sign you in.
 * In production this would be NextAuth.js with httpOnly session cookies.
 */
export function LoginForm() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, true>>>({});
  const fieldRefs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});

  const finish = (name: string, email: string) => {
    dispatch(login({ name, email }));
    router.push('/');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateCredentials(values, mode);
    setErrors(nextErrors);
    const firstInvalid = (['name', 'email', 'password'] as const).find((field) => nextErrors[field]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }
    finish(mode === 'signup' ? values.name.trim() : nameFromEmail(values.email), values.email);
  };

  const fields: Array<{ field: Field; type: string; autoComplete: string }> = [
    ...(mode === 'signup' ? [{ field: 'name' as const, type: 'text', autoComplete: 'name' }] : []),
    { field: 'email', type: 'email', autoComplete: 'email' },
    { field: 'password', type: 'password', autoComplete: mode === 'signup' ? 'new-password' : 'current-password' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface w-full max-w-md p-6 shadow-xl sm:p-8"
    >
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden className="size-4" />
        {t('auth.backToDashboard')}
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Zap aria-hidden className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold">{mode === 'signin' ? t('auth.signInTitle') : t('auth.signUpTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.subtitle')}</p>
        </div>
      </div>

      <form noValidate onSubmit={onSubmit} className="space-y-4">
        {fields.map(({ field, type, autoComplete }) => (
          <div key={field}>
            <label htmlFor={`auth-${field}`} className="mb-1 block text-sm font-medium">
              {t(`auth.${field}`)}
            </label>
            <input
              ref={(node) => {
                fieldRefs.current[field] = node;
              }}
              id={`auth-${field}`}
              name={field}
              type={type}
              autoComplete={autoComplete}
              value={values[field]}
              onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))}
              aria-invalid={errors[field] ? true : undefined}
              aria-describedby={errors[field] ? `auth-${field}-error` : undefined}
              className="input h-11"
            />
            {errors[field] && (
              <p id={`auth-${field}-error`} className="mt-1 text-sm text-danger">
                {t(`auth.errors.${field}`)}
              </p>
            )}
          </div>
        ))}

        <button type="submit" className="btn-primary h-11 w-full">
          {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
        </button>
      </form>

      <button
        type="button"
        className="btn-secondary mt-3 h-11 w-full"
        onClick={() => finish(DEMO_ACCOUNT.name, DEMO_ACCOUNT.email)}
      >
        {t('auth.demo')}
      </button>

      <button
        type="button"
        className="mt-4 w-full text-center text-sm font-medium text-primary hover:underline"
        onClick={() => {
          setMode(mode === 'signin' ? 'signup' : 'signin');
          setErrors({});
        }}
      >
        {mode === 'signin' ? t('auth.switchToSignUp') : t('auth.switchToSignIn')}
      </button>

      <p className="mt-6 flex items-start gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
        <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />
        {t('auth.mockNotice')}
      </p>
    </motion.div>
  );
}
