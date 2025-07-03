import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { logout } from '../store/authSlice';
import { updateAuthToken } from '../apollo';
import './Dashboard.css';

const GET_MY_CLUBS = gql`
  query GetMyClubs {
    myClubs {
      id
      name
      description
      createdAt
      memberships {
        id
        isAdmin
        memberId
        user {
          id
          username
        }
      }
    }
  }
`;

const CREATE_CLUB = gql`
  mutation CreateClub($input: CreateClubInput!) {
    createClub(input: $input) {
      id
      name
      description
    }
  }
`;

const Dashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data, loading: clubsLoading, refetch } = useQuery(GET_MY_CLUBS);
  const [createClub] = useMutation(CREATE_CLUB);

  const handleLogout = () => {
    dispatch(logout());
    updateAuthToken(null);
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createClub({
        variables: {
          input: {
            name: clubName,
            description: clubDescription,
          },
        },
      });

      setClubName('');
      setClubDescription('');
      setShowCreateForm(false);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Clubs</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <div className="user-actions">
              <Link to="/profile" className="btn-profile">
                Profile
              </Link>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-actions">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-create-club"
          >
            {showCreateForm ? 'Cancel' : 'Create New Club'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-club-form">
            <h3>Create New Club</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleCreateClub}>
              <div className="form-group">
                <label htmlFor="clubName">Club Name</label>
                <input
                  type="text"
                  id="clubName"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                  placeholder="Enter club name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="clubDescription">Description</label>
                <textarea
                  id="clubDescription"
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                  placeholder="Enter club description"
                  rows={3}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Club'}
              </button>
            </form>
          </div>
        )}

        {clubsLoading ? (
          <div className="loading">Loading your clubs...</div>
        ) : (
          <div className="clubs-grid">
            {data?.myClubs?.length === 0 ? (
              <div className="empty-state">
                <h3>No clubs yet</h3>
                <p>Create your first club to get started!</p>
              </div>
            ) : (
              data?.myClubs?.map((club: any) => (
                <div key={club.id} className="club-card">
                  <div className="club-header">
                    <h3>{club.name}</h3>
                    <span className="member-count">
                      {club.memberships?.length || 0} members
                    </span>
                  </div>
                  {club.description && (
                    <p className="club-description">{club.description}</p>
                  )}
                  <div className="club-actions">
                    <Link to={`/club/${club.id}`} className="btn-view">
                      View Club
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 