import { screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';

import { createComponentTestHelpers } from '../../../__tests__/utils/component-test-helpers';
import {
  createTestGroup,
  createTestUser,
  renderWithProviders,
} from '../../../__tests__/utils/test-utils';
import { GET_GROUP } from '../../../graphql/Group';
import GroupDetail from '../GroupDetail';

// Mock child components
jest.mock('../GroupManagement', () => {
  return function MockGroupManagement({ groupId }: { groupId: string }) {
    return <div data-testid="group-management">Group Management for {groupId}</div>;
  };
});

jest.mock('../../chat/ChatRoom', () => {
  return function MockChatRoom({ groupId }: { groupId: string }) {
    return <div data-testid="chat-room">Chat Room for {groupId}</div>;
  };
});

jest.mock('../../events/EventList', () => {
  return function MockEventList({ groupId, isAdmin }: { groupId: string; isAdmin: boolean }) {
    return (
      <div data-testid="event-list">
        Event List for {groupId} (Admin: {isAdmin.toString()})
      </div>
    );
  };
});

jest.mock('../../common/Header', () => {
  return function MockHeader({
    title,
    showBackButton,
    backTo,
    children,
  }: {
    title: string;
    showBackButton?: boolean;
    backTo?: string;
    children?: React.ReactNode;
  }) {
    return (
      <header data-testid="header">
        <h1>{title}</h1>
        {showBackButton && (
          <button data-testid="back-button" data-back-to={backTo}>
            Back
          </button>
        )}
        {children}
      </header>
    );
  };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-group-id' }),
  useNavigate: () => mockNavigate,
}));

