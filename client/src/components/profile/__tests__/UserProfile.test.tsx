import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import {
  CHANGE_PASSWORD,
  DELETE_USER,
  GET_USER_PROFILE,
  UPDATE_PROFILE,
} from '../../../graphql/User';
import UserProfile from '../UserProfile';

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

const mockUser = {
  id: 'user1',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  bio: 'This is my bio',
  avatar: null,
  emailVerified: true,
  createdAt: '2023-01-01T00:00:00.000Z',
};

const mocks = [
  {
    request: {
      query: GET_USER_PROFILE,
    },
    result: {
      data: {
        me: mockUser,
      },
    },
  },
  {
    request: {
      query: UPDATE_PROFILE,
      variables: {
        input: {
          username: 'updateduser',
          firstName: 'Updated',
          lastName: 'User',
          bio: 'Updated bio',
        },
      },
    },
    result: {
      data: {
        updateProfile: {
          ...mockUser,
          username: 'updateduser',
          firstName: 'Updated',
          lastName: 'User',
          bio: 'Updated bio',
        },
      },
    },
  },
  {
    request: {
      query: CHANGE_PASSWORD,
      variables: {
        input: {
          currentPassword: 'currentpass',
          newPassword: 'newpassword123',
        },
      },
    },
    result: {
      data: {
        changePassword: {
          success: true,
        },
      },
    },
  },
  {
    request: {
      query: DELETE_USER,
      variables: {
        userId: 'user1',
      },
    },
    result: {
      data: {
        deleteUser: {
          success: true,
        },
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: GET_USER_PROFILE,
    },
    result: {
      data: {
        me: mockUser,
      },
    },
  },
  {
    request: {
      query: UPDATE_PROFILE,
      variables: {
        input: {
          username: 'updateduser',
          firstName: 'Updated',
          lastName: 'User',
          bio: 'Updated bio',
        },
      },
    },
    error: new Error('Update failed'),
  },
  {
    request: {
      query: CHANGE_PASSWORD,
      variables: {
        input: {
          currentPassword: 'wrongpass',
          newPassword: 'newpassword123',
        },
      },
    },
    error: new Error('Current password is incorrect'),
  },
];

describe('UserProfile', () => {
  beforeEach(() => {
    mockConfirm.mockClear();
    mockLocation.href = '';
  });

  it('renders loading state initially', () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders profile information when loaded', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('This is my bio')).toBeInTheDocument();
    expect(screen.getByText('✓ Verified')).toBeInTheDocument();
  });

  it('displays avatar placeholder when no avatar', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of firstName in avatar placeholder
    });
  });

  it('shows unverified status when email is not verified', async () => {
    const unverifiedUser = { ...mockUser, emailVerified: false };
    const unverifiedMocks = [
      {
        request: {
          query: GET_USER_PROFILE,
        },
        result: {
          data: {
            me: unverifiedUser,
          },
        },
      },
    ];

    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={unverifiedMocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: {
            user: unverifiedUser,
            isAuthenticated: true,
            token: 'mock-token',
            loading: false,
          },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('⚠ Unverified')).toBeInTheDocument();
    });
  });

  it('displays default values for empty fields', async () => {
    const emptyUser = {
      ...mockUser,
      firstName: null,
      lastName: null,
      bio: null,
    };
    const emptyMocks = [
      {
        request: {
          query: GET_USER_PROFILE,
        },
        result: {
          data: {
            me: emptyUser,
          },
        },
      },
    ];

    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={emptyMocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: emptyUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getAllByText('Not set')).toHaveLength(2); // First name and last name
    });

    expect(screen.getByText('No bio yet')).toBeInTheDocument();
  });

  it('enters edit mode when Edit Profile is clicked', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is my bio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('cancels edit mode when Cancel is clicked', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByRole('button', { name: 'Cancel' });
    const formCancelButton = cancelButtons.find(button => button.type === 'button');
    fireEvent.click(formCancelButton!);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('testuser')).not.toBeInTheDocument();
    });

    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('updates profile when form is submitted', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });

    const usernameInput = screen.getByDisplayValue('testuser');
    const firstNameInput = screen.getByDisplayValue('Test');
    const lastNameInput = screen.getByDisplayValue('User');
    const bioInput = screen.getByDisplayValue('This is my bio');

    fireEvent.change(usernameInput, { target: { value: 'updateduser' } });
    fireEvent.change(firstNameInput, { target: { value: 'Updated' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('shows change password form when Change Password is clicked', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByText('Password must contain:')).toBeInTheDocument();
  });

  it('validates password confirmation', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });

    const passwordForm = currentPasswordInput.closest('form') as HTMLFormElement;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });
  });

  it('validates password length', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'short' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });

    const passwordForm = currentPasswordInput.closest('form') as HTMLFormElement;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(
        screen.getByText('New password must be at least 8 characters long')
      ).toBeInTheDocument();
    });
  });

  it('changes password successfully', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'currentpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

    const passwordForm = currentPasswordInput.closest('form') as HTMLFormElement;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
    });
  });

  it('shows confirmation dialog for account deletion', async () => {
    mockConfirm.mockReturnValue(false);

    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Account');
    fireEvent.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure you want to delete your account?')
    );
  });

  it('deletes account when confirmed', async () => {
    mockConfirm.mockReturnValue(true);

    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Delete Account')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete Account');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByText('Account deleted successfully. You will be logged out.')
      ).toBeInTheDocument();
    });
  });

  it('handles update profile error', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    });

    const usernameInput = screen.getByDisplayValue('testuser');
    const firstNameInput = screen.getByDisplayValue('Test');
    const lastNameInput = screen.getByDisplayValue('User');
    const bioInput = screen.getByDisplayValue('This is my bio');

    fireEvent.change(usernameInput, { target: { value: 'updateduser' } });
    fireEvent.change(firstNameInput, { target: { value: 'Updated' } });
    fireEvent.change(lastNameInput, { target: { value: 'User' } });
    fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });

  it('handles change password error', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Current Password');
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

    fireEvent.change(currentPasswordInput, { target: { value: 'wrongpass' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });

    const passwordForm = currentPasswordInput.closest('form') as HTMLFormElement;
    fireEvent.submit(passwordForm);

    await waitFor(() => {
      expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
    });
  });

  it('formats member since date correctly', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      // Use a more flexible date matcher since toLocaleDateString() varies by locale
      const expectedDate = new Date('2023-01-01T00:00:00.000Z').toLocaleDateString();
      expect(screen.getByText(expectedDate)).toBeInTheDocument();
    });
  });

  it('has proper form validation attributes', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <UserProfile />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true, token: 'mock-token', loading: false },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Profile');
    fireEvent.click(editButton);

    await waitFor(() => {
      const usernameInput = screen.getByLabelText('Username');
      expect(usernameInput).toHaveAttribute('required');
    });

    const changePasswordButton = screen.getByText('Change Password');
    fireEvent.click(changePasswordButton);

    await waitFor(() => {
      const newPasswordInput = screen.getByLabelText('New Password');
      expect(newPasswordInput).toHaveAttribute('minLength', '8');
    });

    const newPasswordInput = screen.getByLabelText('New Password');
    expect(newPasswordInput).toHaveAttribute('required');
  });
});
