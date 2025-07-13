import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../store';
import { updateUser } from '../../store/authSlice';
import Header from '../common/Header';
import './UserProfile.css';

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      username
      email
      firstName
      lastName
      bio
      avatar
      createdAt
      emailVerified
    }
  }
`;

const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateUserInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      firstName
      lastName
      bio
      avatar
    }
  }
`;

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;

const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    bio: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const { data, loading: profileLoading, refetch } = useQuery(GET_USER_PROFILE, {
    skip: !user,
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);
  const [deleteUser] = useMutation(DELETE_USER);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (data?.me) {
      setFormData({
        username: data.me.username || '',
        firstName: data.me.firstName || '',
        lastName: data.me.lastName || '',
        bio: data.me.bio || '',
      });
    }
  }, [data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile({
        variables: {
          input: formData,
        },
      });

      // Update Redux store with new user data
      dispatch(updateUser(result.data.updateProfile));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        variables: {
          input: {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          },
        },
      });

      setSuccess('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data including:\n\n' +
      '• All your group memberships\n' +
      '• All your messages\n' +
      '• All your events and RSVPs\n' +
      '• Your profile information\n\n' +
      'This action is irreversible!'
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await deleteUser({
        variables: {
          userId: user?.id,
        },
      });

      setSuccess('Account deleted successfully. You will be logged out.');
      // Log out the user after a short delay
      setTimeout(() => {
        // Clear local storage and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!data?.me) {
    return <div className="error">Failed to load profile</div>;
  }

  const profile = data.me;

  return (
    <div className="user-profile">
      <Header title="Profile" showBackButton backTo="/dashboard" />
      <div className="profile-header">
        <h1>Profile</h1>
        <div className="profile-actions">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-edit"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="btn-change-password"
          >
            Change Password
          </button>
          <button
            onClick={handleDeleteAccount}
            className="btn-delete-account"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="profile-section">
          <div className="avatar-section">
            <div className="avatar">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">
                  {profile.firstName?.[0] || profile.username?.[0] || 'U'}
                </div>
              )}
            </div>
            <div className="email-status">
              <span className={`status ${profile.emailVerified ? 'verified' : 'unverified'}`}>
                {profile.emailVerified ? '✓ Verified' : '⚠ Unverified'}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <div className="profile-info">
              <div className="info-group">
                <label>Username</label>
                <p>{profile.username}</p>
              </div>
              <div className="info-group">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>
              <div className="info-group">
                <label>First Name</label>
                <p>{profile.firstName || 'Not set'}</p>
              </div>
              <div className="info-group">
                <label>Last Name</label>
                <p>{profile.lastName || 'Not set'}</p>
              </div>
              <div className="info-group">
                <label>Bio</label>
                <p>{profile.bio || 'No bio yet'}</p>
              </div>
              <div className="info-group">
                <label>Member Since</label>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {isChangingPassword && (
          <div className="password-section">
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                />
                <div className="password-requirements">
                  <small>Password must contain:</small>
                  <ul>
                    <li>At least 8 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One lowercase letter (a-z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (@$!%*?&)</li>
                  </ul>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