describe('GroupDetail Component', () => {
  const testUser = createTestUser({ id: 'user-1', username: 'testuser' });
  const adminUser = createTestUser({ id: 'admin-1', username: 'adminuser' });

  const testGroup = createTestGroup({
    id: 'test-group-id',
    name: 'Test Group',
    description: 'A test group for testing',
    createdAt: '2024-01-15T10:00:00Z',
    memberships: [
      {
        id: 'membership-1',
        isAdmin: true,
        memberId: 1,
        user: adminUser,
      },
      {
        id: 'membership-2',
        isAdmin: false,
        memberId: 2,
        user: testUser,
      },
    ],
  });

  const createMocks = (group = testGroup, error?: GraphQLError) => [
    {
      request: {
        query: GET_GROUP,
        variables: { id: 'test-group-id' },
      },
      result: error ? { errors: [error] } : { data: { group } },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location.hash
    window.location.hash = '';
  });

  describe('Loading States', () => {
    it('shows loading state while fetching group data', () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      expect(screen.getByText(/loading group details/i)).toBeInTheDocument();
    });

    it('applies loading styles correctly', () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      const loadingElement = screen.getByText(/loading group details/i);
      expect(loadingElement).toHaveClass('loading');
    });
  });

  describe('Error States', () => {
    it('shows error message when GraphQL query fails', async () => {
      const error = new GraphQLError('Group not found');
      const mocks = createMocks(testGroup, error);

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/error loading group: group not found/i)).toBeInTheDocument();
      });
    });

    it('shows not found message when group is null', async () => {
      const mocks = [
        {
          request: {
            query: GET_GROUP,
            variables: { id: 'test-group-id' },
          },
          result: { data: { group: null } },
        },
      ];

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/group not found/i)).toBeInTheDocument();
      });
    });

    it('applies error styling correctly', async () => {
      const error = new GraphQLError('Network error');
      const mocks = createMocks(testGroup, error);

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const errorElement = screen.getByText(/error loading group/i);
        expect(errorElement).toHaveClass('error-message');
      });
    });
  });

  describe('Group Information Display', () => {
    it('displays group name in header', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Group')).toBeInTheDocument();
      });
    });

    it('displays member count in header', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('2 members')).toBeInTheDocument();
      });
    });

    it('shows back button with correct destination', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const backButton = screen.getByTestId('back-button');
        expect(backButton).toBeInTheDocument();
        expect(backButton).toHaveAttribute('data-back-to', '/dashboard');
      });
    });
  });

  describe('Tab Navigation', () => {
    it('renders all tabs for regular members', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /events/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /chat/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /management/i })).not.toBeInTheDocument();
      });
    });

    it('renders management tab for admin users', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
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
        expect(screen.getByRole('button', { name: /management/i })).toBeInTheDocument();
      });
    });

    it('sets overview tab as active by default', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const overviewTab = screen.getByRole('button', { name: /overview/i });
        expect(overviewTab).toHaveClass('active');
      });
    });

    it('switches tabs when clicked', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /overview/i })).toHaveClass('active');
      });

      const eventsTab = screen.getByRole('button', { name: /events/i });
      await user.click(eventsTab);

      expect(eventsTab).toHaveClass('active');
      expect(screen.getByRole('button', { name: /overview/i })).not.toHaveClass('active');
    });

    it('updates URL hash when tab changes', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /events/i })).toBeInTheDocument();
      });

      const eventsTab = screen.getByRole('button', { name: /events/i });
      await user.click(eventsTab);

      expect(window.location.hash).toBe('#events');
    });

    it('initializes tab from URL hash', async () => {
      window.location.hash = '#chat';

      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const chatTab = screen.getByRole('button', { name: /chat/i });
        expect(chatTab).toHaveClass('active');
      });
    });
  });

  describe('Overview Tab Content', () => {
    it('displays group description', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('A test group for testing')).toBeInTheDocument();
      });
    });

    it('shows default message when no description', async () => {
      const groupWithoutDescription = { ...testGroup, description: null };
      const mocks = createMocks(groupWithoutDescription);

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/no description available/i)).toBeInTheDocument();
      });
    });

    it('displays creation date', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText(/created on 1\/15\/2024/i)).toBeInTheDocument();
      });
    });

    it('displays members list with usernames and IDs', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByText('adminuser')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
      });
    });

    it('shows admin badges for admin members', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const adminBadge = screen.getByText('Admin');
        expect(adminBadge).toBeInTheDocument();
        expect(adminBadge).toHaveClass('badge', 'admin');
      });
    });
  });

  describe('Tab Content Rendering', () => {
    it('renders EventList component in events tab', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /events/i })).toBeInTheDocument();
      });

      const eventsTab = screen.getByRole('button', { name: /events/i });
      await user.click(eventsTab);

      expect(screen.getByTestId('event-list')).toBeInTheDocument();
      expect(
        screen.getByText(/event list for test-group-id \(admin: false\)/i)
      ).toBeInTheDocument();
    });

    it('renders ChatRoom component in chat tab', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /chat/i })).toBeInTheDocument();
      });

      const chatTab = screen.getByRole('button', { name: /chat/i });
      await user.click(chatTab);

      expect(screen.getByTestId('chat-room')).toBeInTheDocument();
      expect(screen.getByText(/chat room for test-group-id/i)).toBeInTheDocument();
    });

    it('renders GroupManagement component for admin users', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
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
        expect(screen.getByRole('button', { name: /management/i })).toBeInTheDocument();
      });

      const managementTab = screen.getByRole('button', { name: /management/i });
      await user.click(managementTab);

      expect(screen.getByTestId('group-management')).toBeInTheDocument();
      expect(screen.getByText(/group management for test-group-id/i)).toBeInTheDocument();
    });

    it('passes correct isAdmin prop to EventList', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
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
        expect(screen.getByRole('button', { name: /events/i })).toBeInTheDocument();
      });

      const eventsTab = screen.getByRole('button', { name: /events/i });
      await user.click(eventsTab);

      expect(screen.getByText(/event list for test-group-id \(admin: true\)/i)).toBeInTheDocument();
    });
  });

  describe('Admin Permissions', () => {
    it('correctly identifies admin users', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
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
        expect(screen.getByRole('button', { name: /management/i })).toBeInTheDocument();
      });
    });

    it('correctly identifies non-admin users', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /management/i })).not.toBeInTheDocument();
      });
    });

    it('handles users not in group membership list', async () => {
      const outsideUser = createTestUser({ id: 'outside-user', username: 'outsider' });
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: outsideUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /management/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Browser Navigation Integration', () => {
    it('responds to browser back/forward navigation', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /overview/i })).toHaveClass('active');
      });

      // Simulate hash change (browser navigation)
      window.location.hash = '#events';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /events/i })).toHaveClass('active');
      });
    });

    it('handles invalid hash values gracefully', async () => {
      window.location.hash = '#invalid-tab';

      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /overview/i })).toHaveClass('active');
      });
    });

    it('handles management-specific hashes correctly', async () => {
      window.location.hash = '#mgmt-members';

      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
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
        expect(screen.getByRole('button', { name: /management/i })).toHaveClass('active');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper tab navigation structure', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const tabNavigation = screen
          .getByRole('button', { name: /overview/i })
          .closest('.tab-navigation');
        expect(tabNavigation).toBeInTheDocument();
      });
    });

    it('has accessible tab buttons', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        const overviewTab = screen.getByRole('button', { name: /overview/i });
        const eventsTab = screen.getByRole('button', { name: /events/i });
        const chatTab = screen.getByRole('button', { name: /chat/i });

        expect(overviewTab).toHaveAttribute('class');
        expect(eventsTab).toHaveAttribute('class');
        expect(chatTab).toHaveAttribute('class');
      });
    });

    it('has proper heading structure', async () => {
      const mocks = createMocks();

      renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /test group/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /about/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /members/i })).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation between tabs', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument();
      });

      const helpers = createComponentTestHelpers(user);

      // Tab through the navigation buttons
      await user.tab();
      expect(screen.getByRole('button', { name: /overview/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /events/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /chat/i })).toHaveFocus();
    });

    it('activates tabs with Enter key', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /events/i })).toBeInTheDocument();
      });

      const eventsTab = screen.getByRole('button', { name: /events/i });
      eventsTab.focus();
      await user.keyboard('{Enter}');

      expect(eventsTab).toHaveClass('active');
    });

    it('activates tabs with Space key', async () => {
      const mocks = createMocks();
      const { user } = renderWithProviders(<GroupDetail />, {
        mocks,
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /chat/i })).toBeInTheDocument();
      });

      const chatTab = screen.getByRole('button', { name: /chat/i });
      chatTab.focus();
      await user.keyboard(' ');

      expect(chatTab).toHaveClass('active');
    });
  });
});
