/**
 * Custom hook for localStorage management with type safety
 */

import { useCallback, useEffect, useState } from 'react';

export type UseLocalStorageReturn<T> = [T | null, (value: T | null) => void, () => void, boolean];

/**
 * Custom hook for managing localStorage with type safety and error handling
 */
export const useLocalStorage = <T>(key: string, initialValue?: T): UseLocalStorageReturn<T> => {
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue || null;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue || null;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue || null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const setValue = useCallback(
    (value: T | null) => {
      try {
        setIsLoading(true);
        setStoredValue(value);

        if (typeof window !== 'undefined') {
          if (value === null) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    setValue(null);
  }, [setValue]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue, isLoading];
};
