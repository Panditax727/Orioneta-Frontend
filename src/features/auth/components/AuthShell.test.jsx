import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthShell from './AuthShell';

function renderShell(props = {}) {
  return render(
    <MemoryRouter>
      <AuthShell {...props}>
        <div data-testid="content">form content</div>
      </AuthShell>
    </MemoryRouter>
  );
}

describe('AuthShell', () => {
  it('renders children', () => {
    renderShell();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders eyebrow, title, and subtitle', () => {
    renderShell({ eyebrow: 'Welcome', title: 'Hello', subtitle: 'Sub' });
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });

  it('renders features when provided', () => {
    const features = [
      { icon: '🔵', title: 'Feature 1', description: 'Desc 1' },
      { icon: '🟢', title: 'Feature 2', description: 'Desc 2' },
    ];
    renderShell({ features });
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Desc 2')).toBeInTheDocument();
  });

  it('does not render features section when empty', () => {
    renderShell({ features: [] });
    expect(screen.queryByText('Feature 1')).not.toBeInTheDocument();
  });

  it('has privacy link', () => {
    renderShell();
    expect(screen.getByText('Privacidad y datos')).toBeInTheDocument();
  });

  it('renders Orioneta brand name', () => {
    renderShell();
    expect(screen.getAllByText('Orioneta').length).toBeGreaterThanOrEqual(1);
  });
});
