import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Check your email</h1>
          <p>If an account with that email exists, a password reset link has been sent.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        <p>Enter your email address to receive a password reset link.</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="btn-primary">Send Reset Link</button>
        </form>
        <div className="auth-footer">
          <button className="btn-oauth" onClick={() => navigate('/login')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 