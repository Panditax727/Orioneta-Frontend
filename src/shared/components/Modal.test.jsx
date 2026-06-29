import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(<Modal isOpen={false} onClose={() => {}}>content</Modal>);
    expect(container.innerHTML).toBe('');
  });

  it('renders content when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={() => {}}>content</Modal>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="My Title">content</Modal>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders footer when provided', () => {
    render(<Modal isOpen={true} onClose={() => {}} footer={<button>Cancel</button>}>content</Modal>);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose}>content</Modal>);
    fireEvent.click(screen.getByText('content').closest('[style*="position: fixed"]'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking content', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose}>content</Modal>);
    fireEvent.click(screen.getByText('content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows close button by default', () => {
    render(<Modal isOpen={true} onClose={() => {}}>content</Modal>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(<Modal isOpen={true} onClose={onClose} title="Test">content</Modal>);
    const closeBtn = screen.getAllByRole('button').find(b => b.querySelector('svg'));
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal isOpen={true} onClose={() => {}} showCloseButton={false}>content</Modal>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('locks body scroll when open', () => {
    render(<Modal isOpen={true} onClose={() => {}}>content</Modal>);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll after closing', () => {
    const { rerender } = render(<Modal isOpen={true} onClose={() => {}}>content</Modal>);
    rerender(<Modal isOpen={false} onClose={() => {}}>content</Modal>);
    expect(document.body.style.overflow).toBe('unset');
  });
});
