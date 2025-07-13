import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import './GroupManagement.css';

const GET_GROUP_MEMBERS = gql`
  query GetGroupMembers($groupId: ID!) {
    group(id: $groupId) {
      id
      name
      description
      isPublic
      memberships {
        id
        isAdmin
        memberId
        joinedAt
        user {
          id
          username
          email
          firstName
          lastName
        }
      }
      blockedUsers {
        id
        blockedAt
        reason
        user {
          id
          username
          email
        }
        blockedBy {
          id
          username
        }
      }
    }
  }
`;

const MAKE_ADMIN = gql`
  mutation MakeAdmin($groupId: ID!, $userId: ID!) {
    makeAdmin(groupId: $groupId, userId: $userId) {
      id
      isAdmin
      user {
        id
        username
        email
      }
    }
  }
`;

const REMOVE_ADMIN = gql`
  mutation RemoveAdmin($groupId: ID!, $userId: ID!) {
    removeAdmin(groupId: $groupId, userId: $userId) {
      id
      isAdmin
      user {
        id
        username
        email
      }
    }
  }
`;

const REMOVE_MEMBER = gql`
  mutation RemoveMember($groupId: ID!, $userId: ID!) {
    removeMember(groupId: $groupId, userId: $userId)
  }
`;

const BLOCK_USER = gql`
  mutation BlockUser($input: BlockUserInput!) {
    blockUser(input: $input)
  }
`;

const UNBLOCK_USER = gql`
  mutation UnblockUser($groupId: ID!, $userId: ID!) {
    unblockUser(groupId: $groupId, userId: $userId)
  }
`;

const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: ID!, $input: UpdateGroupInput!) {
    updateGroup(id: $id, input: $input) {
      id
      name
      description
      isPublic
    }
  }
`;

const ADD_MEMBER_BY_USERNAME = gql`
  mutation AddMemberByUsername($groupId: ID!, $username: String!) {
    addMemberByUsername(groupId: $groupId, username: $username) {
      id
      role
      user {
        id
        username
        email
        firstName
        lastName
      }
    }
  }
`;

const ADD_MEMBER_BY_EMAIL = gql`
  mutation AddMemberByEmail($groupId: ID!, $email: String!) {
    addMemberByEmail(groupId: $groupId, email: $email) {
      id
      username
      email
      firstName
      lastName
    }
  }
`;

const USER_SEARCH = gql`
  query UserSearch($query: String!) {
    userSearch(query: $query) {
      id
      username
      email
      firstName
      lastName
    }
  }
