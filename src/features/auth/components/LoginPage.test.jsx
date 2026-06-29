import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

vi.mock('../../../services/authService', () => ({
  login: vi.fn(),
  getOAuthProviders: vi.fn(() => Promise.resolve([])),
  mergeOAuthProviders: vi.fn((p) => p || [{ id: 'google', label: 'Google', authorizationUrl: '/oauth2/google', enabled: true }]),
  redirectToOAuth: vi.fn(),
  DEFAULT_OAUTH_PROVIDERS: [{ id: 'google', label: 'Google', authorizationUrl: '/oauth2/authorization/google', enabled: true }],
}));

vi.mock('../../../services/userService', () => ({
  ensureCurrentUserProfile: vi.fn(),
}));

vi.mock('../session', () => ({
  saveSession: vi.fn(),
}));

vi.mock('./AuthShell', () => ({
  default: ({ children }) => <div data-testid="auth-shell">{children}</div>,
}));

import { login } from '../../../services/authService';
import { ensureCurrentUserProfile } from '../../../services/userService';

function renderLogin() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('usuario@orioneta.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu contrasena')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesion')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Iniciar sesion'));
    expect(screen.getByText('El correo es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contrasena es requerida')).toBeInTheDocument();
  });

  it('calls login on valid form submission', async () => {
    login.mockResolvedValueOnce({ accessToken: 'token123' });
    ensureCurrentUserProfile.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('usuario@orioneta.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Tu contrasena'), 'password123');
    await user.click(screen.getByText('Iniciar sesion'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('shows api error on login failure', async () => {
    login.mockRejectedValueOnce(new Error('Credenciales invalidas'));
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByPlaceholderText('usuario@orioneta.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Tu contrasena'), 'password123');
    await user.click(screen.getByText('Iniciar sesion'));

    await waitFor(() => {
      expect(screen.getByText('Credenciales invalidas')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Tu contrasena');
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByLabelText('Ver contrasena');
    await user.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    const hideBtn = screen.getByLabelText('Ocultar contrasena');
    await user.click(hideBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('clears errors when typing', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByText('Iniciar sesion'));
    expect(screen.getByText('El correo es requerido')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('usuario@orioneta.com'), 'a');
    expect(screen.queryByText('El correo es requerido')).not.toBeInTheDocument();
  });

  it('has link to forgot-password', () => {
    renderLogin();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
  });

  it('has link to register', () => {
    renderLogin();
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
  });

  it('renders OAuth provider buttons', () => {
    renderLogin();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });
});
