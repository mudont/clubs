import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import {
  createTestGroup,
  createTestUser,
  renderWithProviders,
} from '../../../__tests__/utils/test-utils';
import GroupCard from '../GroupCard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('GroupCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders group information correctly', () => {
    const group = createTestGroup({
      name: 'Tennis Club',
      description: 'A club for tennis enthusiasts',
      isPublic: true,
    });

    renderWithProviders(<GroupCard group={group} />);

    expect(screen.getByText('Tennis Club')).toBeInTheDocument();
    expect(screen.getByText('A club for tennis enthusiasts')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('1 member')).toBeInTheDocument();
  });

  it('renders private group indicator', () => {
    const group = createTestGroup({
      name: 'Private Club',
      isPublic: false,
    });

    renderWithProviders(<GroupCard group={group} />);

    expect(screen.getByText('Private')).toBeInTheDocument();
  });

  it('handles group without description', () => {
    const group = createTestGroup({
      name: 'No Description Group',
      description: undefined,
    });

    renderWithProviders(<GroupCard group={group} />);

    expect(screen.getByText('No Description Group')).toBeInTheDocument();
    expect(screen.getByText('No description available')).toBeInTheDocument();
  });

  it('displays correct member count', () => {
    const user1 = createTestUser({ username: 'user1' });
    const user2 = createTestUser({ username: 'user2' });
    const user3 = createTestUser({ username: 'user3' });

    const group = createTestGroup({
      memberships: [
        { id: '1', isAdmin: true, memberId: 1, user: user1 },
        { id: '2', isAdmin: false, memberId: 2, user: user2 },
        { id: '3', isAdmin: false, memberId: 3, user: user3 },
      ],
    });

    renderWithProviders(<GroupCard group={group} />);

    expect(screen.getByText('3 members')).toBeInTheDocument();
  });

  it('navigates to group page when clicked', async () => {
    const group = createTestGroup();
    const { user } = renderWithProviders(<GroupCard group={group} />);

    const viewButton = screen.getByRole('button', { name: /view group/i });
    await user.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/groups/${group.id}`);
  });

  it('shows admin indicator for user admin status', () => {
    const adminUser = createTestUser({ username: 'admin' });
    const group = createTestGroup({
      memberships: [{ id: '1', isAdmin: true, memberId: 1, user: adminUser }],
    });

    renderWithProviders(<GroupCard group={group} />, {
      preloadedState: {
        auth: {
          user: adminUser,
          token: 'test-token',
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const group = createTestGroup();
    const { user } = renderWithProviders(<GroupCard group={group} />);

    const viewButton = screen.getByRole('button', { name: /view group/i });

    // Tab to the button
    await user.tab();
    expect(viewButton).toHaveFocus();

    // Press Enter to activate
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith(`/groups/${group.id}`);
  });

  it('has proper accessibility attributes', () => {
    const group = createTestGroup({
      name: 'Accessible Group',
      description: 'A group with proper accessibility',
    });

    renderWithProviders(<GroupCard group={group} />);

    const card = screen.getByRole('gridcell');
    expect(card).toHaveAttribute('aria-labelledby', `group-title-${group.id}`);
    expect(card).toHaveAttribute('aria-describedby', `group-description-${group.id}`);

    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toHaveAttribute('id', `group-title-${group.id}`);

    const description = screen.getByText('A group with proper accessibility');
    expect(description).toHaveAttribute('id', `group-description-${group.id}`);

    const viewButton = screen.getByRole('button', { name: /view group/i });
    expect(viewButton).toHaveAttribute('aria-label', `View details for ${group.name} group`);
  });

  it('passes accessibility audit', async () => {
    const group = createTestGroup();
    const { container } = renderWithProviders(<GroupCard group={group} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('displays creation date in readable format', () => {
    const group = createTestGroup({
      createdAt: '2024-01-15T10:30:00Z',
    });

    renderWithProviders(<GroupCard group={group} />);

    // Should display a human-readable date
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });

  it('handles long group names gracefully', () => {
    const group = createTestGroup({
      name: 'This is a very long group name that should be handled gracefully without breaking the layout',
    });

    renderWithProviders(<GroupCard group={group} />);

    const title = screen.getByRole('heading', { level: 3 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('truncate'); // Assuming Tailwind truncate class
  });

  it('handles long descriptions gracefully', () => {
    const group = createTestGroup({
      description:
        'This is a very long description that should be truncated or handled gracefully to maintain the card layout and not overflow the container boundaries.',
    });

    renderWithProviders(<GroupCard group={group} />);

    const description = screen.getByText(/This is a very long description/);
    expect(description).toBeInTheDocument();
  });

  it('shows loading state when navigating', async () => {
    const group = createTestGroup();
    const { user } = renderWithProviders(<GroupCard group={group} />);

    const viewButton = screen.getByRole('button', { name: /view group/i });
    await user.click(viewButton);

    // Check if button shows loading state (implementation dependent)
    expect(viewButton).toBeDisabled();
  });

  it('renders correctly with minimal data', () => {
    const minimalGroup = {
      id: 'minimal-group',
      name: 'Minimal Group',
      createdAt: new Date().toISOString(),
      memberships: [],
      isPublic: false,
    };

    renderWithProviders(<GroupCard group={minimalGroup as TestGroup} />);

    expect(screen.getByText('Minimal Group')).toBeInTheDocument();
    expect(screen.getByText('0 members')).toBeInTheDocument();
  });

  it('handles group with special characters in name', () => {
    const group = createTestGroup({
      name: 'Group with "Special" & <Characters>',
    });

    renderWithProviders(<GroupCard group={group} />);

    expect(screen.getByText('Group with "Special" & <Characters>')).toBeInTheDocument();
  });

  it('shows correct visual indicators for group type', () => {
    const publicGroup = createTestGroup({ isPublic: true });
    const { rerender } = renderWithProviders(<GroupCard group={publicGroup} />);

    expect(screen.getByText('Public')).toHaveClass('bg-green-100'); // Assuming styling

    const privateGroup = createTestGroup({ isPublic: false });
    rerender(<GroupCard group={privateGroup} />);

    expect(screen.getByText('Private')).toHaveClass('bg-gray-100'); // Assuming styling
  });
});
