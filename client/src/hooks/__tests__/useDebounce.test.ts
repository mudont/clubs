/**
 * Comprehensive tests for useDebounce custom hooks
 */

import { act, renderHook } from '@testing-library/react';

import { useDebounce, useDebouncedCallback } from '../useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce Hook', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Basic Functionality', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));

      expect(result.current).toBe('initial');
    });

    it('debounces value changes', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 },
      });

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated', delay: 500 });

      // Should still be initial value before delay
      expect(result.current).toBe('initial');

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should now be updated value
      expect(result.current).toBe('updated');
    });

    it('cancels previous timeout on rapid changes', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 },
      });

      // Rapid changes
      rerender({ value: 'change1', delay: 500 });
      rerender({ value: 'change2', delay: 500 });
      rerender({ value: 'final', delay: 500 });

      // Should still be initial
      expect(result.current).toBe('initial');

      // Advance time by less than delay
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Should still be initial
      expect(result.current).toBe('initial');

      // Complete the delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should be the final value
      expect(result.current).toBe('final');
    });

    it('handles different delay values', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 100 },
      });

      rerender({ value: 'updated', delay: 100 });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current).toBe('updated');
    });

    it('handles zero delay', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 0 },
      });

      rerender({ value: 'updated', delay: 0 });

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('Type Safety', () => {
    it('maintains type safety for string values', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce<string>(value, 500), {
        initialProps: { value: 'initial' },
      });

      expect(typeof result.current).toBe('string');

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(typeof result.current).toBe('string');
    });

    it('maintains type safety for number values', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce<number>(value, 500), {
        initialProps: { value: 42 },
      });

      expect(typeof result.current).toBe('number');

      rerender({ value: 100 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe(100);
    });

    it('maintains type safety for object values', () => {
      interface TestObject {
        id: number;
        name: string;
      }

      const initialObj: TestObject = { id: 1, name: 'initial' };
      const updatedObj: TestObject = { id: 2, name: 'updated' };

      const { result, rerender } = renderHook(({ value }) => useDebounce<TestObject>(value, 500), {
        initialProps: { value: initialObj },
      });

      expect(result.current).toEqual(initialObj);

      rerender({ value: updatedObj });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toEqual(updatedObj);
    });

    it('handles null and undefined values', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce<string | null>(value, 500),
        { initialProps: { value: 'initial' } }
      );

      rerender({ value: null });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles negative delay values', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: -100 },
      });

      rerender({ value: 'updated', delay: -100 });

      // Negative delay should still work (setTimeout handles it)
      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });

    it('handles very large delay values', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 1000000 },
      });

      rerender({ value: 'updated', delay: 1000000 });

      act(() => {
        jest.advanceTimersByTime(999999);
      });

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });

      expect(result.current).toBe('updated');
    });

    it('handles same value updates', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'same', delay: 500 },
      });

      rerender({ value: 'same', delay: 500 });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('same');
    });
  });

  describe('Performance', () => {
    it('cleans up timers properly', () => {
      const { unmount, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 },
      });

      rerender({ value: 'updated', delay: 500 });

      // Unmount before timer completes
      unmount();

      // Should not cause any errors
      act(() => {
        jest.advanceTimersByTime(500);
      });
    });

    it('handles rapid successive changes efficiently', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 },
      });

      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        rerender({ value: `value-${i}`, delay: 500 });
      }

      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(result.current).toBe('value-99');
    });
  });
});