`;

interface GroupManagementProps {
  groupId: string;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ groupId }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'blocked' | 'settings'>('members');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockForm, setShowBlockForm] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  // Tab state persistence using URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('mgmt-')) {
      const tab = hash.replace('mgmt-', '');
      if (tab === 'members' || tab === 'blocked' || tab === 'settings') {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleTabChange = (tab: 'members' | 'blocked' | 'settings') => {
    setActiveTab(tab);
    window.location.hash = `mgmt-${tab}`;
  };

  const { data, loading: membersLoading, refetch } = useQuery(GET_GROUP_MEMBERS, {
    variables: { groupId },
  });

  const [makeAdmin] = useMutation(MAKE_ADMIN);
  const [removeAdmin] = useMutation(REMOVE_ADMIN);
  const [removeMember] = useMutation(REMOVE_MEMBER);
  const [blockUser] = useMutation(BLOCK_USER);
  const [unblockUser] = useMutation(UNBLOCK_USER);
  const [updateGroup] = useMutation(UPDATE_GROUP);
  const [addMemberByUsername] = useMutation(ADD_MEMBER_BY_USERNAME);
  const [addMemberByEmail] = useMutation(ADD_MEMBER_BY_EMAIL);
  const [addInput, setAddInput] = useState('');

  // Form states
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  const [userSearch, { data: userSearchData }] = useLazyQuery(USER_SEARCH);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState<{ userId: string; username: string; memberId: string } | null>(null);

  // Initialize group form when data loads
  React.useEffect(() => {
    if (data?.group) {
      setGroupForm({
        name: data.group.name || '',
        description: data.group.description || '',
        isPublic: data.group.isPublic || false,
      });
    }
  }, [data]);

  const isAdmin = data?.group?.memberships?.find(
    (member: any) => member.user.id === user?.id && member.isAdmin
  );

  const handleMakeAdmin = async (userId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await makeAdmin({
        variables: {
          groupId,
          userId,
        },
      });

      setSuccess('Member promoted to admin successfully!');
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to promote member to admin');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await removeAdmin({
        variables: {
          groupId,
          userId,
        },
      });

      setSuccess('Admin privileges removed successfully!');
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (memberId: string, username: string, userId: string) => {
    setConfirmRemoval({ userId, username, memberId });
  };

  const confirmRemoveMember = async () => {
    if (!confirmRemoval) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await removeMember({
        variables: {
          groupId,
          userId: confirmRemoval.userId,
        },
      });

      setSuccess('Member removed successfully!');
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setLoading(false);
      setConfirmRemoval(null);
    }
  };

  const handleBlockUser = async (userId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await blockUser({
        variables: {
          input: {
            groupId,
            userId,
            reason: blockReason || undefined,
          },
        },
      });

      setSuccess('User blocked successfully!');
      setBlockReason('');
      setShowBlockForm(null);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await unblockUser({
        variables: {
          groupId,
          userId,
        },
      });

      setSuccess('User unblocked successfully!');
      refetch();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateGroup({
        variables: {
          id: groupId,
          input: {
            name: groupForm.name,
            description: groupForm.description,
            isPublic: groupForm.isPublic,
          },
        },
      });

      setSuccess('Group updated successfully!');
      setIsEditingGroup(false);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setGroupForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddInput(value);

    if (value.trim().length >= 2) {
      userSearch({ variables: { query: value } });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user: any) => {
    setAddInput(user.username);
    setShowSuggestions(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Try to add by username first
      try {
        await addMemberByUsername({
          variables: {
            groupId,
            username: addInput.trim(),
          },
        });
        setSuccess('Member added successfully!');
        setAddInput('');
        setShowSuggestions(false);
        refetch();
        return;
      } catch (usernameError: any) {
        // If username fails, try email
        try {
          await addMemberByEmail({
            variables: {
              groupId,
              email: addInput.trim(),
            },
          });
          setSuccess('Member added successfully!');
          setAddInput('');
          setShowSuggestions(false);
          refetch();
          return;
        } catch (emailError: any) {
          throw emailError; // Throw the email error as it's the last attempt
        }
      }

      // If we get here, neither attempt worked
      setError('Failed to add member. Please check the username or email.');
    } catch (err: any) {
      console.error('Add member error:', err);
      setError(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  if (membersLoading) {
    return <div className="loading">Loading group management...</div>;
  }

  if (!isAdmin) {
    return <div className="error-message">You must be an admin to access group management.</div>;
  }

  return (
    <div className="group-management">
      <div className="management-header">
        <h2>Group Management</h2>
        <div className="tab-buttons">
          <button
            onClick={() => handleTabChange('members')}
            className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          >
            Members
          </button>
          <button
            onClick={() => handleTabChange('blocked')}
            className={`tab-button ${activeTab === 'blocked' ? 'active' : ''}`}
          >
            Blocked Users
          </button>
          <button
            onClick={() => handleTabChange('settings')}
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          >
            Settings
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === 'members' && (
        <div className="members-management">
          <div className="add-member-section">
            <h3>Add Member</h3>
            <form onSubmit={handleAddMember} className="add-member-form">
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={addInput}
                    onChange={handleAddInputChange}
                    placeholder="Enter username or email"
                    className="member-input"
                  />
                  {showSuggestions && userSearchData?.userSearch && userSearchData.userSearch.length > 0 && (
                    <div className="suggestions">
                      {userSearchData.userSearch.map((user: any) => (
                        <div
                          key={user.id}
                          className="suggestion-item"
                          onClick={() => handleSuggestionClick(user)}
                        >
                          {user.username} ({user.email})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading || !addInput.trim()}
                >
                  {loading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>

          <div className="members-list">
            <h3>Current Members</h3>
            {data?.group?.memberships?.map((member: any) => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <span className="member-name">{member.user.username}</span>
                  <span className="member-email">{member.user.email}</span>
                  <span className={`member-role ${member.isAdmin ? 'admin' : 'member'}`}>
                    {member.isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>
                <div className="member-actions">
                  {member.isAdmin ? (
                    <button
                      onClick={() => handleRemoveAdmin(member.user.id)}
                      disabled={loading}
                      className="btn-demote"
                    >
                      Remove Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMakeAdmin(member.user.id)}
                      disabled={loading}
                      className="btn-promote"
                    >
                      Make Admin
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveMember(member.id, member.user.username, member.user.id)}
                    disabled={loading}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => setShowBlockForm(member.user.id)}
                    disabled={loading}
                    className="btn-block"
                  >
                    Block
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'blocked' && (
        <div className="blocked-users-management">
          <h3>Blocked Users</h3>
          {data?.group?.blockedUsers?.length === 0 ? (
            <div className="empty-state">
              <p>No users are currently blocked from this group.</p>
            </div>
          ) : (
            <div className="blocked-users-list">
              {data?.group?.blockedUsers?.map((blockedUser: any) => (
                <div key={blockedUser.id} className="blocked-user-item">
                  <div className="blocked-user-info">
                    <span className="blocked-user-name">{blockedUser.user.username}</span>
                    <span className="blocked-user-email">{blockedUser.user.email}</span>
                    <span className="blocked-by">Blocked by {blockedUser.blockedBy.username}</span>
                    <span className="blocked-date">
                      {new Date(blockedUser.blockedAt).toLocaleDateString()}
                    </span>
                    {blockedUser.reason && (
                      <span className="block-reason">Reason: {blockedUser.reason}</span>
                    )}
                  </div>
                  <div className="blocked-user-actions">
                    <button
                      onClick={() => handleUnblockUser(blockedUser.user.id)}
                      disabled={loading}
                      className="btn-unblock"
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="group-settings">
          <h3>Group Settings</h3>
          {!isEditingGroup ? (
            <div className="form-actions">
              <button type="button" className="btn-primary" onClick={() => setIsEditingGroup(true)}>
                Edit Group
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateGroup} className="settings-form">
              <div className="form-group">
                <label htmlFor="groupName">Group Name</label>
                <input
                  type="text"
                  id="groupName"
                  name="name"
                  value={groupForm.name}
                  onChange={handleGroupFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="groupDescription">Description</label>
                <textarea
                  id="groupDescription"
                  name="description"
                  value={groupForm.description}
                  onChange={handleGroupFormChange}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={groupForm.isPublic}
                    onChange={handleGroupFormChange}
                  />
                  <span className="checkmark"></span>
                  Make this group public (anyone can join)
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditingGroup(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Block User Modal */}
      {showBlockForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Block User</h3>
            <div className="form-group">
              <label htmlFor="blockReason">Reason (optional)</label>
              <textarea
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                rows={3}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => handleBlockUser(showBlockForm)} disabled={loading}>
                {loading ? 'Blocking...' : 'Block User'}
              </button>
              <button onClick={() => setShowBlockForm(null)} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmRemoval && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Removal</h3>
            <p>Are you sure you want to remove {confirmRemoval.username} from the group?</p>
            <div className="modal-actions">
              <button onClick={confirmRemoveMember} disabled={loading}>
                {loading ? 'Removing...' : 'Remove'}
              </button>
              <button onClick={() => setConfirmRemoval(null)} disabled={loading}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
