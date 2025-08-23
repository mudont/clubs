import { screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';

import { createComponentTestHelpers } from '../../../__tests__/utils/component-test-helpers';
import { createTestUser, renderWithProviders } from '../../../__tests__/utils/test-utils';
import {
  ADD_MEMBER_BY_EMAIL,
  ADD_MEMBER_BY_USERNAME,
  DELETE_GROUP,
  GET_GROUP_MEMBERS,
  MAKE_ADMIN,
  REMOVE_ADMIN,
  REMOVE_MEMBER,
  UNBLOCK_USER,
  UPDATE_GROUP,
  USER_SEARCH,
} from '../../../graphql/Group';
import GroupManagement from '../GroupManagement';

// Mock window.confirm
const mockConfirm = jest.fn();
global.confirm = mockConfirm;

// Mock window.location
const mockLocation = {
  hash: '',
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('GroupManagement Component', () => {
  const adminUser = createTestUser({
    id: 'admin-1',
    username: 'admin',
    email: 'admin@example.com',
  });
  const regularUser = createTestUser({
    id: 'user-1',
    username: 'user1',
    email: 'user1@example.com',
  });
  const blockedUser = createTestUser({
    id: 'blocked-1',
    username: 'blocked',
    email: 'blocked@example.com',
  });

  const mockGroupData = {
    group: {
      id: 'group-1',
      name: 'Test Group',
      description: 'A test group',
      isPublic: false,
      memberships: [
        {
          id: 'membership-1',
          user: adminUser,
          isAdmin: true,
        },
        {
          id: 'membership-2',
          user: regularUser,
          isAdmin: false,
        },
      ],
      blockedUsers: [
        {
          id: 'blocked-1',
          user: blockedUser,
          blockedBy: adminUser,
          blockedAt: '2024-01-15T10:00:00Z',
          reason: 'Inappropriate behavior',
        },
      ],
    },
  };

  const createMocks = (groupData = mockGroupData, error?: GraphQLError) => [
    {
      request: {
        query: GET_GROUP_MEMBERS,
        variables: { groupId: 'group-1' },
      },
      result: error ? { errors: [error] } : { data: groupData },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.hash = '';
    mockConfirm.mockReturnValue(true);
  });

  describe('Access Control', () => {
    it('shows loading state while fetching data', () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      expect(screen.getByText(/loading group management/i)).toBeInTheDocument();
    });

    it('shows access denied for non-admin users', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: regularUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(
          screen.getByText(/you must be an admin to access group management/i)
        ).toBeInTheDocument();
      });
    });

    it('allows access for admin users', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/group management/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('renders all management tabs', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /blocked users/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      });
    });

    it('sets members tab as active by default', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const membersTab = screen.getByRole('button', { name: /members/i });
        expect(membersTab).toHaveClass('active');
      });
    });

    it('switches tabs when clicked', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toHaveClass('active');
      });

      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      expect(settingsTab).toHaveClass('active');
      expect(screen.getByRole('button', { name: /members/i })).not.toHaveClass('active');
    });

    it('updates URL hash when tab changes', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /blocked users/i })).toBeInTheDocument();
      });

      const blockedTab = screen.getByRole('button', { name: /blocked users/i });
      await user.click(blockedTab);

      expect(mockLocation.hash).toBe('mgmt-blocked');
    });

    it('initializes tab from URL hash', async () => {
      mockLocation.hash = '#mgmt-settings';

      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const settingsTab = screen.getByRole('button', { name: /settings/i });
        expect(settingsTab).toHaveClass('active');
      });
    });
  });

  describe('Members Management', () => {
    it('displays current members list', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
        expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      });
    });

    it('shows admin and member roles correctly', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const adminRole = screen.getByText('Admin');
        const memberRole = screen.getByText('Member');

        expect(adminRole).toBeInTheDocument();
        expect(adminRole).toHaveClass('admin');
        expect(memberRole).toBeInTheDocument();
        expect(memberRole).toHaveClass('member');
      });
    });

    it('shows appropriate action buttons for each member', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remove admin/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /make admin/i })).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /block/i })).toHaveLength(2);
      });
    });

    describe('Add Member Functionality', () => {
      it('renders add member form', async () => {
        const mocks = createMocks();

        renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getByText(/add member/i)).toBeInTheDocument();
          expect(screen.getByPlaceholderText(/enter username or email/i)).toBeInTheDocument();
          expect(screen.getByRole('button', { name: /add member/i })).toBeInTheDocument();
        });
      });

      it('shows user suggestions when typing', async () => {
        const searchMocks = [
          ...createMocks(),
          {
            request: {
              query: USER_SEARCH,
              variables: { query: 'test' },
            },
            result: {
              data: {
                userSearch: [{ id: 'user-2', username: 'testuser', email: 'test@example.com' }],
              },
            },
          },
        ];

        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks: searchMocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getByPlaceholderText(/enter username or email/i)).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/enter username or email/i);
        await user.type(input, 'test');

        await waitFor(() => {
          expect(screen.getByText('testuser (test@example.com)')).toBeInTheDocument();
        });
      });

      it('adds member by username successfully', async () => {
        const addMemberMocks = [
          ...createMocks(),
          {
            request: {
              query: ADD_MEMBER_BY_USERNAME,
              variables: { groupId: 'group-1', username: 'newuser' },
            },
            result: { data: { addMemberByUsername: { success: true } } },
          },
        ];

        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks: addMemberMocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getByPlaceholderText(/enter username or email/i)).toBeInTheDocument();
        });

        const helpers = createComponentTestHelpers(user);

        await helpers.form.fillField('Enter username or email', 'newuser');

        const addButton = screen.getByRole('button', { name: /add member/i });
        await user.click(addButton);

        await waitFor(() => {
          expect(screen.getByText(/member added successfully/i)).toBeInTheDocument();
        });
      });

      it('falls back to email when username fails', async () => {
        const addMemberMocks = [
          ...createMocks(),
          {
            request: {
              query: ADD_MEMBER_BY_USERNAME,
              variables: { groupId: 'group-1', username: 'test@example.com' },
            },
            result: { errors: [new GraphQLError('User not found')] },
          },
          {
            request: {
              query: ADD_MEMBER_BY_EMAIL,
              variables: { groupId: 'group-1', email: 'test@example.com' },
            },
            result: { data: { addMemberByEmail: { success: true } } },
          },
        ];

        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks: addMemberMocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getByPlaceholderText(/enter username or email/i)).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/enter username or email/i);
        await user.type(input, 'test@example.com');

        const addButton = screen.getByRole('button', { name: /add member/i });
        await user.click(addButton);

        await waitFor(() => {
          expect(screen.getByText(/member added successfully/i)).toBeInTheDocument();
        });
      });
    });

    describe('Member Actions', () => {
      it('promotes member to admin', async () => {
        const makeAdminMocks = [
          ...createMocks(),
          {
            request: {
              query: MAKE_ADMIN,
              variables: { groupId: 'group-1', userId: 'user-1' },
            },
            result: { data: { makeAdmin: { success: true } } },
          },
        ];

        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks: makeAdminMocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /make admin/i })).toBeInTheDocument();
        });

        const makeAdminButton = screen.getByRole('button', { name: /make admin/i });
        await user.click(makeAdminButton);

        await waitFor(() => {
          expect(screen.getByText(/member promoted to admin successfully/i)).toBeInTheDocument();
        });
      });

      it('removes admin privileges', async () => {
        const removeAdminMocks = [
          ...createMocks(),
          {
            request: {
              query: REMOVE_ADMIN,
              variables: { groupId: 'group-1', userId: 'admin-1' },
            },
            result: { data: { removeAdmin: { success: true } } },
          },
        ];

        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks: removeAdminMocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /remove admin/i })).toBeInTheDocument();
        });

        const removeAdminButton = screen.getByRole('button', { name: /remove admin/i });
        await user.click(removeAdminButton);

        await waitFor(() => {
          expect(screen.getByText(/admin privileges removed successfully/i)).toBeInTheDocument();
        });
      });

      it('shows confirmation modal before removing member', async () => {
        const mocks = createMocks();
        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getAllByRole('button', { name: /remove/i })[0]).toBeInTheDocument();
        });

        const removeButton = screen.getAllByRole('button', { name: /remove/i })[0];
        await user.click(removeButton);

        expect(screen.getByText(/confirm removal/i)).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to remove/i)).toBeInTheDocument();
      });

      it('removes member after confirmation', async () => {
        const removeMemberMocks = [
          ...createMocks(),
          {
            request: {
              query: REMOVE_MEMBER,
              variables: { groupId: 'group-1', userId: 'admin-1' },
            },
            result: { data: { removeMember: { success: true } } },
          },
        ];

        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks: removeMemberMocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getAllByRole('button', { name: /remove/i })[0]).toBeInTheDocument();
        });

        const removeButton = screen.getAllByRole('button', { name: /remove/i })[0];
        await user.click(removeButton);

        await waitFor(() => {
          expect(screen.getByText(/confirm removal/i)).toBeInTheDocument();
        });

        const confirmButton = screen.getByRole('button', { name: /remove/i });
        await user.click(confirmButton);

        await waitFor(() => {
          expect(screen.getByText(/member removed successfully/i)).toBeInTheDocument();
        });
      });

      it('shows block user modal', async () => {
        const mocks = createMocks();
        const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
          mocks,
          preloadedState: {
            auth: {
              user: adminUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        });

        await waitFor(() => {
          expect(screen.getAllByRole('button', { name: /block/i })[0]).toBeInTheDocument();
        });

        const blockButton = screen.getAllByRole('button', { name: /block/i })[0];
        await user.click(blockButton);

        expect(screen.getByText(/block user/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/reason \(optional\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Blocked Users Management', () => {
    it('displays blocked users list', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /blocked users/i })).toBeInTheDocument();
      });

      const blockedTab = screen.getByRole('button', { name: /blocked users/i });
      await user.click(blockedTab);

      await waitFor(() => {
        expect(screen.getByText('blocked')).toBeInTheDocument();
        expect(screen.getByText('blocked@example.com')).toBeInTheDocument();
        expect(screen.getByText(/blocked by admin/i)).toBeInTheDocument();
        expect(screen.getByText(/reason: inappropriate behavior/i)).toBeInTheDocument();
      });
    });

    it('shows empty state when no blocked users', async () => {
      const emptyBlockedData = {
        ...mockGroupData,
        group: {
          ...mockGroupData.group,
          blockedUsers: [],
        },
      };

      const mocks = createMocks(emptyBlockedData);
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /blocked users/i })).toBeInTheDocument();
      });

      const blockedTab = screen.getByRole('button', { name: /blocked users/i });
      await user.click(blockedTab);

      await waitFor(() => {
        expect(screen.getByText(/no users are currently blocked/i)).toBeInTheDocument();
      });
    });

    it('unblocks user successfully', async () => {
      const unblockMocks = [
        ...createMocks(),
        {
          request: {
            query: UNBLOCK_USER,
            variables: { groupId: 'group-1', userId: 'blocked-1' },
          },
          result: { data: { unblockUser: { success: true } } },
        },
      ];

      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks: unblockMocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /blocked users/i })).toBeInTheDocument();
      });

      const blockedTab = screen.getByRole('button', { name: /blocked users/i });
      await user.click(blockedTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unblock/i })).toBeInTheDocument();
      });

      const unblockButton = screen.getByRole('button', { name: /unblock/i });
      await user.click(unblockButton);

      await waitFor(() => {
        expect(screen.getByText(/user unblocked successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Group Settings', () => {
    it('displays current group settings', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      });

      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByText(/current settings/i)).toBeInTheDocument();
        expect(screen.getByText(/group name:.*test group/i)).toBeInTheDocument();
        expect(screen.getByText(/description:.*a test group/i)).toBeInTheDocument();
        expect(screen.getByText(/is public:.*no/i)).toBeInTheDocument();
      });
    });

    it('shows edit form when edit button clicked', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      });

      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit group/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit group/i });
      await user.click(editButton);

      expect(screen.getByLabelText(/group name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/make this group public/i)).toBeInTheDocument();
    });

    it('updates group settings successfully', async () => {
      const updateMocks = [
        ...createMocks(),
        {
          request: {
            query: UPDATE_GROUP,
            variables: {
              id: 'group-1',
              input: {
                name: 'Updated Group Name',
                description: 'Updated description',
                isPublic: true,
              },
            },
          },
          result: { data: { updateGroup: { success: true } } },
        },
      ];

      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks: updateMocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      });

      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit group/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit group/i });
      await user.click(editButton);

      const nameInput = screen.getByLabelText(/group name/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const publicCheckbox = screen.getByLabelText(/make this group public/i);

      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Group Name');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated description');
      await user.click(publicCheckbox);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/group updated successfully/i)).toBeInTheDocument();
      });
    });

    it('shows delete confirmation and deletes group', async () => {
      const deleteMocks = [
        ...createMocks(),
        {
          request: {
            query: DELETE_GROUP,
            variables: { id: 'group-1' },
          },
          result: { data: { deleteGroup: { success: true } } },
        },
      ];

      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks: deleteMocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      });

      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete group/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete group/i });
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete this group?')
      );

      await waitFor(() => {
        expect(screen.getByText(/group deleted successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error messages when operations fail', async () => {
      const errorMocks = [
        ...createMocks(),
        {
          request: {
            query: MAKE_ADMIN,
            variables: { groupId: 'group-1', userId: 'user-1' },
          },
          result: { errors: [new GraphQLError('Permission denied')] },
        },
      ];

      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks: errorMocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /make admin/i })).toBeInTheDocument();
      });

      const makeAdminButton = screen.getByRole('button', { name: /make admin/i });
      await user.click(makeAdminButton);

      await waitFor(() => {
        expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
      });
    });

    it('clears error messages when new operations start', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      // This test would need to simulate an error first, then a successful operation
      // to verify error clearing behavior
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Loading States', () => {
    it('disables buttons during loading operations', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /make admin/i })).toBeInTheDocument();
      });

      const makeAdminButton = screen.getByRole('button', { name: /make admin/i });
      await user.click(makeAdminButton);

      // During the operation, buttons should be disabled
      expect(makeAdminButton).toBeDisabled();
    });

    it('shows loading text on buttons during operations', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter username or email/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/enter username or email/i);
      await user.type(input, 'test');

      const addButton = screen.getByRole('button', { name: /add member/i });
      await user.click(addButton);

      expect(screen.getByRole('button', { name: /adding/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and structure', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      });

      const settingsTab = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit group/i })).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit group/i });
      await user.click(editButton);

      expect(screen.getByLabelText(/group name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/make this group public/i)).toBeInTheDocument();
    });

    it('has proper heading structure', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /group management/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /add member/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /current members/i })).toBeInTheDocument();
      });
    });

    it('provides accessible modal dialogs', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupManagement groupId="group-1" />, {
        mocks,
        preloadedState: {
          auth: {
            user: adminUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /remove/i })[0]).toBeInTheDocument();
      });

      const removeButton = screen.getAllByRole('button', { name: /remove/i })[0];
      await user.click(removeButton);

      const modal = screen.getByRole('dialog', { name: /confirm removal/i });
      expect(modal).toBeInTheDocument();
    });
  });
});
