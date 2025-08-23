import { screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';

import {
  createTestUser,
  fillForm,
  renderWithProviders,
  submitForm,
} from '../../../__tests__/utils/test-utils';
import { LOGIN_MUTATION } from '../../../graphql/User';
import LoginForm from '../LoginForm';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all required fields', () => {
    renderWithProviders(<LoginForm />);

    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const { user } = renderWithProviders(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username or email is required/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('validates email format when email is provided', async () => {
    const { user, container } = renderWithProviders(<LoginForm />);

    await fillForm(
      user,
      {
        username: 'invalid-email',
        password: 'password123',
      },
      container
    );

    await submitForm(user, container);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email or username/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const testUser = createTestUser();
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: {
            input: {
              username: testUser.email,
              password: 'password123',
            },
          },
        },
        result: {
          data: {
            login: {
              token: 'mock-jwt-token',
              user: testUser,
            },
          },
        },
      },
    ];

    const { user, container } = renderWithProviders(<LoginForm />, { mocks });

    await fillForm(
      user,
      {
        username: testUser.email,
        password: 'password123',
      },
      container
    );

    await submitForm(user, container);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login errors gracefully', async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: {
            input: {
              username: 'wrong@example.com',
              password: 'wrongpassword',
            },
          },
        },
        result: {
          errors: [new GraphQLError('Invalid credentials')],
        },
      },
    ];

    const { user, container } = renderWithProviders(<LoginForm />, { mocks });

    await fillForm(
      user,
      {
        username: 'wrong@example.com',
        password: 'wrongpassword',
      },
      container
    );

    await submitForm(user, container);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: {
            input: {
              username: 'test@example.com',
              password: 'password123',
            },
          },
        },
        delay: 1000, // Simulate slow network
        result: {
          data: {
            login: {
              token: 'mock-jwt-token',
              user: createTestUser(),
            },
          },
        },
      },
    ];

    const { user, container } = renderWithProviders(<LoginForm />, { mocks });

    await fillForm(
      user,
      {
        username: 'test@example.com',
        password: 'password123',
      },
      container
    );

    await submitForm(user, container);

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it('toggles password visibility', async () => {
    const { user } = renderWithProviders(<LoginForm />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  });

  it('handles keyboard navigation correctly', async () => {
    const { user } = renderWithProviders(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username or email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Tab through form elements
    await user.tab();
    expect(usernameInput).toHaveFocus();

    await user.tab();
    expect(passwordInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();
  });

  it('submits form on Enter key press', async () => {
    const testUser = createTestUser();
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: {
            input: {
              username: testUser.email,
              password: 'password123',
            },
          },
        },
        result: {
          data: {
            login: {
              token: 'mock-jwt-token',
              user: testUser,
            },
          },
        },
      },
    ];

    const { user, container } = renderWithProviders(<LoginForm />, { mocks });

    await fillForm(
      user,
      {
        username: testUser.email,
        password: 'password123',
      },
      container
    );

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, '{enter}');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('clears error messages when user starts typing', async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: {
            input: {
              username: 'wrong@example.com',
              password: 'wrongpassword',
            },
          },
        },
        result: {
          errors: [new GraphQLError('Invalid credentials')],
        },
      },
    ];

    const { user, container } = renderWithProviders(<LoginForm />, { mocks });

    // Submit form with wrong credentials
    await fillForm(
      user,
      {
        username: 'wrong@example.com',
        password: 'wrongpassword',
      },
      container
    );

    await submitForm(user, container);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Start typing in username field
    const usernameInput = screen.getByLabelText(/username or email/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'new');

    // Error should be cleared
    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<LoginForm />);

    const form = screen.getByRole('form');
    expect(form).toHaveAttribute('aria-label', 'Sign in to your account');

    const usernameInput = screen.getByLabelText(/username or email/i);
    expect(usernameInput).toHaveAttribute('aria-required', 'true');
    expect(usernameInput).toHaveAttribute('aria-describedby');

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('aria-required', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby');
  });

  it('updates Redux store on successful login', async () => {
    const testUser = createTestUser();
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: {
            input: {
              username: testUser.email,
              password: 'password123',
            },
          },
        },
        result: {
          data: {
            login: {
              token: 'mock-jwt-token',
              user: testUser,
            },
          },
        },
      },
    ];

    const { user, store, container } = renderWithProviders(<LoginForm />, { mocks });

    await fillForm(
      user,
      {
        username: testUser.email,
        password: 'password123',
      },
      container
    );

    await submitForm(user, container);

    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.user).toEqual(testUser);
    });

    await waitFor(() => {
      const state = store.getState();
      expect(state.auth.token).toBe('mock-jwt-token');
    });
  });
});