describe('useDebouncedCallback Hook', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Basic Functionality', () => {
    it('returns debounced callback function', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

      expect(typeof result.current).toBe('function');
    });

    it('debounces callback execution', () => {
      const mockCallback = jest.fn();
      const { result, rerender } = renderHook(
        ({ callback, delay }) => useDebouncedCallback(callback, delay),
        { initialProps: { callback: mockCallback, delay: 500 } }
      );

      const initialCallback = result.current;

      // Change callback
      const newCallback = jest.fn();
      rerender({ callback: newCallback, delay: 500 });

      // Should still have initial callback before delay
      expect(result.current).toBe(initialCallback);

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should now have new callback
      expect(result.current).not.toBe(initialCallback);
    });

    it('handles callback with parameters', () => {
      const mockCallback = jest.fn((a: number, b: string) => `${a}-${b}`);
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

      const debouncedCallback = result.current;

      act(() => {
        jest.advanceTimersByTime(500);
      });

      const callResult = debouncedCallback(42, 'test');
      expect(callResult).toBe('42-test');
    });

    it('handles callback with return value', () => {
      const mockCallback = jest.fn(() => 'return-value');
      const { result } = renderHook(() => useDebouncedCallback(mockCallback, 500));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      const returnValue = result.current();
      expect(returnValue).toBe('return-value');
    });
  });

  describe('Dependencies', () => {
    it('updates callback when dependencies change', () => {
      let callCount = 0;
      const createCallback = () => jest.fn(() => ++callCount);

      const { result, rerender } = renderHook(
        ({ deps }) => {
          const callback = createCallback();
          return useDebouncedCallback(callback, 500, deps);
        },
        { initialProps: { deps: [1] } }
      );

      act(() => {
        jest.advanceTimersByTime(500);
      });

      const firstResult = result.current();
      expect(firstResult).toBe(1);

      // Change dependencies
      rerender({ deps: [2] });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      const secondResult = result.current();
      expect(secondResult).toBe(2);
    });

    it('does not update callback when dependencies are the same', () => {
      const mockCallback = jest.fn();
      const { result, rerender } = renderHook(
        ({ deps }) => useDebouncedCallback(mockCallback, 500, deps),
        { initialProps: { deps: [1, 'test'] } }
      );

      const initialCallback = result.current;

      // Rerender with same dependencies
      rerender({ deps: [1, 'test'] });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should be same callback reference
      expect(result.current).toBe(initialCallback);
    });

    it('handles empty dependencies array', () => {
      const mockCallback = jest.fn();
      const { result, rerender } = renderHook(
        ({ callback }) => useDebouncedCallback(callback, 500, []),
        { initialProps: { callback: mockCallback } }
      );

      const initialCallback = result.current;

      // Change callback but keep empty deps
      const newCallback = jest.fn();
      rerender({ callback: newCallback });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should still be initial callback due to empty deps
      expect(result.current).toBe(initialCallback);
    });
  });

  describe('Type Safety', () => {
    it('maintains callback signature', () => {
      const typedCallback = (a: number, b: string): string => `${a}-${b}`;
      const { result } = renderHook(() => useDebouncedCallback(typedCallback, 500));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // TypeScript should enforce correct parameters and return type
      const returnValue = result.current(42, 'test');
      expect(returnValue).toBe('42-test');
    });

    it('handles void return type', () => {
      const voidCallback = (value: string): void => {
        console.log(value);
      };
      const { result } = renderHook(() => useDebouncedCallback(voidCallback, 500));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(() => result.current('test')).not.toThrow();
    });

    it('handles async callbacks', () => {
      const asyncCallback = async (value: string): Promise<string> => {
        return Promise.resolve(`async-${value}`);
      };
      const { result } = renderHook(() => useDebouncedCallback(asyncCallback, 500));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      const promise = result.current('test');
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('Error Handling', () => {
    it('handles callback that throws errors', () => {
      const errorCallback = () => {
        throw new Error('Callback error');
      };
      const { result } = renderHook(() => useDebouncedCallback(errorCallback, 500));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(() => result.current()).toThrow('Callback error');
    });

    it('handles undefined callback gracefully', () => {
      const { result } = renderHook(() => useDebouncedCallback(undefined as any, 500));

      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(() => result.current()).toThrow();
    });
  });

  describe('Performance', () => {
    it('cleans up timers on unmount', () => {
      const mockCallback = jest.fn();
      const { unmount, rerender } = renderHook(
        ({ callback }) => useDebouncedCallback(callback, 500),
        { initialProps: { callback: mockCallback } }
      );

      const newCallback = jest.fn();
      rerender({ callback: newCallback });

      unmount();

      // Should not cause errors
      act(() => {
        jest.advanceTimersByTime(500);
      });
    });

    it('handles rapid callback changes efficiently', () => {
      let callbackCount = 0;
      const { result, rerender } = renderHook(() => {
        const callback = () => ++callbackCount;
        return useDebouncedCallback(callback, 500, [callbackCount]);
      });

      // Rapid changes
      for (let i = 0; i < 10; i++) {
        rerender();
      }

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should have final callback
      const finalResult = result.current();
      expect(finalResult).toBe(10);
    });
  });

  describe('Integration with useDebounce', () => {
    it('works together with useDebounce for complex scenarios', () => {
      const mockCallback = jest.fn();

      const { result, rerender } = renderHook(
        ({ searchTerm }) => {
          const debouncedSearchTerm = useDebounce(searchTerm, 300);
          const debouncedCallback = useDebouncedCallback(
            (term: string) => mockCallback(term),
            200,
            [debouncedSearchTerm]
          );

          return { debouncedSearchTerm, debouncedCallback };
        },
        { initialProps: { searchTerm: 'initial' } }
      );

      // Change search term
      rerender({ searchTerm: 'updated' });

      // Advance time for search term debounce
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.debouncedSearchTerm).toBe('updated');

      // Advance time for callback debounce
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Execute the debounced callback
      result.current.debouncedCallback('test');
      expect(mockCallback).toHaveBeenCalledWith('test');
    });
  });
});
