import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
  it('renders with default size', () => {
    const { container } = render(<Loader />);
    const div = container.firstChild;
    expect(div.style.width).toBe('24px');
    expect(div.style.height).toBe('24px');
  });

  it('renders with custom size', () => {
    const { container } = render(<Loader size={48} />);
    const div = container.firstChild;
    expect(div.style.width).toBe('48px');
    expect(div.style.height).toBe('48px');
  });

  it('applies spinner animation style', () => {
    const { container } = render(<Loader />);
    const div = container.firstChild;
    expect(div.style.animation).toContain('spin');
  });
});
