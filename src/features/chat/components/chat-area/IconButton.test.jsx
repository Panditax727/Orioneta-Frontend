import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from './IconButton';

describe('IconButton', () => {
  it('renders children', () => {
    render(<IconButton><span data-testid="icon">X</span></IconButton>);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('sets title attribute', () => {
    render(<IconButton title="Close" />);
    expect(screen.getByTitle('Close')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
