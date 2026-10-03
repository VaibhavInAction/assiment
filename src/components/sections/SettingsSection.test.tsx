import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithStore } from '@/test/render';
import { SettingsSection } from './SettingsSection';

describe('SettingsSection', () => {
  it('toggles favorite topics', async () => {
    const { user, store } = renderWithStore(<SettingsSection />, { persisted: { preferences: { categories: ['technology'] } } });

    await user.click(screen.getByRole('button', { name: 'Science' }));
    expect(store.getState().preferences.categories).toEqual(['technology', 'science']);
    expect(screen.getByRole('button', { name: 'Science' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps at least one topic selected', async () => {
    const { user, store } = renderWithStore(<SettingsSection />, { persisted: { preferences: { categories: ['sports'] } } });
    const sports = screen.getByRole('button', { name: 'Sports' });

    expect(sports).toHaveAttribute('aria-disabled', 'true');
    await user.click(sports);
    expect(store.getState().preferences.categories).toEqual(['sports']);
  });

  it('switches content sources, dark mode and live updates', async () => {
    const { user, store } = renderWithStore(<SettingsSection />);

    await user.click(screen.getByRole('switch', { name: 'Social posts' }));
    await user.click(screen.getByRole('switch', { name: 'Dark mode' }));
    await user.click(screen.getByRole('switch', { name: 'Real-time updates' }));

    const { preferences } = store.getState();
    expect(preferences.sources.social).toBe(false);
    expect(preferences.theme).toBe('dark');
    expect(preferences.liveUpdates).toBe(false);
  });

  it('changes the interface language', async () => {
    const { user, store } = renderWithStore(<SettingsSection />);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'es');
    expect(store.getState().preferences.language).toBe('es');
  });

  it('asks signed-out users to sign in to edit their profile', () => {
    renderWithStore(<SettingsSection />);
    expect(screen.getByText('Sign in to personalize your profile.')).toBeInTheDocument();
  });

  it('lets signed-in users edit their profile', async () => {
    const { user, store } = renderWithStore(<SettingsSection />, {
      persisted: { user: { name: 'Ana', email: 'ana@example.com', bio: '', avatarColor: '#4338ca' } },
    });

    const name = screen.getByRole('textbox', { name: 'Display name' });
    await user.clear(name);
    await user.type(name, 'Ana Lima');
    await user.type(screen.getByRole('textbox', { name: 'Bio' }), 'Frontend developer');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(store.getState().auth.user).toMatchObject({ name: 'Ana Lima', bio: 'Frontend developer' });
    expect(screen.getByText('Profile saved')).toBeInTheDocument();
  });
});
