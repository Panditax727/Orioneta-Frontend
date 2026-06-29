import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import VerifyCode from './VerifyCode';

vi.mock('../../../services/authService', () => ({
  verifyResetCode: vi.fn(),
  forgotPassword: vi.fn(),
}));

vi.mock('./AuthLayout', () => ({
  default: ({ children, variant, heroEmail }) => <div data-testid="auth-layout" data-variant={variant} data-email={heroEmail}>{children}</div>,
}));

import { verifyResetCode, forgotPassword } from '../../../services/authService';

function renderVerify(initialState = { email: 'test@test.com' }) {
  window.history.pushState({}, '', '/verify-code');
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/verify-code', state: initialState }]}>
      <VerifyCode />
    </MemoryRouter>
  );
}

describe('VerifyCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 6 digit input fields', () => {
    renderVerify();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('disables submit when digits are not filled', () => {
    renderVerify();
    const submitBtn = screen.getByText('Verificar Código');
    expect(submitBtn).toBeDisabled();
  });

  it('calls verifyResetCode when all digits are filled', async () => {
    verifyResetCode.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderVerify();

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], String(i + 1));
    }

    await user.click(screen.getByText('Verificar Código'));

    await waitFor(() => {
      expect(verifyResetCode).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });

  it('shows success message after verification', async () => {
    verifyResetCode.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderVerify();

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], String(i + 1));
    }

    await user.click(screen.getByText('Verificar Código'));

    await waitFor(() => {
      expect(screen.getByText('Código verificado correctamente')).toBeInTheDocument();
    });
  });

  it('shows error on invalid code', async () => {
    verifyResetCode.mockRejectedValueOnce(new Error('Código inválido'));
    const user = userEvent.setup();
    renderVerify();

    const inputs = screen.getAllByRole('textbox');
    for (let i = 0; i < 6; i++) {
      await user.type(inputs[i], String(i + 1));
    }

    await user.click(screen.getByText('Verificar Código'));

    await waitFor(() => {
      expect(screen.getByText(/c.digo inv.lido|expirado/i)).toBeInTheDocument();
    });
  });

  it('has resend code button', async () => {
    forgotPassword.mockResolvedValueOnce({});
    const user = userEvent.setup();
    renderVerify();
    
    await user.click(screen.getByText('Reenviar código'));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith('test@test.com');
    });
  });

  it('has back button', () => {
    renderVerify();
    expect(screen.getByText('Volver')).toBeInTheDocument();
  });
});
