import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('redirects to /login when no session', () => {
    sessionStorage.clear();
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route path="*" element={<ProtectedRoute><div>protected</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('shows content when session exists', () => {
    localStorage.setItem('orioneta.auth.session', JSON.stringify({
      accessToken: 'valid-token',
      expiresAt: Date.now() + 10000,
    }));
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route path="*" element={<ProtectedRoute><div>protected content</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('protected content')).toBeInTheDocument();
    localStorage.removeItem('orioneta.auth.session');
  });
});
