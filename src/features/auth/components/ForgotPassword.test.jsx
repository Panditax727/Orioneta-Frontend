import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

vi.mock('../../../services/authService', () => ({
  forgotPassword: vi.fn(),
}));

vi.mock('./AuthLayout', () => ({
  default: ({ children, variant }) => <div data-testid="auth-layout" data-variant={variant}>{children}</div>,
}));

import { forgotPassword } from '../../../services/authService';

function renderForgot() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders email input and submit button', () => {
    renderForgot();
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
    expect(screen.getByText('Enviar Código de Verificación')).toBeInTheDocument();
  });

  it('calls forgotPassword on submit', async () => {
    forgotPassword.mockResolvedValueOnce({ message: 'Código enviado' });
    const user = userEvent.setup();
    renderForgot();

    await user.type(screen.getByPlaceholderText('tu@correo.com'), 'test@test.com');
    await user.click(screen.getByText('Enviar Código de Verificación'));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('test@test.com');
    });
  });

  it('shows success message after submission', async () => {
    forgotPassword.mockResolvedValueOnce({ message: 'Código enviado correctamente' });
    const user = userEvent.setup();
    renderForgot();

    await user.type(screen.getByPlaceholderText('tu@correo.com'), 'test@test.com');
    await user.click(screen.getByText('Enviar Código de Verificación'));

    await waitFor(() => {
      expect(screen.getByText('Código enviado correctamente')).toBeInTheDocument();
    });
  });

  it('shows error message on failure', async () => {
    forgotPassword.mockRejectedValueOnce(new Error('Correo no encontrado'));
    const user = userEvent.setup();
    renderForgot();

    await user.type(screen.getByPlaceholderText('tu@correo.com'), 'test@test.com');
    await user.click(screen.getByText('Enviar Código de Verificación'));

    await waitFor(() => {
      expect(screen.getByText(/ocurri.*error/i)).toBeInTheDocument();
    });
  });

  it('has back to login button', () => {
    renderForgot();
    expect(screen.getByText('Volver al login')).toBeInTheDocument();
  });
});
