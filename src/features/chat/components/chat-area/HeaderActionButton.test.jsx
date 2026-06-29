import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeaderActionButton from './HeaderActionButton';

describe('HeaderActionButton', () => {
  it('renders children', () => {
    render(<HeaderActionButton><span data-testid="child">★</span></HeaderActionButton>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('sets title attribute', () => {
    render(<HeaderActionButton title="Settings" />);
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<HeaderActionButton onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies active styles when active', () => {
    const { container } = render(<HeaderActionButton active />);
    const button = container.querySelector('button');
    expect(button.style.background).toBe('rgb(124, 58, 237)');
    expect(button.style.color).toBe('white');
  });
});
