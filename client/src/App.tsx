import { ApolloProvider, useQuery } from '@apollo/client';
import React, { Suspense } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes } from 'react-router-dom';

import { client } from './apollo';
import AuthSuccess from './components/auth/AuthSuccess';
import EmailVerification from './components/auth/EmailVerification';
import ForgotPassword from './components/auth/ForgotPassword';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ResetPassword from './components/auth/ResetPassword';
import Signup from './components/auth/Signup';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { LeagueDetail, LeagueList } from './components/tennis';
import { ME_QUERY } from './graphql/User';
import { RootState, store } from './store';
import { setAuth } from './store/authSlice';


// Lazy load main components for better performance
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const GroupDetail = React.lazy(() => import('./components/groups/GroupDetail'));
const UserProfile = React.lazy(() => import('./components/profile/UserProfile'));
const EventsPage = React.lazy(() => import('./components/events/EventsPage'));

interface UserData {
  me: {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    phone?: string;
    photoUrl?: string;
    firstName?: string;
    lastName?: string;
  };
}

function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { data, loading } = useQuery<UserData>(ME_QUERY, { skip: !isAuthenticated || !!user });

  React.useEffect(() => {
    if (isAuthenticated && !user && data?.me) {
      const tokenStr = localStorage.getItem('token') || '';
      dispatch(setAuth({ user: data.me, token: tokenStr }));
    }
  }, [isAuthenticated, user, data, dispatch]);

  // Optionally show a loading spinner while fetching user
  if (isAuthenticated && !user && loading) {
    return <div>Loading user...</div>;
  }

  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <Provider store={store}>
          <AuthLoader>
            <div className="App">
              <ErrorBoundary>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
                            <Dashboard />
                          </Suspense>
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/group/:id"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner message="Loading group details..." />}>
                            <GroupDetail />
                          </Suspense>
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner message="Loading profile..." />}>
                            <UserProfile />
                          </Suspense>
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingSpinner message="Loading events..." />}>
                            <EventsPage />
                          </Suspense>
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tennis"
                    element={<Navigate to="/tennis/leagues" replace />} />
                  <Route
                    path="/tennis/leagues"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <LeagueList />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tennis/leagues/:id"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <LeagueDetail />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/auth-success" element={<AuthSuccess />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/email-verification" element={<EmailVerification />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ErrorBoundary>
            </div>
          </AuthLoader>
        </Provider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}

export default App;
