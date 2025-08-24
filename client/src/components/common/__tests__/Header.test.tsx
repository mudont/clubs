import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import Header from '../Header';

// Mock react-router-dom
jest.mock('react-router-dom');

// Get the mock navigate function
const { mockNavigate } = jest.requireMock('react-router-dom');

describe('Header', () => {
  const defaultProps = {
    title: 'Test Page',
  };

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders header with title', () => {
    renderWithProviders(<Header {...defaultProps} />, {
      preloadedState: {
        auth: { user: mockUser, isAuthenticated: true, token: 'test-token', loading: false },
      },
    });

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Page' })).toBeInTheDocument();
  });

  it('displays user information when authenticated', () => {
    renderWithProviders(<Header {...defaultProps} />, {
      preloadedState: {
        auth: { user: mockUser, isAuthenticated: true, token: 'test-token', loading: false },
      },
    });

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    renderWithProviders(<Header {...defaultProps} />, {
      preloadedState: {
        auth: { user: mockUser, isAuthenticated: true, token: 'test-token', loading: false },
      },
    });

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
