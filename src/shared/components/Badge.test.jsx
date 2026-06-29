import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from './Badge';

describe('Badge', () => {
  it('returns null when count is 0', () => {
    const { container } = render(<Badge count={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when count is null', () => {
    const { container } = render(<Badge count={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the count number', () => {
    render(<Badge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders max+ format when count exceeds max', () => {
    render(<Badge count={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders custom max format', () => {
    render(<Badge count={150} max={50} />);
    expect(screen.getByText('50+')).toBeInTheDocument();
  });

  it('renders with success variant', () => {
    render(<Badge count={3} variant="success" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders with error variant', () => {
    render(<Badge count={3} variant="error" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders with sm size', () => {
    render(<Badge count={3} size="sm" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders with lg size', () => {
    render(<Badge count={3} size="lg" />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
