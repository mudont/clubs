import React from 'react';

import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...',
  fullScreen = false
}) => {
  const containerClass = fullScreen 
    ? 'loading-spinner-container full-screen' 
    : 'loading-spinner-container';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={`loading-spinner ${size}`}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        {message && (
          <div className="loading-message" aria-label={message}>
            {message}
          </div>
        )}
      </div>
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default React.memo(LoadingSpinner); 