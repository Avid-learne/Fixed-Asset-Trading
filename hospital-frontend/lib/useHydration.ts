// hospital-frontend/lib/useHydration.ts
import { useEffect, useState } from 'react';

/**
 * Hook to ensure a component only renders after hydration on the client
 * Prevents hydration mismatch errors when using localStorage or browser APIs
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
