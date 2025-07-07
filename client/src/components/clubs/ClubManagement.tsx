import { useQuery, useMutation, useLazyQuery , gql } from '@apollo/client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import './ClubManagement.css';

const GET_CLUB_MEMBERS = gql`
  query GetClubMembers($clubId: ID!) {
    club(id: $clubId) {
      id
      name
      description
      members {
        id
        role
        joinedAt
        user {
          id
          username
          email
          firstName
          lastName
        }
      }
    }
  }
`;

const UPDATE_MEMBER_ROLE = gql`
  mutation UpdateMemberRole($input: UpdateMemberRoleInput!) {
    updateMemberRole(input: $input) {
      id
      role
      user {
        id
        username
      }
    }
  }
`;

const REMOVE_MEMBER = gql`
  mutation RemoveMember($clubId: ID!, $userId: ID!) {
    removeMember(clubId: $clubId, userId: $userId)
  }
`;

const UPDATE_CLUB = gql`
  mutation UpdateClub($input: UpdateClubInput!) {
    updateClub(input: $input) {
      id
      name
      description
    }
  }
`;

const ADD_MEMBER_BY_USERNAME = gql`
  mutation AddMemberByUsername($clubId: ID!, $username: String!) {
    addMemberByUsername(clubId: $clubId, username: $username) {
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
  mutation AddMemberByEmail($clubId: ID!, $email: String!) {
    addMemberByEmail(clubId: $clubId, email: $email) {
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

interface ClubManagementProps {
  clubId: string;
}

const ClubManagement: React.FC<ClubManagementProps> = ({ clubId }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [isEditingClub, setIsEditingClub] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const { data, loading: membersLoading, refetch } = useQuery(GET_CLUB_MEMBERS, {
    variables: { clubId },
  });

  const [updateMemberRole] = useMutation(UPDATE_MEMBER_ROLE);
  const [removeMember] = useMutation(REMOVE_MEMBER);
  const [updateClub] = useMutation(UPDATE_CLUB);
  const [addMemberByUsername] = useMutation(ADD_MEMBER_BY_USERNAME);
  const [addMemberByEmail] = useMutation(ADD_MEMBER_BY_EMAIL);
  const [addInput, setAddInput] = useState('');

  // Form states
  const [clubForm, setClubForm] = useState({
    name: '',
    description: '',
  });

  const [userSearch, { data: userSearchData }] = useLazyQuery(USER_SEARCH);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmRemoval, setConfirmRemoval] = useState<{ userId: string; username: string; memberId: string } | null>(null);

  // Initialize club form when data loads
  React.useEffect(() => {
    if (data?.club) {
      setClubForm({
        name: data.club.name || '',
        description: data.club.description || '',
      });
    }
  }, [data]);

  const isAdmin = data?.club?.members?.find(
    (member: any) => member.user.id === user?.id && member.role === 'ADMIN'
  );

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateMemberRole({
        variables: {
          input: {
            memberId,
            role: newRole,
          },
        },
      });

      setSuccess('Member role updated successfully!');
      setEditingMember(null);
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
          clubId,
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

  const handleUpdateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateClub({
        variables: {
          input: {
            clubId,
            ...clubForm,
          },
        },
      });

      setSuccess('Club updated successfully!');
      setIsEditingClub(false);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to update club');
    } finally {
      setLoading(false);
    }
  };

  const handleClubFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClubForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddInput(e.target.value);
    setError('');
    setSuccess('');
    if (e.target.value.length >= 2) {
      userSearch({ variables: { query: e.target.value } });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (user: any) => {
    setAddInput(user.username || user.email);
    setShowSuggestions(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShowSuggestions(false);
    try {
      // Try username first
      await addMemberByUsername({
        variables: { clubId, username: addInput },
      });
      setSuccess('Member added by username!');
      setAddInput('');
      refetch();
    } catch (err: any) {
      // If not found, try email
      if (err.message && err.message.includes('User not found')) {
        try {
          await addMemberByEmail({
            variables: { clubId, email: addInput },
          });
          setSuccess('Member added by email!');
          setAddInput('');
          refetch();
        } catch (err2: any) {
          if (err2.message && err2.message.includes('Unique constraint failed')) {
            setError('User is already a member of this club.');
          } else if (err2.message && err2.message.includes('User not found')) {
            setError('No user found with that username or email.');
          } else {
            setError(err2.message || 'Failed to add member');
          }
        }
      } else if (err.message && err.message.includes('Unique constraint failed')) {
        setError('User is already a member of this club.');
      } else {
        setError(err.message || 'Failed to add member');
      }
    } finally {
      setLoading(false);
    }
  };

  if (membersLoading) {
    return <div className="loading">Loading club management...</div>;
  }

  if (!data?.club) {
    return <div className="error">Failed to load club data</div>;
  }

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h3>Access Denied</h3>
        <p>You need admin privileges to manage this club.</p>
      </div>
    );
  }

  const club = data.club;

  return (
    <div className="club-management">
      <div className="management-header">
        <h2>Club Management</h2>
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('members')}
            className={`tab-button ${activeTab === 'members' ? 'active' : ''}`}
          >
            Members ({club.members?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          >
            Settings
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {activeTab === 'members' && (
        <div className="members-section">
          <h3>Club Members</h3>
          <form onSubmit={handleAddMember} style={{ marginBottom: 24, display: 'flex', gap: 8, position: 'relative' }}>
            <input
              type="text"
              placeholder="Enter username or email"
              value={addInput}
              onChange={handleAddInputChange}
              required
              disabled={loading}
              style={{ flex: 1 }}
              autoComplete="off"
              onFocus={() => addInput.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            <button type="submit" className="btn-save" disabled={loading || !addInput}>
              {loading ? 'Adding...' : 'Add Member'}
            </button>
            {showSuggestions && userSearchData?.userSearch?.length > 0 && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                zIndex: 10,
                maxHeight: 200,
                overflowY: 'auto',
                margin: 0,
                padding: 0,
                listStyle: 'none',
              }}>
                {userSearchData.userSearch.map((user: any) => (
                  <li
                    key={user.id}
                    style={{ padding: 8, cursor: 'pointer' }}
                    onMouseDown={() => handleSuggestionClick(user)}
                  >
                    <strong>{user.username}</strong> <span style={{ color: '#718096' }}>({user.email})</span>
                    {user.firstName || user.lastName ? (
                      <span style={{ color: '#718096', marginLeft: 8 }}>
                        {user.firstName} {user.lastName}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </form>
          <div className="members-list">
            {club.members?.length === 0 ? (
              <div className="empty-state">
                <p>No members found</p>
              </div>
            ) : (
              club.members?.map((member: any) => (
                <div key={member.id} className="member-card">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.user.firstName?.[0] || member.user.username?.[0] || 'U'}
                    </div>
                    <div className="member-details">
                      <h4>{member.user.username}</h4>
                      <p>{member.user.email}</p>
                      <span className="member-name">
                        {member.user.firstName} {member.user.lastName}
                      </span>
                      <span className="member-joined">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="member-actions">
                    <div className="role-selector">
                      {editingMember === member.id ? (
                        <div className="role-edit">
                          <select
                            defaultValue={member.role}
                            onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                            disabled={loading}
                          >
                            <option value="MEMBER">Member</option>
                            <option value="MODERATOR">Moderator</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                          <button
                            onClick={() => setEditingMember(null)}
                            className="btn-cancel-role"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="role-display">
                          <span className={`role-badge ${member.role.toLowerCase()}`}>
                            {member.role}
                          </span>
                          {member.user.id !== user?.id && (
                            <button
                              onClick={() => setEditingMember(member.id)}
                              className="btn-edit-role"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {member.user.id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.user.username, member.user.id)}
                        className="btn-remove-member"
                        disabled={loading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="settings-section">
          <h3>Club Settings</h3>
          {!isEditingClub ? (
            <div className="club-info">
              <div className="info-group">
                <label>Club Name</label>
                <p>{club.name}</p>
              </div>
              <div className="info-group">
                <label>Description</label>
                <p>{club.description || 'No description'}</p>
              </div>
              <button
                onClick={() => setIsEditingClub(true)}
                className="btn-edit-club"
              >
                Edit Club
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateClub} className="edit-club-form">
              <div className="form-group">
                <label htmlFor="clubName">Club Name</label>
                <input
                  type="text"
                  id="clubName"
                  name="name"
                  value={clubForm.name}
                  onChange={handleClubFormChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="clubDescription">Description</label>
                <textarea
                  id="clubDescription"
                  name="description"
                  value={clubForm.description}
                  onChange={handleClubFormChange}
                  rows={4}
                  placeholder="Describe your club..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingClub(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Member Removal */}
      {confirmRemoval && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Member Removal</h3>
            <p>Are you sure you want to remove <strong>{confirmRemoval.username}</strong> from the club?</p>
            <div className="modal-actions">
              <button 
                onClick={confirmRemoveMember} 
                className="btn-danger"
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Remove Member'}
              </button>
              <button 
                onClick={() => setConfirmRemoval(null)} 
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement; 