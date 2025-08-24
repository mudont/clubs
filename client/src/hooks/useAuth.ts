/**
 * Custom hook for authentication state management
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../store';
import { logout, setAuth, setLoading } from '../store/authSlice';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

/**
 * Custom hook for managing authentication state
 */
export const useAuth = (): UseAuthReturn => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    (userData: AuthUser, token?: string) => {
      const authToken = token || localStorage.getItem('authToken') || '';
      dispatch(setAuth({ user: userData, token: authToken }));
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const updateUser = useCallback(
    (updates: Partial<AuthUser>) => {
      if (user) {
        const token = localStorage.getItem('authToken') || '';
        dispatch(setAuth({ user: { ...user, ...updates }, token }));
      }
    },
    [dispatch, user]
  );

  const setLoadingState = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch]
  );

  // Auto-logout on token expiration (example)
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        handleLogout();
      }
    }
  }, [user, handleLogout]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    logout: handleLogout,
    updateUser,
  };
};
