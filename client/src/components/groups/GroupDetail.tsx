import { gql, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState } from '../../store';
import ChatRoom from '../chat/ChatRoom';
import Header from '../common/Header';
import EventList from '../events/EventList';

import './GroupDetail.css';
import GroupManagement from './GroupManagement';

const GET_GROUP = gql`
  query GetGroup($id: ID!) {
    group(id: $id) {
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

const GroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  // Get initial tab from URL hash or default to 'overview'
  const getInitialTab = (): 'overview' | 'events' | 'chat' | 'management' => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['overview', 'events', 'chat', 'management'];
    // Ignore management-specific hashes (mgmt-*)
    if (hash.startsWith('mgmt-')) {
      return 'management';
    }
    return validTabs.includes(hash) ? (hash as any) : 'overview';
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'chat' | 'management'>(getInitialTab);

  // Update URL hash when tab changes
  const handleTabChange = (tab: 'overview' | 'events' | 'chat' | 'management') => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Listen for hash changes (back/forward browser buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getInitialTab();
      setActiveTab(newTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { data, loading, error } = useQuery(GET_GROUP, {
    variables: { id },
  });

  if (loading) {
    return (
      <div className="group-detail">
        <div className="loading">Loading group details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-detail">
        <div className="error-message">Error loading group: {error.message}</div>
      </div>
    );
  }

  const group = data?.group;

  if (!group) {
    return (
      <div className="group-detail">
        <div className="error-message">Group not found</div>
      </div>
    );
  }

  const isAdmin = group.memberships?.some((membership: { user: { id: string }; isAdmin: boolean }) =>
    membership.user.id === user?.id && membership.isAdmin
  );

  return (
    <div className="group-detail">
      <Header title={group.name} showBackButton backTo="/dashboard">
        <span className="member-count">
          {group.memberships?.length || 0} members
        </span>
      </Header>

      <main className="group-main">
        <div className="tab-navigation">
          <button
            onClick={() => handleTabChange('overview')}
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('events')}
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          >
            Events
          </button>
          <button
            onClick={() => handleTabChange('chat')}
            className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          >
            Chat
          </button>
          {isAdmin && (
            <button
              onClick={() => handleTabChange('management')}
              className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
            >
              Management
            </button>
          )}
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="group-info">
              <div className="info-card">
                <h3>About</h3>
                <p>{group.description || 'No description available.'}</p>
                <p className="created-date">
                  Created on {new Date(group.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="members-card">
                <h3>Members</h3>
                <div className="members-list">
                  {group.memberships?.map((membership: { id: string; user: { username: string }; memberId: number; isAdmin: boolean }) => (
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
            <EventList groupId={group.id} />
          )}

          {activeTab === 'chat' && (
            <ChatRoom groupId={group.id} />
          )}

          {activeTab === 'management' && isAdmin && (
            <GroupManagement groupId={group.id} />
          )}
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
