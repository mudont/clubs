/**
 * Comprehensive tests for useFetch custom hook
 */

import { act, renderHook } from '@testing-library/react';

import { useFetch } from '../useFetch';

// Mock fetch function
const createMockFetch = <T>(data: T, delay = 0, shouldError = false) => {
  return jest.fn(
    () =>
      new Promise<T>((resolve, reject) => {
        setTimeout(() => {
          if (shouldError) {
            reject(new Error('Fetch error'));
          } else {
            resolve(data);
          }
        }, delay);
      })
  );
};

describe('useFetch Hook', () => {
  describe('Basic Functionality', () => {
    it('returns initial state correctly', () => {
      const mockFetch = createMockFetch('test-data');
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    it('executes fetch immediately by default', async () => {
      const mockFetch = createMockFetch('test-data');
      const { result } = renderHook(() => useFetch(mockFetch));

      expect(result.current.loading).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toBe('test-data');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('does not execute immediately when immediate is false', () => {
      const mockFetch = createMockFetch('test-data');
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      expect(result.current.loading).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('executes fetch manually when execute is called', async () => {
      const mockFetch = createMockFetch('test-data');
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('test-data');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('sets loading to true during fetch', async () => {
      const mockFetch = createMockFetch('test-data', 100);
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('test-data');
    });

    it('maintains loading state correctly for multiple concurrent requests', async () => {
      const mockFetch = createMockFetch('test-data', 50);
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      // Start multiple requests
      act(() => {
        result.current.execute();
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 60));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('test-data');
    });
  });

  describe('Error Handling', () => {
    it('handles fetch errors correctly', async () => {
      const mockFetch = createMockFetch('test-data', 0, true);
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Fetch error');
    });

    it('clears error on successful retry', async () => {
      let shouldError = true;
      const mockFetch = jest.fn(() => {
        if (shouldError) {
          return Promise.reject(new Error('Fetch error'));
        }
        return Promise.resolve('success-data');
      });

      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      // First call fails
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeInstanceOf(Error);

      // Second call succeeds
      shouldError = false;
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBe('success-data');
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('handles non-Error objects as errors', async () => {
      const mockFetch = jest.fn(() => Promise.reject('String error'));
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Unknown error');
    });
  });

  describe('Callback Options', () => {
    it('calls onSuccess callback when fetch succeeds', async () => {
      const onSuccess = jest.fn();
      const mockFetch = createMockFetch('test-data');

      renderHook(() => useFetch(mockFetch, { onSuccess }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(onSuccess).toHaveBeenCalledWith('test-data');
    });

    it('calls onError callback when fetch fails', async () => {
      const onError = jest.fn();
      const mockFetch = createMockFetch('test-data', 0, true);

      renderHook(() => useFetch(mockFetch, { onError }));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('does not call callbacks after component unmount', async () => {
      const onSuccess = jest.fn();
      const onError = jest.fn();
      const mockFetch = createMockFetch('test-data', 100);

      const { unmount } = renderHook(() => useFetch(mockFetch, { onSuccess, onError }));

      unmount();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Request Cancellation', () => {
    it('cancels previous request when new request is made', async () => {
      let requestCount = 0;
      const mockFetch = jest.fn(() => {
        requestCount++;
        return new Promise(resolve => {
          setTimeout(() => resolve(`data-${requestCount}`), 100);
        });
      });

      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      // Start first request
      act(() => {
        result.current.execute();
      });

      // Start second request before first completes
      act(() => {
        result.current.execute();
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Should only have data from the second request
      expect(result.current.data).toBe('data-2');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('handles AbortError correctly', async () => {
      const mockFetch = jest.fn(() => {
        const error = new Error('Request aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      await act(async () => {
        await result.current.execute();
      });

      // AbortError should not set error state
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    it('resets state to initial values', async () => {
      const mockFetch = createMockFetch('test-data');
      const { result } = renderHook(() => useFetch(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toBe('test-data');

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('cancels ongoing request when reset is called', async () => {
      const mockFetch = createMockFetch('test-data', 100);
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.loading).toBe(false);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('maintains type safety for string data', async () => {
      const mockFetch = createMockFetch('string-data');
      const { result } = renderHook(() => useFetch<string>(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(typeof result.current.data).toBe('string');
      expect(result.current.data).toBe('string-data');
    });

    it('maintains type safety for object data', async () => {
      interface TestData {
        id: number;
        name: string;
      }

      const testData: TestData = { id: 1, name: 'test' };
      const mockFetch = createMockFetch(testData);
      const { result } = renderHook(() => useFetch<TestData>(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toEqual(testData);
      expect(result.current.data?.id).toBe(1);
      expect(result.current.data?.name).toBe('test');
    });

    it('maintains type safety for array data', async () => {
      const arrayData = [1, 2, 3, 4, 5];
      const mockFetch = createMockFetch(arrayData);
      const { result } = renderHook(() => useFetch<number[]>(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data).toEqual(arrayData);
    });
  });

  describe('Edge Cases', () => {
    it('handles null data correctly', async () => {
      const mockFetch = createMockFetch(null);
      const { result } = renderHook(() => useFetch(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('handles undefined data correctly', async () => {
      const mockFetch = createMockFetch(undefined);
      const { result } = renderHook(() => useFetch(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('handles empty string data correctly', async () => {
      const mockFetch = createMockFetch('');
      const { result } = renderHook(() => useFetch(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('handles zero as data correctly', async () => {
      const mockFetch = createMockFetch(0);
      const { result } = renderHook(() => useFetch(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('handles false as data correctly', async () => {
      const mockFetch = createMockFetch(false);
      const { result } = renderHook(() => useFetch(mockFetch));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.data).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', async () => {
      let renderCount = 0;
      const mockFetch = createMockFetch('test-data');

      const { result, rerender } = renderHook(() => {
        renderCount++;
        return useFetch(mockFetch, { immediate: false });
      });

      const initialRenderCount = renderCount;

      // Multiple rerenders should not increase render count significantly
      rerender();
      rerender();

      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);

      // Execute should not cause excessive renders
      await act(async () => {
        await result.current.execute();
      });

      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(4);
    });

    it('handles rapid execute calls efficiently', async () => {
      const mockFetch = createMockFetch('test-data', 10);
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      // Rapid execute calls
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.execute();
        }
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      expect(result.current.data).toBe('test-data');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('cleans up properly on unmount', async () => {
      const mockFetch = createMockFetch('test-data', 100);
      const { result, unmount } = renderHook(() => useFetch(mockFetch));

      expect(result.current.loading).toBe(true);

      unmount();

      // Should not cause errors or warnings
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });
    });

    it('does not update state after unmount', async () => {
      const onSuccess = jest.fn();
      const mockFetch = createMockFetch('test-data', 100);
      const { unmount } = renderHook(() => useFetch(mockFetch, { onSuccess }));

      unmount();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Integration Scenarios', () => {
    it('works correctly with async/await pattern', async () => {
      const mockFetch = createMockFetch('async-data');
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      let executionResult: void;
      await act(async () => {
        executionResult = await result.current.execute();
      });

      expect(executionResult).toBeUndefined(); // execute returns void
      expect(result.current.data).toBe('async-data');
    });

    it('handles promise rejection in execute', async () => {
      const mockFetch = createMockFetch('test-data', 0, true);
      const { result } = renderHook(() => useFetch(mockFetch, { immediate: false }));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.data).toBeNull();
    });

    it('works with real-world API simulation', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const mockApiCall = jest.fn((): Promise<User[]> => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve([
              { id: 1, name: 'John Doe', email: 'john@example.com' },
              { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
            ]);
          }, 50);
        });
      });

      const { result } = renderHook(() => useFetch<User[]>(mockApiCall));

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 60));
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].name).toBe('John Doe');
      expect(result.current.error).toBeNull();
    });
  });
});
