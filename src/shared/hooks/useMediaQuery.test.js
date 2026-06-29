import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useBreakpoint } from './useMediaQuery';

function createMatchMediaMock(matches) {
  return (query) => ({
    matches,
    query,
    addEventListener: vi.fn((_, handler) => {}),
    removeEventListener: vi.fn(),
  });
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    window.matchMedia = createMatchMediaMock(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 0px)'));
    expect(result.current).toBe(false);
  });

  it('returns true when query matches', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 1px)'));
    expect(result.current).toBe(true);
  });

  it('registers and cleans up event listener', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    window.matchMedia = (query) => ({
      matches: false,
      query,
      addEventListener,
      removeEventListener,
    });

    const { unmount } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useIsMobile', () => {
  it('returns true when viewport is mobile size', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false when viewport is not mobile size', () => {
    window.matchMedia = createMatchMediaMock(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe('useIsDesktop', () => {
  it('returns true when viewport is desktop size', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});

describe('useIsTablet', () => {
  it('returns true when viewport is tablet size', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });
});

describe('useBreakpoint', () => {
  it('returns mobile when only mobile matches', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('mobile');
  });

  it('returns desktop when desktop query matches', () => {
    let callCount = 0;
    window.matchMedia = () => {
      callCount++;
      return { matches: callCount === 3, addEventListener: vi.fn(), removeEventListener: vi.fn() };
    };
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toBe('desktop');
  });
});
