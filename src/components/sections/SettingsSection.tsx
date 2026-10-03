'use client';

import { Check, LogIn, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSelect } from '@/components/layout/LanguageSelect';
import { Avatar } from '@/components/layout/UserMenu';
import { PageHeader } from '@/components/ui/PageHeader';
import { Switch } from '@/components/ui/Switch';
import { CATEGORIES, CONTENT_TYPES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hydrateFromStorage } from '@/store/hydrate';
import { clearPersistedState, systemTheme } from '@/store/persistence';
import { AVATAR_COLORS, selectUser, updateProfile, type User } from '@/store/slices/authSlice';
import {
  initialPreferences,
  selectPreferences,
  setLiveUpdates,
  setTheme,
  toggleCategory,
  toggleSource,
} from '@/store/slices/preferencesSlice';

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const headingId = `settings-${title.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <section aria-labelledby={headingId} className="card-surface p-5 sm:p-6">
      <h2 id={headingId} className="text-lg font-semibold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileForm({ user }: { user: User }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [color, setColor] = useState(user.avatarColor);
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    dispatch(updateProfile({ name: name.trim(), bio: bio.trim(), avatarColor: color }));
    setSaved(true);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" onChange={() => setSaved(false)}>
      <div className="flex items-center gap-4">
        <Avatar user={{ ...user, name: name || user.name, avatarColor: color }} size={56} />
        <div className="min-w-0">
          <p className="truncate font-medium">{user.email}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium">
            {t('settings.displayName')}
          </label>
          <input id="profile-name" className="input" value={name} maxLength={60} required onChange={(e) => setName(e.target.value)} />
        </div>
        <fieldset>
          <legend className="mb-1 block text-sm font-medium">{t('settings.avatarColor')}</legend>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((swatch) => (
              <label key={swatch} className="cursor-pointer">
                <input
                  type="radio"
                  name="avatar-color"
                  value={swatch}
                  checked={color === swatch}
                  onChange={() => setColor(swatch)}
                  className="peer sr-only"
                />
                <span
                  className="flex size-9 items-center justify-center rounded-full ring-offset-2 ring-offset-card peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                  style={{ backgroundColor: swatch }}
                >
                  {color === swatch && <Check aria-hidden className="size-4 text-white" />}
                  <span className="sr-only">{swatch}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div>
        <label htmlFor="profile-bio" className="mb-1 block text-sm font-medium">
          {t('settings.bio')}
        </label>
        <textarea id="profile-bio" className="input min-h-20" value={bio} maxLength={280} onChange={(e) => setBio(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary">
          {t('settings.saveProfile')}
        </button>
        <span aria-live="polite" className="inline-flex items-center gap-1 text-sm text-live">
          {saved && (
            <>
              <Check aria-hidden className="size-4" />
              {t('settings.profileSaved')}
            </>
          )}
        </span>
      </div>
    </form>
  );
}

export function SettingsSection() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);
  const user = useAppSelector(selectUser);
  const router = useRouter();

  const onReset = () => {
    if (!window.confirm(t('settings.confirmReset'))) return;
    clearPersistedState();
    // Re-hydrate with defaults, exactly like a first visit.
    dispatch(
      hydrateFromStorage({
        preferences: { ...initialPreferences, theme: systemTheme() },
        favorites: [],
        feedOrder: [],
        user: null,
      }),
    );
    router.push('/');
  };

  return (
    <section>
      <PageHeader icon={Settings} title={t('settings.title')} description={t('settings.subtitle')} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title={t('settings.categoriesTitle')} description={t('settings.categoriesHelp')}>
          <div role="group" aria-label={t('settings.categoriesTitle')} className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const selected = preferences.categories.includes(category);
              const isLast = selected && preferences.categories.length === 1;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  aria-disabled={isLast || undefined}
                  onClick={() => dispatch(toggleCategory(category))}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-muted',
                    isLast && 'cursor-not-allowed',
                  )}
                >
                  {selected && <Check aria-hidden className="size-4" />}
                  {t(`categories.${category}`)}
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title={t('settings.sourcesTitle')} description={t('settings.sourcesHelp')}>
          <div className="divide-y divide-border">
            {CONTENT_TYPES.map((type) => (
              <Switch
                key={type}
                label={t(`sources.${type}`)}
                checked={preferences.sources[type]}
                onChange={() => dispatch(toggleSource(type))}
              />
            ))}
          </div>
        </Panel>

        <Panel title={t('settings.appearanceTitle')}>
          <div className="divide-y divide-border">
            <Switch
              label={t('header.darkMode')}
              description={t('settings.darkModeHelp')}
              checked={preferences.theme === 'dark'}
              onChange={(checked) => dispatch(setTheme(checked ? 'dark' : 'light'))}
            />
            <div className="py-3">
              <LanguageSelect showLabel />
            </div>
            <Switch
              label={t('settings.liveTitle')}
              description={t('settings.liveHelp')}
              checked={preferences.liveUpdates}
              onChange={(checked) => dispatch(setLiveUpdates(checked))}
            />
          </div>
        </Panel>

        <Panel title={t('settings.profileTitle')}>
          {user ? (
            <ProfileForm key={user.email} user={user} />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{t('settings.profileSignedOut')}</p>
              <Link href="/login" className="btn-primary">
                <LogIn aria-hidden className="size-4" />
                {t('header.signIn')}
              </Link>
            </div>
          )}
        </Panel>

        <Panel title={t('settings.resetTitle')} description={t('settings.resetBody')}>
          <button type="button" className="btn-secondary text-danger" onClick={onReset}>
            {t('settings.resetButton')}
          </button>
        </Panel>
      </div>
    </section>
  );
}
