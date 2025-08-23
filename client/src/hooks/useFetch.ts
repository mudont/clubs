/**
 * Custom hook for data fetching with loading and error states
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseFetchOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseFetchReturn<T> extends UseFetchState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for data fetching with loading and error states
 */
export const useFetch = <T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
): UseFetchReturn<T> => {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();

      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        onSuccess?.(data);
      }
    } catch (error) {
      if (isMountedRef.current && error instanceof Error && error.name !== 'AbortError') {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        setState(prev => ({ ...prev, loading: false, error: errorObj }));
        onError?.(errorObj);
      }
    }
  }, [fetchFn, onSuccess, onError]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
};
