import { useQuery, useMutation , gql } from '@apollo/client';
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { updateAuthToken } from '../apollo';
import { RootState } from '../store';
import { logout } from '../store/authSlice';

import ClubCard from './clubs/ClubCard';
import './Dashboard.css';

interface ClubMembership {
  id: string;
  isAdmin: boolean;
  memberId: string;
  user: {
    id: string;
    username: string;
  };
}

interface ClubData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  memberships?: ClubMembership[];
}

interface MyClubsData {
  myClubs: ClubData[];
}

interface CreateClubData {
  createClub: {
    id: string;
    name: string;
    description?: string;
  };
}

interface CreateClubInput {
  input: {
    name: string;
    description?: string;
  };
}

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

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const { data, loading: clubsLoading, refetch } = useQuery<MyClubsData>(GET_MY_CLUBS);
  const [createClub] = useMutation<CreateClubData, CreateClubInput>(CREATE_CLUB);

  // Memoize logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    dispatch(logout());
    updateAuthToken(null);
  }, [dispatch]);

  // Memoize create club handler
  const handleCreateClub = useCallback(async (e: React.FormEvent) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      setLoading(false);
    }
  }, [clubName, clubDescription, createClub, refetch]);

  // Note: clubStats could be used for displaying statistics in the future
  // const clubStats = useMemo(() => {
  //   if (!data?.myClubs) return { totalClubs: 0, totalMembers: 0 };
  //   
  //   const totalClubs = data.myClubs.length;
  //   const totalMembers = data.myClubs.reduce(
  //     (sum: number, club: ClubData) => sum + (club.memberships?.length || 0), 
  //     0
  //   );
  //   
  //   return { totalClubs, totalMembers };
  // }, [data?.myClubs]);

  return (
    <div className="dashboard">
      <header className="dashboard-header" role="banner">
        <div className="header-content">
          <h1 id="dashboard-title">My Clubs</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <nav className="user-actions" role="navigation" aria-label="User account">
              <Link 
                to="/profile" 
                className="btn-profile"
                aria-label="Go to user profile settings"
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn-logout"
                aria-label="Sign out of your account"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="dashboard-main" role="main" aria-labelledby="dashboard-title">
        <div className="dashboard-actions">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-create-club"
            aria-expanded={showCreateForm}
            aria-controls={showCreateForm ? "create-club-form" : undefined}
            aria-label={showCreateForm ? 'Cancel club creation' : 'Create a new club'}
          >
            {showCreateForm ? 'Cancel' : 'Create New Club'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-club-form" id="create-club-form" role="region" aria-labelledby="create-club-heading">
            <h3 id="create-club-heading">Create New Club</h3>
            {error && (
              <div className="error-message" role="alert" aria-live="polite">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateClub} noValidate>
              <div className="form-group">
                <label htmlFor="clubName">Club Name *</label>
                <input
                  type="text"
                  id="clubName"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  required
                  placeholder="Enter club name"
                  aria-describedby="clubName-description"
                  aria-invalid={error ? 'true' : 'false'}
                />
                <div id="clubName-description" className="field-description">
                  Choose a unique name for your club
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="clubDescription">Description</label>
                <textarea
                  id="clubDescription"
                  value={clubDescription}
                  onChange={(e) => setClubDescription(e.target.value)}
                  placeholder="Enter club description"
                  rows={3}
                  aria-describedby="clubDescription-description"
                />
                <div id="clubDescription-description" className="field-description">
                  Optional: Describe what your club is about
                </div>
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                aria-busy={loading}
                aria-describedby={loading ? "creating-status" : undefined}
              >
                {loading ? 'Creating...' : 'Create Club'}
              </button>
              {loading && (
                <div id="creating-status" className="sr-only" aria-live="polite">
                  Creating your club, please wait...
                </div>
              )}
            </form>
          </div>
        )}

        {clubsLoading ? (
          <div className="loading" role="status" aria-live="polite">
            <span className="sr-only">Loading your clubs, please wait...</span>
            Loading your clubs...
          </div>
        ) : (
          <section className="clubs-section" aria-labelledby="clubs-heading">
            <h2 id="clubs-heading" className="sr-only">Your Clubs List</h2>
            {data?.myClubs?.length === 0 ? (
              <div className="empty-state" role="region" aria-labelledby="empty-state-heading">
                <h3 id="empty-state-heading">No clubs yet</h3>
                <p>Create your first club to get started!</p>
              </div>
            ) : (
              <div
                className="clubs-grid"
                role="grid"
                aria-label={`${data?.myClubs?.length || 0} clubs available`}
              >
                                {data?.myClubs?.map((club) => (
                  <ClubCard 
                    key={club.id} 
                    club={club}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 