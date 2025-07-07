import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

import { updateAuthToken } from '../../apollo';
import { setAuth } from '../../store/authSlice';

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

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  // Fetch user profile if token is present
  const { data } = useQuery(ME_QUERY, {
    skip: !token,
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      updateAuthToken(token);
      if (data?.me) {
        dispatch(setAuth({ user: data.me, token }));
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [token, data, dispatch, navigate]);

  return <div>Signing you in...</div>;
};

export default AuthSuccess; 