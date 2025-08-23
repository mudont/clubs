/**
 * Comprehensive tests for useLocalStorage custom hook
 */

import { act, renderHook } from '@testing-library/react';

import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock console methods to avoid noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns initial value when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('initial');
      expect(result.current[3]).toBe(false); // isLoading
    });

    it('returns stored value from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('stored-value'));

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

      expect(result.current[0]).toBe('stored-value');
    });

    it('returns null when no initial value provided and localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      expect(result.current[0]).toBeNull();
    });

    it('handles complex objects as initial values', () => {
      const complexObject = { id: 1, name: 'test', nested: { value: true } };
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key', complexObject));

      expect(result.current[0]).toEqual(complexObject);
    });
  });

  describe('Setting Values', () => {
    it('sets string value correctly', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify('new-value')
      );
    });

    it('sets object value correctly', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() =>
        useLocalStorage<{ id: number; name: string }>('test-key')
      );

      const testObject = { id: 1, name: 'test' };

      act(() => {
        result.current[1](testObject);
      });

      expect(result.current[0]).toEqual(testObject);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testObject));
    });

    it('sets array value correctly', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage<number[]>('test-key'));

      const testArray = [1, 2, 3];

      act(() => {
        result.current[1](testArray);
      });

      expect(result.current[0]).toEqual(testArray);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testArray));
    });

    it('handles null value by removing from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('existing-value'));

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[1](null);
      });

      expect(result.current[0]).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('updates loading state during set operation', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[1]('test-value');
      });

      // Loading should be false after operation completes
      expect(result.current[3]).toBe(false);
    });
  });

  describe('Removing Values', () => {
    it('removes value using removeValue function', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('existing-value'));

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[2](); // removeValue
      });

      expect(result.current[0]).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('handles remove when value is already null', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      expect(() => {
        act(() => {
          result.current[2](); // removeValue
        });
      }).not.toThrow();

      expect(result.current[0]).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage.getItem errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(console.warn).toHaveBeenCalledWith(
        'Error reading localStorage key "test-key":',
        expect.any(Error)
      );
    });

    it('handles localStorage.setItem errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage full');
      });

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[1]('test-value');
      });

      // Should still update state even if localStorage fails
      expect(result.current[0]).toBe('test-value');
      expect(console.error).toHaveBeenCalledWith(
        'Error setting localStorage key "test-key":',
        expect.any(Error)
      );
    });

    it('handles JSON.parse errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json{');

      const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));

      expect(result.current[0]).toBe('fallback');
      expect(console.warn).toHaveBeenCalled();
    });

    it('handles JSON.stringify errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      // Create circular reference that can't be stringified
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      act(() => {
        result.current[1](circularObj);
      });

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Storage Event Handling', () => {
    it('updates value when storage event is fired', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));

      const { result } = renderHook(() => useLocalStorage('test-key'));

      expect(result.current[0]).toBe('initial');

      // Simulate storage event from another tab
      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify('updated-from-another-tab'),
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe('updated-from-another-tab');
    });

    it('ignores storage events for different keys', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));

      const { result } = renderHook(() => useLocalStorage('test-key'));

      const initialValue = result.current[0];

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'different-key',
          newValue: JSON.stringify('should-not-update'),
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBe(initialValue);
    });

    it('handles storage event with null value', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: null,
        });
        window.dispatchEvent(storageEvent);
      });

      expect(result.current[0]).toBeNull();
    });

    it('handles storage event with invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        const storageEvent = new StorageEvent('storage', {
          key: 'test-key',
          newValue: 'invalid-json{',
        });
        window.dispatchEvent(storageEvent);
      });

      expect(console.warn).toHaveBeenCalled();
      // Value should remain unchanged on parse error
      expect(result.current[0]).toBe('initial');
    });
  });

  describe('Server-Side Rendering (SSR)', () => {
    it('handles SSR environment gracefully', () => {
      // Mock window as undefined (SSR environment)
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useLocalStorage('test-key', 'ssr-fallback'));

      expect(result.current[0]).toBe('ssr-fallback');

      // Restore window
      global.window = originalWindow;
    });

    it('does not access localStorage in SSR environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      mockLocalStorage.getItem.mockClear();

      renderHook(() => useLocalStorage('test-key', 'ssr-fallback'));

      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('Type Safety', () => {
    it('maintains type safety for string values', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('string-value'));

      const { result } = renderHook(() => useLocalStorage<string>('test-key'));

      expect(typeof result.current[0]).toBe('string');

      act(() => {
        result.current[1]('new-string');
      });

      expect(typeof result.current[0]).toBe('string');
    });

    it('maintains type safety for object values', () => {
      interface TestObject {
        id: number;
        name: string;
      }

      const testObj: TestObject = { id: 1, name: 'test' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testObj));

      const { result } = renderHook(() => useLocalStorage<TestObject>('test-key'));

      expect(result.current[0]).toEqual(testObj);

      act(() => {
        result.current[1]({ id: 2, name: 'updated' });
      });

      expect(result.current[0]?.id).toBe(2);
      expect(result.current[0]?.name).toBe('updated');
    });

    it('handles union types correctly', () => {
      type UnionType = string | number | null;

      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage<UnionType>('test-key'));

      act(() => {
        result.current[1]('string-value');
      });
      expect(result.current[0]).toBe('string-value');

      act(() => {
        result.current[1](42);
      });
      expect(result.current[0]).toBe(42);

      act(() => {
        result.current[1](null);
      });
      expect(result.current[0]).toBeNull();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));

      let renderCount = 0;
      const { result, rerender } = renderHook(() => {
        renderCount++;
        return useLocalStorage('test-key');
      });

      const initialRenderCount = renderCount;

      // Multiple rerenders should not increase render count significantly
      rerender();
      rerender();

      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });

    it('handles rapid value changes efficiently', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[1]('value1');
        result.current[1]('value2');
        result.current[1]('value3');
      });

      expect(result.current[0]).toBe('value3');
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Cleanup', () => {
    it('removes event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useLocalStorage('test-key'));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('does not update state after unmount', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result, unmount } = renderHook(() => useLocalStorage('test-key'));

      unmount();

      // Should not cause errors or warnings
      expect(() => {
        act(() => {
          const storageEvent = new StorageEvent('storage', {
            key: 'test-key',
            newValue: JSON.stringify('should-not-update'),
          });
          window.dispatchEvent(storageEvent);
        });
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string as value', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[1]('');
      });

      expect(result.current[0]).toBe('');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(''));
    });

    it('handles zero as value', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage<number>('test-key'));

      act(() => {
        result.current[1](0);
      });

      expect(result.current[0]).toBe(0);
    });

    it('handles false as value', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage<boolean>('test-key'));

      act(() => {
        result.current[1](false);
      });

      expect(result.current[0]).toBe(false);
    });

    it('handles very large objects', () => {
      const largeObject = {
        data: Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item-${i}` })),
      };

      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage('test-key'));

      act(() => {
        result.current[1](largeObject);
      });

      expect(result.current[0]).toEqual(largeObject);
    });
  });
});
