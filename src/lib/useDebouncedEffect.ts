'use client';

import { useEffect } from 'react';

/**
 * Käivitab effecti pärast 'delay' ms vaikust sõltuvustest.
 */
export function useDebouncedEffect(
  effect: () => void | (() => void),
  deps: any[],
  delay = 1200
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => {
      const cleanup = effect();
      if (typeof cleanup === 'function') {
        // tagasta cleanup, kui effect seda annab
      }
    }, delay);
    return () => clearTimeout(t);
  }, [...deps, delay]);
}
