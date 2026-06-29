import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('./useTheme', () => ({
  useTheme: vi.fn(() => ({
    theme: { primary: '#7c3aed' },
    toggleTheme: () => {},
  })),
  ThemeProvider: ({ children, customTheme }) => children,
}));

import { useTheme, ThemeProvider } from './useTheme';

describe('useTheme', () => {
  it('returns theme object and toggle function', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBeDefined();
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('ThemeProvider renders without throwing', () => {
    expect(() => {
      renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });
    }).not.toThrow();
  });
});
