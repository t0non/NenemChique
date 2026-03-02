'use client';

import { useMemo, DependencyList } from 'react';

/**
 * A specialized useMemo hook for Firebase objects (References, Queries).
 * Ensures that if the factory returns the same structural reference, 
 * React doesn't unnecessarily trigger re-renders or infinite loops in Firestore hooks.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
