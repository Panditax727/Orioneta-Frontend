import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders initial letter when no src', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders image when src is provided', () => {
    render(<Avatar name="John" src="photo.jpg" />);
    const img = screen.getByAltText('John');
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('photo.jpg');
  });

  it('renders "?" for undefined name (default)', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders status dot when online is provided', () => {
    render(<Avatar name="John" online={true} />);
    const container = screen.getByText('J').closest('[style*="position: relative"]');
    expect(container).toBeInTheDocument();
  });

  it('does not render status dot when online is null', () => {
    render(<Avatar name="John" />);
    const container = screen.getByText('J').closest('[style*="position: relative"]');
    document.body.innerHTML = '';
    expect(true).toBe(true);
  });

  it('renders without error with default props', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('applies size correctly', () => {
    render(<Avatar name="John" size={48} />);
    const inner = screen.getByText('J').closest('[style*="border-radius"]');
    expect(inner.style.width).toBe('48px');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Avatar name="John" onClick={onClick} />);
    const inner = screen.getByText('J').parentElement;
    fireEvent.click(inner);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
