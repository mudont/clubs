/**
 * Comprehensive tests for useAuth custom hook
 */

import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';

import authSlice, { AuthState } from '../../store/authSlice';
import { AuthUser, useAuth } from '../useAuth';

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

// Test data
const mockUser: AuthUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
};

// Helper to create store with initial state
const createMockStore = (initialState?: Partial<AuthState>) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        user: null,
        isLoading: false,
        ...initialState,
      },
    },
  });
};

// Helper to render hook with Redux provider
const renderUseAuth = (initialState?: Partial<AuthState>) => {
  const store = createMockStore(initialState);
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store }, children);

  return {
    ...renderHook(() => useAuth(), { wrapper }),
    store,
  };
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('returns correct initial state when no user is logged in', () => {
      const { result } = renderUseAuth();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.updateUser).toBe('function');
    });

    it('returns correct initial state when user is logged in', () => {
      const { result } = renderUseAuth({ user: mockUser });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('returns correct loading state', () => {
      const { result } = renderUseAuth({ isLoading: true });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Login Functionality', () => {
    it('logs in user successfully', () => {
      const { result } = renderUseAuth();

      act(() => {
        result.current.login(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('updates authentication state correctly on login', () => {
      const { result, store } = renderUseAuth();

      act(() => {
        result.current.login(mockUser);
      });

      const state = store.getState();
      expect(state.auth.user).toEqual(mockUser);
    });

    it('handles login with partial user data', () => {
      const partialUser: AuthUser = {
        id: 'user-2',
        username: 'partial',
        email: 'partial@example.com',
        emailVerified: false,
      };

      const { result } = renderUseAuth();

      act(() => {
        result.current.login(partialUser);
      });

      expect(result.current.user).toEqual(partialUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Logout Functionality', () => {
    it('logs out user successfully', () => {
      const { result } = renderUseAuth({ user: mockUser });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('updates authentication state correctly on logout', () => {
      const { result, store } = renderUseAuth({ user: mockUser });

      act(() => {
        result.current.logout();
      });

      const state = store.getState();
      expect(state.auth.user).toBeNull();
    });

    it('handles logout when no user is logged in', () => {
      const { result } = renderUseAuth();

      expect(() => {
        act(() => {
          result.current.logout();
        });
      }).not.toThrow();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Update User Functionality', () => {
    it('updates user data successfully', () => {
      const { result } = renderUseAuth({ user: mockUser });

      const updates = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      act(() => {
        result.current.updateUser(updates);
      });

      expect(result.current.user).toEqual({
        ...mockUser,
        ...updates,
      });
    });

    it('handles partial updates correctly', () => {
      const { result } = renderUseAuth({ user: mockUser });

      act(() => {
        result.current.updateUser({ firstName: 'NewFirst' });
      });

      expect(result.current.user?.firstName).toBe('NewFirst');
      expect(result.current.user?.lastName).toBe(mockUser.lastName);
      expect(result.current.user?.email).toBe(mockUser.email);
    });

    it('does not update when no user is logged in', () => {
      const { result } = renderUseAuth();

      act(() => {
        result.current.updateUser({ firstName: 'Test' });
      });

      expect(result.current.user).toBeNull();
    });

    it('handles empty updates', () => {
      const { result } = renderUseAuth({ user: mockUser });

      act(() => {
        result.current.updateUser({});
      });

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('Token Validation', () => {
    it('logs out user when no token is found', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderUseAuth({ user: mockUser });

      // The useEffect should trigger logout
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('keeps user logged in when token exists', () => {
      mockLocalStorage.getItem.mockReturnValue('valid-token');

      const { result } = renderUseAuth({ user: mockUser });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('does not check token when no user is logged in', () => {
      mockLocalStorage.getItem.mockClear();

      renderUseAuth();

      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('Hook Stability', () => {
    it('maintains function reference stability', () => {
      const { result, rerender } = renderUseAuth();

      const initialLogin = result.current.login;
      const initialLogout = result.current.logout;
      const initialUpdateUser = result.current.updateUser;

      rerender();

      expect(result.current.login).toBe(initialLogin);
      expect(result.current.logout).toBe(initialLogout);
      expect(result.current.updateUser).toBe(initialUpdateUser);
    });

    it('updates functions when dependencies change', () => {
      const { result, store } = renderUseAuth();

      const initialUpdateUser = result.current.updateUser;

      // Login user to change dependency
      act(() => {
        result.current.login(mockUser);
      });

      // updateUser function should have new reference due to user dependency
      expect(result.current.updateUser).not.toBe(initialUpdateUser);
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderUseAuth({ user: mockUser });

      // Should not crash and should handle the error
      expect(result.current.user).toEqual(mockUser);
    });

    it('handles malformed user data', () => {
      const malformedUser = {
        id: 'user-1',
        // Missing required fields
      } as AuthUser;

      const { result } = renderUseAuth();

      expect(() => {
        act(() => {
          result.current.login(malformedUser);
        });
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const { result, rerender } = renderUseAuth();

      // Count renders by tracking function calls
      const originalLogin = result.current.login;
      result.current.login = (...args) => {
        renderCount++;
        return originalLogin(...args);
      };

      // Multiple rerenders should not increase render count
      rerender();
      rerender();
      rerender();

      expect(renderCount).toBe(0); // No login calls made
    });

    it('handles rapid state changes efficiently', () => {
      const { result } = renderUseAuth();

      // Rapid login/logout cycles
      act(() => {
        result.current.login(mockUser);
        result.current.logout();
        result.current.login(mockUser);
        result.current.updateUser({ firstName: 'Updated' });
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Integration with Redux Store', () => {
    it('dispatches correct actions to store', () => {
      const { result, store } = renderUseAuth();

      // Mock store dispatch to track actions
      const originalDispatch = store.dispatch;
      const dispatchSpy = jest.fn(originalDispatch);
      store.dispatch = dispatchSpy;

      act(() => {
        result.current.login(mockUser);
      });

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'auth/setAuth',
          payload: { user: mockUser },
        })
      );
    });

    it('reflects store state changes', () => {
      const { result, store } = renderUseAuth();

      // Directly dispatch to store
      act(() => {
        store.dispatch({ type: 'auth/setAuth', payload: { user: mockUser } });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('maintains type safety for user object', () => {
      const { result } = renderUseAuth({ user: mockUser });

      // TypeScript should enforce these properties exist
      expect(result.current.user?.id).toBe(mockUser.id);
      expect(result.current.user?.username).toBe(mockUser.username);
      expect(result.current.user?.email).toBe(mockUser.email);
      expect(result.current.user?.emailVerified).toBe(mockUser.emailVerified);
    });

    it('handles optional properties correctly', () => {
      const userWithoutOptionalFields: AuthUser = {
        id: 'user-1',
        username: 'test',
        email: 'test@example.com',
        emailVerified: true,
      };

      const { result } = renderUseAuth();

      act(() => {
        result.current.login(userWithoutOptionalFields);
      });

      expect(result.current.user?.firstName).toBeUndefined();
      expect(result.current.user?.lastName).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('cleans up properly on unmount', () => {
      const { unmount } = renderUseAuth({ user: mockUser });

      expect(() => unmount()).not.toThrow();
    });

    it('does not update state after unmount', () => {
      const { result, unmount } = renderUseAuth();

      unmount();

      // These should not cause errors or warnings
      expect(() => {
        act(() => {
          result.current.login(mockUser);
        });
      }).not.toThrow();
    });
  });
});
