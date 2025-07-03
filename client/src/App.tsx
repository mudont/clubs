import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/Dashboard';
import ClubDetail from './components/clubs/ClubDetail';
import UserProfile from './components/profile/UserProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { setAuth } from './store/authSlice';
import { useQuery, ApolloProvider } from '@apollo/client';
import { client } from './apollo';
import { gql } from '@apollo/client';
import AuthSuccess from './components/auth/AuthSuccess';

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      emailVerified
      phone
      photoUrl
      firstName
      lastName
    }
  }
`;

function AuthLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);
  const { data, loading } = useQuery<any>(ME_QUERY, { skip: !isAuthenticated || !!user });

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
    <ApolloProvider client={client}>
      <Provider store={store}>
        <AuthLoader>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/club/:id"
                  element={
                    <ProtectedRoute>
                      <ClubDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/auth-success" element={<AuthSuccess />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </AuthLoader>
      </Provider>
    </ApolloProvider>
  );
}

export default App;
