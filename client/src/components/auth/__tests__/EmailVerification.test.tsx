import { screen, waitFor } from '@testing-library/react';

import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import EmailVerification from '../EmailVerification';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockSearchParams)],
}));

let mockSearchParams = '';

describe('EmailVerification Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSearchParams = '';
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Loading State', () => {
    it('shows loading state initially with token but no status', () => {
      mockSearchParams = 'token=valid-token';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/verifying your email address/i)).toBeInTheDocument();
      expect(screen.getByText(/email verification/i)).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('shows loading spinner during verification', () => {
      mockSearchParams = 'token=valid-token';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/verifying your email address/i)).toBeInTheDocument();
      // Note: The loading spinner would be tested with CSS classes
      const statusDiv = screen
        .getByText(/verifying your email address/i)
        .closest('.verification-status');
      expect(statusDiv).toHaveClass('verification-loading');
    });
  });

  describe('Success State', () => {
    it('shows success message when status is success', () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
      expect(screen.getByText(/redirecting to login in 5 seconds/i)).toBeInTheDocument();
    });

    it('shows countdown timer and decrements', async () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/redirecting to login in 5 seconds/i)).toBeInTheDocument();

      // Fast-forward 1 second
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText(/redirecting to login in 4 seconds/i)).toBeInTheDocument();
      });

      // Fast-forward another second
      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(screen.getByText(/redirecting to login in 3 seconds/i)).toBeInTheDocument();
      });
    });

    it('navigates to login after countdown completes', async () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      // Fast-forward 5 seconds to complete countdown
      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('provides immediate login link', () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      const loginLink = screen.getByRole('link', { name: /go to login now/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('applies success styling', () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      const statusDiv = screen
        .getByText(/email verified successfully/i)
        .closest('.verification-status');
      expect(statusDiv).toHaveClass('verification-success');
    });
  });

  describe('Error States', () => {
    it('shows error message when error parameter is present', () => {
      const errorMessage = 'Invalid verification token';
      mockSearchParams = `error=${encodeURIComponent(errorMessage)}`;

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('shows error when no token is provided', () => {
      mockSearchParams = '';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/invalid verification link/i)).toBeInTheDocument();
      expect(screen.getByText(/please check your email and try again/i)).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('shows error when token is present but no status', () => {
      mockSearchParams = 'token=some-token';

      renderWithProviders(<EmailVerification />);

      // Initially shows loading, then switches to error
      expect(screen.getByText(/invalid verification link/i)).toBeInTheDocument();
    });

    it('decodes URL-encoded error messages', () => {
      const errorMessage = 'Token expired or invalid';
      mockSearchParams = `error=${encodeURIComponent(errorMessage)}`;

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('provides error recovery options', () => {
      mockSearchParams = 'error=Token%20expired';

      renderWithProviders(<EmailVerification />);

      const signupLink = screen.getByRole('link', { name: /try signing up again/i });
      const loginLink = screen.getByRole('link', { name: /go to login/i });

      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute('href', '/signup');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('applies error styling', () => {
      mockSearchParams = 'error=Some%20error';

      renderWithProviders(<EmailVerification />);

      const statusDiv = screen.getByText(/some error/i).closest('.verification-status');
      expect(statusDiv).toHaveClass('verification-error');
    });
  });

  describe('URL Parameter Handling', () => {
    it('handles multiple URL parameters correctly', () => {
      mockSearchParams = 'status=success&token=abc123&other=value';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
    });

    it('prioritizes error parameter over status', () => {
      mockSearchParams = 'status=success&error=Something%20went%20wrong';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText(/email verified successfully/i)).not.toBeInTheDocument();
    });

    it('handles empty parameter values', () => {
      mockSearchParams = 'token=&status=';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/invalid verification link/i)).toBeInTheDocument();
    });

    it('handles special characters in error messages', () => {
      const errorMessage = 'Error: Token "abc123" is invalid & expired!';
      mockSearchParams = `error=${encodeURIComponent(errorMessage)}`;

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    it('uses React Router navigation correctly', async () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
    });

    it('provides correct link destinations', () => {
      mockSearchParams = 'error=Test%20error';

      renderWithProviders(<EmailVerification />);

      const signupLink = screen.getByRole('link', { name: /try signing up again/i });
      const loginLink = screen.getByRole('link', { name: /go to login/i });

      expect(signupLink.getAttribute('href')).toBe('/signup');
      expect(loginLink.getAttribute('href')).toBe('/login');
    });
  });

  describe('Timer Management', () => {
    it('cleans up timer on component unmount', () => {
      mockSearchParams = 'status=success';

      const { unmount } = renderWithProviders(<EmailVerification />);

      // Verify timer is running
      expect(screen.getByText(/redirecting to login in 5 seconds/i)).toBeInTheDocument();

      // Unmount component
      unmount();

      // Advance timers - should not cause navigation since component is unmounted
      jest.advanceTimersByTime(5000);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not start timer for error states', () => {
      mockSearchParams = 'error=Test%20error';

      renderWithProviders(<EmailVerification />);

      jest.advanceTimersByTime(10000);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not start timer for loading states', () => {
      mockSearchParams = 'token=abc123';

      renderWithProviders(<EmailVerification />);

      jest.advanceTimersByTime(10000);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      const heading = screen.getByRole('heading', { name: /email verification/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('provides meaningful status messages', () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/redirecting to login in \d+ seconds/i)).toBeInTheDocument();
    });

    it('has accessible links with descriptive text', () => {
      mockSearchParams = 'error=Test%20error';

      renderWithProviders(<EmailVerification />);

      const signupLink = screen.getByRole('link', { name: /try signing up again/i });
      const loginLink = screen.getByRole('link', { name: /go to login/i });

      expect(signupLink).toHaveAccessibleName();
      expect(loginLink).toHaveAccessibleName();
    });

    it('uses semantic HTML elements', () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      // Check for proper use of paragraph elements for messages
      const successMessage = screen.getByText(/email verified successfully/i);
      expect(successMessage.tagName).toBe('P');
      expect(successMessage).toHaveClass('success-message');
    });
  });

  describe('Visual States', () => {
    it('displays correct icons for each state', () => {
      // Test loading state
      mockSearchParams = 'token=abc123';
      const { rerender } = renderWithProviders(<EmailVerification />);
      expect(screen.getByText('⏳')).toBeInTheDocument();

      // Test success state
      mockSearchParams = 'status=success';
      rerender(<EmailVerification />);
      expect(screen.getByText('✅')).toBeInTheDocument();

      // Test error state
      mockSearchParams = 'error=Test%20error';
      rerender(<EmailVerification />);
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('applies correct CSS classes for styling', () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      const statusDiv = screen.getByText(/email verification/i).closest('.verification-status');
      expect(statusDiv).toHaveClass('verification-success');
    });
  });

  describe('User Experience', () => {
    it('provides clear feedback for all states', () => {
      // Success state
      mockSearchParams = 'status=success';
      const { rerender } = renderWithProviders(<EmailVerification />);
      expect(screen.getByText(/email verified successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/redirecting to login/i)).toBeInTheDocument();

      // Error state
      mockSearchParams = 'error=Verification%20failed';
      rerender(<EmailVerification />);
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /try signing up again/i })).toBeInTheDocument();

      // Loading state
      mockSearchParams = 'token=abc123';
      rerender(<EmailVerification />);
      expect(screen.getByText(/verifying your email address/i)).toBeInTheDocument();
    });

    it('provides multiple action options in error state', () => {
      mockSearchParams = 'error=Token%20expired';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByRole('link', { name: /try signing up again/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /go to login/i })).toBeInTheDocument();
    });

    it('shows countdown for better user experience', async () => {
      mockSearchParams = 'status=success';

      renderWithProviders(<EmailVerification />);

      expect(screen.getByText(/redirecting to login in 5 seconds/i)).toBeInTheDocument();

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByText(/redirecting to login in 3 seconds/i)).toBeInTheDocument();
      });
    });
  });
});
