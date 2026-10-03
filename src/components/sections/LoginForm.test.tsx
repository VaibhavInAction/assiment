import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockRouter } from '@/test/navigation';
import { renderWithStore } from '@/test/render';
import { LoginForm, nameFromEmail, validateCredentials } from './LoginForm';

describe('validateCredentials', () => {
  it('flags each invalid field', () => {
    expect(validateCredentials({ name: '', email: 'nope', password: '123' }, 'signup')).toEqual({
      name: true,
      email: true,
      password: true,
    });
    expect(validateCredentials({ name: '', email: 'a@b.co', password: '123456' }, 'signin')).toEqual({});
  });

  it('derives a display name from an email', () => {
    expect(nameFromEmail('jane.doe@example.com')).toBe('Jane Doe');
  });
});

describe('LoginForm (mock authentication)', () => {
  it('shows accessible errors and focuses the first invalid field', async () => {
    const { user, store } = renderWithStore(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    const email = screen.getByLabelText('Email');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Please enter a valid email address.');
    expect(email).toHaveFocus();
    expect(store.getState().auth.user).toBeNull();
  });

  it('signs in with valid credentials and returns to the dashboard', async () => {
    const { user, store } = renderWithStore(<LoginForm />);
    await user.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(store.getState().auth.user).toMatchObject({ name: 'Jane Doe', email: 'jane.doe@example.com' });
    expect(JSON.stringify(store.getState())).not.toContain('secret123');
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('creates an account with a chosen name', async () => {
    const { user, store } = renderWithStore(<LoginForm />);
    await user.click(screen.getByRole('button', { name: /create an account/i }));
    await user.type(screen.getByLabelText('Name'), 'Ravi');
    await user.type(screen.getByLabelText('Email'), 'ravi@example.com');
    await user.type(screen.getByLabelText('Password'), 'longpassword');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(store.getState().auth.user?.name).toBe('Ravi');
  });

  it('offers a one-click demo account', async () => {
    const { user, store } = renderWithStore(<LoginForm />);
    await user.click(screen.getByRole('button', { name: 'Continue with demo account' }));
    expect(store.getState().auth.user?.name).toBe('Demo User');
  });
});
