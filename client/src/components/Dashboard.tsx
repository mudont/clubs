import { useMutation, useQuery } from '@apollo/client';
import { GET_USER_PENDING_EVENTS } from 'graphql/Event';
import { GET_USER_EXPENSES } from 'graphql/Expenses';
import { CREATE_GROUP, GET_MY_GROUPS, GET_PUBLIC_GROUPS, JOIN_GROUP } from 'graphql/Group';
import { GET_USER_TENNIS_LEAGUES } from 'graphql/TennisLeague';
import { ME_QUERY } from 'graphql/User';
import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from './common/Header';
import './Dashboard.css';
import GroupCard from './groups/GroupCard';

interface GroupMembership {
  id: string;
  isAdmin: boolean;
  memberId: number;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  memberships: GroupMembership[];
}

interface MyGroupsData {
  myGroups: Group[];
}

interface PublicGroupsData {
  publicGroups: Group[];
}

interface CreateGroupInput {
  input: {
    name: string;
    description: string;
    isPublic: boolean;
  };
}

interface CreateGroupData {
  createGroup: Group;
}

interface JoinGroupData {
  joinGroup: Group;
}

// Tennis League interfaces
interface TennisLeague {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface UserTennisLeaguesData {
  userTennisLeagues: TennisLeague[];
}

interface UserPendingEventsData {
  userPendingEvents: {
    id: string;
    date: string;
    description: string;
    group: {
      id: string;
      name: string;
    };
    createdBy: {
      id: string;
      username: string;
    };
    rsvps: {
      id: string;
      status: string;
      note?: string;
    }[];
  }[];
}

// Expenses interfaces
interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  splitType: string;
  paidBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  group: {
    id: string;
    name: string;
  };
  splits: {
    id: string;
    amount: number;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

interface UserExpensesData {
  userExpenses: Expense[];
}

interface MeData {
  me: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: myGroupsData, loading: myGroupsLoading, refetch: refetchMyGroups } = useQuery<MyGroupsData>(GET_MY_GROUPS);
  const { data: publicGroupsData, loading: publicGroupsLoading, refetch: refetchPublicGroups } = useQuery<PublicGroupsData>(GET_PUBLIC_GROUPS);
  const { data: tennisLeaguesData, loading: tennisLeaguesLoading } = useQuery<UserTennisLeaguesData>(GET_USER_TENNIS_LEAGUES);
  const { data: pendingEventsData, loading: pendingEventsLoading } = useQuery<UserPendingEventsData>(GET_USER_PENDING_EVENTS);
  const { data: meData } = useQuery<MeData>(ME_QUERY);

  // Expenses queries
  const { data: userExpensesData, loading: userExpensesLoading } = useQuery<UserExpensesData>(GET_USER_EXPENSES, {
    variables: { userId: meData?.me?.id || '' },
    skip: !meData?.me?.id || !myGroupsData?.myGroups?.length
  });

  const [createGroup] = useMutation<CreateGroupData, CreateGroupInput>(CREATE_GROUP);
  const [joinGroup] = useMutation<JoinGroupData>(JOIN_GROUP);

  // Determine tennis league navigation
  const tennisLeagues = tennisLeaguesData?.userTennisLeagues || [];
  const hasSingleLeague = tennisLeagues.length === 1;
  const hasMultipleLeagues = tennisLeagues.length > 1;
  const singleLeague = hasSingleLeague ? tennisLeagues[0] : null;

  // Determine if user has unexpired events
  const pendingEvents = pendingEventsData?.userPendingEvents || [];
  const hasUnexpiredEvents = pendingEvents.length > 0;

  // Expenses data processing
  const userExpenses = userExpensesData?.userExpenses || [];
  const recentExpenses = userExpenses.slice(0, 5); // Show last 5 expenses
  const totalExpenses = userExpenses.length;
  const totalAmount = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by group
  const expensesByGroup = userExpenses.reduce((acc, expense) => {
    const groupId = expense.group.id;
    if (!acc[groupId]) {
      acc[groupId] = {
        group: expense.group,
        expenses: [],
        totalAmount: 0
      };
    }
    acc[groupId].expenses.push(expense);
    acc[groupId].totalAmount += expense.amount;
    return acc;
  }, {} as Record<string, { group: { id: string; name: string }; expenses: Expense[]; totalAmount: number }>);

  const handleCreateGroup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createGroup({
        variables: {
          input: {
            name: groupName,
            description: groupDescription,
            isPublic,
          },
        },
      });

      setGroupName('');
      setGroupDescription('');
      setIsPublic(false);
      setShowCreateForm(false);
      refetchMyGroups();
      refetchPublicGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  }, [groupName, groupDescription, isPublic, createGroup, refetchMyGroups, refetchPublicGroups]);

  const handleJoinGroup = useCallback(async (groupId: string) => {
    try {
      await joinGroup({
        variables: { groupId },
      });
      refetchMyGroups();
      refetchPublicGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    }
  }, [joinGroup, refetchMyGroups, refetchPublicGroups]);

  return (
    <div className="dashboard">
      <Header title="Dashboard">
        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-create-group"
          aria-expanded={showCreateForm}
          aria-controls={showCreateForm ? "create-group-form" : undefined}
          aria-label={showCreateForm ? 'Cancel group creation' : 'Create a new group'}
        >
          {showCreateForm ? 'Cancel' : 'Create New Group'}
        </button>
        {/* Conditional Tennis League Navigation */}
        {!tennisLeaguesLoading && (hasSingleLeague || hasMultipleLeagues) && (
          <Link
            to={hasSingleLeague ? `/tennis/leagues/${singleLeague?.id}` : '/tennis/leagues'}
            className="btn-tennis-league"
          >
            🎾 {hasSingleLeague ? singleLeague?.name : 'Tennis Leagues'}
          </Link>
        )}
        {/* Conditional RSVPs Navigation */}
        {!pendingEventsLoading && hasUnexpiredEvents && (
          <Link
            to="/events"
            className="btn-rsvps"
          >
            📅 RSVPs ({pendingEvents.length})
          </Link>
        )}
        {/* Expenses Navigation */}
        {totalExpenses > 0 && (
          <Link
            to="/expenses"
            className="btn-expenses"
          >
            💰 Expenses ({totalExpenses})
          </Link>
        )}
      </Header>

      {showCreateForm && (
        <div className="create-group-form" id="create-group-form" role="region" aria-labelledby="create-group-heading">
          <h3 id="create-group-heading">Create New Group</h3>
          {error && <div className="error-message" role="alert">{error}</div>}

          <form onSubmit={handleCreateGroup} noValidate>
            <div className="form-group">
              <label htmlFor="groupName">Group Name *</label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                placeholder="Enter group name"
                aria-describedby="groupName-description"
              />
              <div id="groupName-description" className="field-description">
                Choose a unique name for your group
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="groupDescription">Description</label>
              <textarea
                id="groupDescription"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Enter group description"
                rows={3}
                aria-describedby="groupDescription-description"
              />
              <div id="groupDescription-description" className="field-description">
                Optional: Describe what your group is about
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span className="checkmark"></span>
                Make this group public (anyone can join)
              </label>
              <div className="field-description">
                Public groups will be visible to all users and they can join without invitation
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !groupName.trim()}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>

          {loading && (
            <div className="loading-message" aria-live="polite">
              Creating your group, please wait...
            </div>
          )}
        </div>
      )}

      <main className="dashboard-content">
        {myGroupsLoading || publicGroupsLoading ? (
          <div className="loading" aria-live="polite">
            <span className="sr-only">Loading groups, please wait...</span>
            Loading groups...
          </div>
        ) : (
          <>
            {/* My Groups Section */}
            <section className="groups-section" aria-labelledby="my-groups-heading">
              <h2 id="my-groups-heading">My Groups</h2>
              {myGroupsData?.myGroups?.length === 0 ? (
                <div className="empty-state" role="status">
                  <h3 id="empty-state-heading">No groups yet</h3>
                  <p>Create your first group to get started!</p>
                </div>
              ) : (
                <div className="groups-grid" role="list">
                  {myGroupsData?.myGroups?.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onGroupLeft={refetchMyGroups}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Public Groups Section */}
            {publicGroupsData?.publicGroups && publicGroupsData.publicGroups.length > 0 && (
              <section className="groups-section" aria-labelledby="public-groups-heading">
                <h2 id="public-groups-heading">Public Groups</h2>
                <p className="section-description">
                  Join these public groups to connect with others
                </p>
                <div className="groups-grid" role="list">
                  {publicGroupsData.publicGroups.map((group) => (
                    <div key={group.id} className="group-card public-group">
                      <div className="group-info">
                        <h3>{group.name}</h3>
                        <p className="group-description">
                          {group.description || 'No description available.'}
                        </p>
                        <div className="group-meta">
                          <span className="member-count">
                            {group.memberships?.length || 0} members
                          </span>
                          <span className="group-type">Public Group</span>
                        </div>
                      </div>
                      <div className="group-actions">
                        <button
                          onClick={() => handleJoinGroup(group.id)}
                          className="btn-join-group"
                        >
                          Join Group
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tennis Section */}
            <section className="groups-section" aria-labelledby="tennis-heading">
              <h2 id="tennis-heading">Tennis Leagues</h2>
              <p className="section-description">
                Manage tennis leagues, teams, and matches
              </p>
              <div className="tennis-actions">
                <Link to="/tennis/leagues" className="btn-primary">
                  🎾 View Tennis Leagues
                </Link>
                <div className="tennis-info">
                  <p>Create and manage tennis leagues with:</p>
                  <ul>
                    <li>Team management and player rosters</li>
                    <li>Match scheduling and results tracking</li>
                    <li>Singles and doubles competitions</li>
                    <li>League standings and point systems</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Expenses Section */}
            {!userExpensesLoading && (
              <section className="groups-section" aria-labelledby="expenses-heading">
                <h2 id="expenses-heading">Expenses</h2>
                <p className="section-description">
                  Track shared expenses and settlements across your groups
                </p>

                {totalExpenses === 0 ? (
                  /* Empty State */
                  <div className="expenses-empty-state">
                    <div className="empty-state-content">
                      <h3>No expenses yet</h3>
                      <p>Start tracking shared expenses with your groups</p>
                      <div className="empty-state-actions">
                        <Link to="/expenses/add" className="btn-primary">
                          💰 Add Your First Expense
                        </Link>
                        <Link to="/expenses" className="btn-secondary">
                          View Expenses
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Expenses Summary */}
                    <div className="expenses-summary">
                      <div className="expense-stats">
                        <div className="stat-item">
                          <span className="stat-label">Total Expenses</span>
                          <span className="stat-value">{totalExpenses}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Total Amount</span>
                          <span className="stat-value">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Groups with Expenses</span>
                          <span className="stat-value">{Object.keys(expensesByGroup).length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Expenses List */}
                    <div className="recent-expenses">
                      <h3>Recent Activity</h3>
                      <div className="expenses-list">
                        {recentExpenses.map((expense) => (
                          <div key={expense.id} className="expense-item">
                            <div className="expense-info">
                              <h4>{expense.description}</h4>
                              <p className="expense-meta">
                                {expense.group.name} • {expense.category} • {new Date(expense.date).toLocaleDateString()}
                              </p>
                              <p className="expense-amount">
                                ${expense.amount.toFixed(2)} {expense.currency}
                              </p>
                            </div>
                            <div className="expense-details">
                              <span className="paid-by">Paid by {expense.paidBy.firstName || expense.paidBy.username}</span>
                              <span className="split-type">{expense.splitType}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="expenses-actions">
                        <Link to="/expenses" className="btn-primary">
                          View All Expenses
                        </Link>
                        <Link to="/expenses/add" className="btn-secondary">
                          Add New Expense
                        </Link>
                      </div>
                    </div>

                    {/* Group Expenses Breakdown */}
                    <div className="group-expenses">
                      <h3>Expenses by Group</h3>
                      <div className="group-expenses-grid">
                        {Object.values(expensesByGroup).map(({ group, expenses, totalAmount }) => (
                          <div key={group.id} className="group-expense-card">
                            <h4>{group.name}</h4>
                            <div className="group-expense-stats">
                              <span>{expenses.length} expenses</span>
                              <span className="total-amount">${totalAmount.toFixed(2)}</span>
                            </div>
                            <Link to={`/expenses/group/${group.id}`} className="btn-link">
                              View Group Expenses
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
