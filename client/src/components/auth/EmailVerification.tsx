import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import './Auth.css';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const token = searchParams.get('token');
    const status = searchParams.get('status');
    const error = searchParams.get('error');

    console.log('EmailVerification component received:', { token: token ? 'present' : 'missing', status, error });

    if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
      return;
    }

    if (status === 'success') {
      setStatus('success');
      setMessage('Email verified successfully! You can now log in.');

      // Start countdown to redirect to login
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    // If we have a token but no status, assume it's a direct link
    // The backend should have redirected us with status, so this is likely an error
    setStatus('error');
    setMessage('Invalid verification link. Please check your email and try again.');
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'loading':
        return 'verification-loading';
      case 'success':
        return 'verification-success';
      case 'error':
        return 'verification-error';
      default:
        return 'verification-loading';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className={`verification-status ${getStatusClass()}`}>
          <div className="status-icon">{getStatusIcon()}</div>
          <h1>Email Verification</h1>

          {status === 'loading' && (
            <div className="verification-content">
              <p>Verifying your email address...</p>
              <div className="loading-spinner"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="verification-content">
              <p className="success-message">{message}</p>
              <p className="redirect-message">
                Redirecting to login in {countdown} seconds...
              </p>
              <div className="verification-actions">
                <Link to="/login" className="btn-primary">
                  Go to Login Now
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="verification-content">
              <p className="error-message">{message}</p>
              <div className="verification-actions">
                <Link to="/signup" className="btn-primary">
                  Try Signing Up Again
                </Link>
                <Link to="/login" className="btn-secondary">
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
