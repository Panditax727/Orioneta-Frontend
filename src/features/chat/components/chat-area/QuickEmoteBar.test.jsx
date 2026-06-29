import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuickEmoteBar from './QuickEmoteBar';

describe('QuickEmoteBar', () => {
  it('renders quick emote buttons', () => {
    render(<QuickEmoteBar accent="#7c3aed" onSelect={() => {}} />);
    expect(screen.getByText('✨')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('dale')).toBeInTheDocument();
  });

  it('calls onSelect with emote when button clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<QuickEmoteBar accent="#7c3aed" onSelect={onSelect} />);
    await user.click(screen.getByText('🔥'));
    expect(onSelect).toHaveBeenCalledWith('🔥');
  });
});
