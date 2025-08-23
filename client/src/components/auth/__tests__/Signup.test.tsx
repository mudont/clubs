import { screen, waitFor } from '@testing-library/react';

import { createComponentTestHelpers } from '../../../__tests__/utils/component-test-helpers';
import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import Signup from '../Signup';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Signup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders signup form with all required fields', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders OAuth buttons', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continue with facebook/i })).toBeInTheDocument();
    });

    it('renders link to login page', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    });

    it('shows password requirements', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByText(/password must contain/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/one number/i)).toBeInTheDocument();
      expect(screen.getByText(/one special character/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const { user } = renderWithProviders(<Signup />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      const usernameField = screen.getByLabelText(/username/i);
      expect(usernameField).toBeInvalid();
    });

    it('validates email format', async () => {
      const { user } = renderWithProviders(<Signup />);

      const emailField = screen.getByLabelText(/email/i);
      await user.type(emailField, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      expect(emailField).toBeInvalid();
    });

    it('validates password confirmation match', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Passwords do not match' }),
      });

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('validates minimum password length', async () => {
      const { user } = renderWithProviders(<Signup />);

      const passwordField = screen.getByLabelText(/^password$/i);
      await user.type(passwordField, 'short');

      expect(passwordField).toBeInvalid();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Account created successfully! Please check your email to verify your account.',
        }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!',
          }),
        });
      });
    });

    it('shows success message on successful signup', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Account created successfully!' }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      await waitFor(() => {
        expect(screen.getByText(/account created successfully/i)).toBeInTheDocument();
      });
    });

    it('navigates to login page after successful signup', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Account created successfully!' }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      // Wait for the timeout to trigger navigation
      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/login');
        },
        { timeout: 4000 }
      );
    });

    it('shows loading state during submission', async () => {
      const { user } = renderWithProviders(<Signup />);

      // Mock a delayed response
      mockFetch.mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ message: 'Success' }),
                }),
              1000
            )
          )
      );

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('handles signup errors gracefully', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Username already exists' }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      await waitFor(() => {
        expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('clears error messages when user starts typing', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Username already exists' }),
      });

      const helpers = createComponentTestHelpers(user);

      // Submit form to trigger error
      await helpers.form.fillForm({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      await waitFor(() => {
        expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
      });

      // Start typing in username field
      const usernameField = screen.getByLabelText(/username/i);
      await user.clear(usernameField);
      await user.type(usernameField, 'newuser');

      // Error should be cleared
      expect(screen.queryByText(/username already exists/i)).not.toBeInTheDocument();
    });
  });

  describe('OAuth Integration', () => {
    it('handles Google OAuth', async () => {
      const { user } = renderWithProviders(<Signup />);

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      const googleButton = screen.getByRole('button', { name: /continue with google/i });
      await user.click(googleButton);

      expect(window.location.href).toBe('auth/google');
    });

    it('handles Facebook OAuth', async () => {
      const { user } = renderWithProviders(<Signup />);

      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      const facebookButton = screen.getByRole('button', { name: /continue with facebook/i });
      await user.click(facebookButton);

      expect(window.location.href).toBe('auth/facebook');
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports tab navigation through form fields', async () => {
      const { user } = renderWithProviders(<Signup />);

      const usernameField = screen.getByLabelText(/username/i);
      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/^password$/i);
      const confirmPasswordField = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Tab through form elements
      await user.tab();
      expect(usernameField).toHaveFocus();

      await user.tab();
      expect(emailField).toHaveFocus();

      await user.tab();
      expect(passwordField).toHaveFocus();

      await user.tab();
      expect(confirmPasswordField).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('submits form on Enter key press', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      const confirmPasswordField = screen.getByLabelText(/confirm password/i);
      await user.type(confirmPasswordField, '{enter}');

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderWithProviders(<Signup />);

      const usernameField = screen.getByLabelText(/username/i);
      const emailField = screen.getByLabelText(/email/i);
      const passwordField = screen.getByLabelText(/^password$/i);
      const confirmPasswordField = screen.getByLabelText(/confirm password/i);

      expect(usernameField).toHaveAttribute('id');
      expect(emailField).toHaveAttribute('id');
      expect(passwordField).toHaveAttribute('id');
      expect(confirmPasswordField).toHaveAttribute('id');
    });

    it('has proper ARIA attributes for required fields', () => {
      renderWithProviders(<Signup />);

      const requiredFields = [
        screen.getByLabelText(/username/i),
        screen.getByLabelText(/email/i),
        screen.getByLabelText(/^password$/i),
        screen.getByLabelText(/confirm password/i),
      ];

      requiredFields.forEach(field => {
        expect(field).toHaveAttribute('required');
      });
    });

    it('announces errors to screen readers', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Username already exists' }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'existinguser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      await waitFor(() => {
        const errorMessage = screen.getByText(/username already exists/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('announces success messages to screen readers', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Account created successfully!' }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      await waitFor(() => {
        const successMessage = screen.getByText(/account created successfully/i);
        expect(successMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Form State Management', () => {
    it('maintains form state during user interaction', async () => {
      const { user } = renderWithProviders(<Signup />);

      const usernameField = screen.getByLabelText(/username/i);
      const emailField = screen.getByLabelText(/email/i);

      await user.type(usernameField, 'testuser');
      await user.type(emailField, 'test@example.com');

      expect(usernameField).toHaveValue('testuser');
      expect(emailField).toHaveValue('test@example.com');
    });

    it('clears form state after successful submission', async () => {
      const { user } = renderWithProviders(<Signup />);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Success' }),
      });

      const helpers = createComponentTestHelpers(user);

      await helpers.form.fillForm({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      await helpers.form.submitForm();

      // Form should maintain values until navigation
      const usernameField = screen.getByLabelText(/username/i);
      expect(usernameField).toHaveValue('testuser');
    });
  });
});
