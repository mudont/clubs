import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import EventList from '../events/EventList';
import ChatRoom from '../chat/ChatRoom';
import ClubManagement from './ClubManagement';
import './ClubDetail.css';

const GET_CLUB = gql`
  query GetClub($id: ID!) {
    club(id: $id) {
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
          email
        }
      }
    }
  }
`;

const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'chat' | 'management'>('overview');
  const { user } = useSelector((state: RootState) => state.auth);
  
  const { data, loading, error } = useQuery(GET_CLUB, {
    variables: { id },
  });

  if (loading) {
    return (
      <div className="club-detail">
        <div className="loading">Loading club details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="club-detail">
        <div className="error-message">Error loading club: {error.message}</div>
      </div>
    );
  }

  const club = data?.club;

  if (!club) {
    return (
      <div className="club-detail">
        <div className="error-message">Club not found</div>
      </div>
    );
  }

  const isMember = club.memberships?.some((membership: any) => membership.user.id === user?.id);
  const isAdmin = club.memberships?.some((membership: any) => 
    membership.user.id === user?.id && membership.isAdmin
  );

  return (
    <div className="club-detail">
      <header className="club-header">
        <div className="header-content">
          <div className="back-link">
            <Link to="/dashboard" className="btn-back">
              ← Back to Dashboard
            </Link>
          </div>
          <h1>{club.name}</h1>
          <div className="club-meta">
            <span className="member-count">
              {club.memberships?.length || 0} members
            </span>
          </div>
        </div>
      </header>

      <main className="club-main">
        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          >
            Chat
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('management')}
              className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
            >
              Management
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="club-info">
              <div className="info-card">
                <h3>About</h3>
                <p>{club.description || 'No description available.'}</p>
                <p className="created-date">
                  Created on {new Date(club.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="members-card">
                <h3>Members</h3>
                <div className="members-list">
                  {club.memberships?.map((membership: any) => (
                    <div key={membership.id} className="member-item">
                      <div className="member-info">
                        <span className="member-name">{membership.user.username}</span>
                        <span className="member-id">#{membership.memberId}</span>
                      </div>
                      <div className="member-badges">
                        {membership.isAdmin && (
                          <span className="badge admin">Admin</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <EventList clubId={club.id} />
          )}

          {activeTab === 'chat' && (
            <ChatRoom clubId={club.id} />
          )}

          {activeTab === 'management' && isAdmin && (
            <ClubManagement clubId={club.id} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubDetail; 