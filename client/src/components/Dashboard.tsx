import { gql, useMutation, useQuery } from '@apollo/client';
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

interface GroupData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  isPublic?: boolean;
  memberships?: GroupMembership[];
}

interface MyGroupsData {
  myGroups: GroupData[];
}

interface PublicGroupsData {
  publicGroups: GroupData[];
}

interface CreateGroupData {
  createGroup: {
    id: string;
    name: string;
    description?: string;
  };
}

interface CreateGroupInput {
  input: {
    name: string;
    description?: string;
    isPublic?: boolean;
  };
}

interface JoinGroupData {
  joinGroup: {
    id: string;
    user: {
      id: string;
      username: string;
    };
    group: {
      id: string;
      name: string;
    };
  };
}

const GET_MY_GROUPS = gql`
  query GetMyGroups {
    myGroups {
      id
      name
      description
      createdAt
      isPublic
      memberships {
        id
        isAdmin
        memberId
        user {
          id
          username
          email
        }
      }
    }
  }
`;

const GET_PUBLIC_GROUPS = gql`
  query GetPublicGroups {
    publicGroups {
      id
      name
      description
      createdAt
      isPublic
      memberships {
        id
        isAdmin
        memberId
        user {
          id
          username
          email
        }
      }
    }
  }
`;

const CREATE_GROUP = gql`
  mutation CreateGroup($input: CreateGroupInput!) {
    createGroup(input: $input) {
      id
      name
      description
      isPublic
    }
  }
`;

const JOIN_GROUP = gql`
  mutation JoinGroup($groupId: ID!) {
    joinGroup(groupId: $groupId) {
      id
      user {
        id
        username
      }
      group {
        id
        name
      }
    }
  }
`;

const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: myGroupsData, loading: myGroupsLoading, refetch: refetchMyGroups } = useQuery<MyGroupsData>(GET_MY_GROUPS);
  const { data: publicGroupsData, loading: publicGroupsLoading, refetch: refetchPublicGroups } = useQuery<PublicGroupsData>(GET_PUBLIC_GROUPS);
  const [createGroup] = useMutation<CreateGroupData, CreateGroupInput>(CREATE_GROUP);
  const [joinGroup] = useMutation<JoinGroupData>(JOIN_GROUP);

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
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
