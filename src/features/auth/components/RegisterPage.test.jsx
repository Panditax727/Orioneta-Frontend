import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';

vi.mock('../../../services/authService', () => ({
  register: vi.fn(),
  getOAuthProviders: vi.fn(() => Promise.resolve([])),
  mergeOAuthProviders: vi.fn((p) => p || [{ id: 'google', label: 'Google', enabled: true }]),
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

import { register } from '../../../services/authService';
import { ensureCurrentUserProfile } from '../../../services/userService';

function renderRegister() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders registration form', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('panditax')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('usuario@orioneta.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimo 8 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderRegister();
    await user.click(screen.getByText('Crear cuenta'));
    expect(screen.getByText('El nombre visible es requerido')).toBeInTheDocument();
    expect(screen.getByText('El correo es requerido')).toBeInTheDocument();
    expect(screen.getByText('La contrasena es requerida')).toBeInTheDocument();
  });

  it('calls register on valid form submission', async () => {
    register.mockResolvedValueOnce({ accessToken: 'token123' });
    ensureCurrentUserProfile.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('panditax'), 'Test User');
    await user.type(screen.getByPlaceholderText('usuario@orioneta.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Minimo 8 caracteres'), 'password123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        displayName: 'Test User',
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('shows api error on registration failure', async () => {
    register.mockRejectedValueOnce(new Error('El correo ya esta registrado'));
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('panditax'), 'Test User');
    await user.type(screen.getByPlaceholderText('usuario@orioneta.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Minimo 8 caracteres'), 'password123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Crear cuenta'));

    await waitFor(() => {
      expect(screen.getByText('El correo ya esta registrado')).toBeInTheDocument();
    });
  });

  it('requires privacy acceptance', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByPlaceholderText('panditax'), 'Test User');
    await user.type(screen.getByPlaceholderText('usuario@orioneta.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('Minimo 8 caracteres'), 'password123');
    await user.click(screen.getByText('Crear cuenta'));

    expect(screen.getByText('Debes aceptar el acuerdo para crear tu cuenta')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderRegister();
    const passwordInput = screen.getByPlaceholderText('Minimo 8 caracteres');
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByLabelText('Ver contrasena');
    await user.click(toggleBtn);
    expect(passwordInput.type).toBe('text');
  });

  it('renders OAuth provider buttons', () => {
    renderRegister();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });

  it('has link to login', () => {
    renderRegister();
    expect(screen.getByText('Inicia sesion')).toBeInTheDocument();
  });
});
