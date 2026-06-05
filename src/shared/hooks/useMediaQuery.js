import { useState, useEffect } from "react";
import { breakpoints } from "../theme";

// Hook para detectar media queries
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Hooks predefinidos para breakpoints comunes
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
}

export function useIsTablet() {
  return useMediaQuery(
    `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
  );
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
}

export function useBreakpoint() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  if (isDesktop) return "desktop";
  return "mobile";
}
