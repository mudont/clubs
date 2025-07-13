import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { RootState } from '../../store';
import './GroupCard.css';

const LEAVE_GROUP = gql`
  mutation LeaveGroup($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`;

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
  description?: string;
  createdAt: string;
  memberships?: GroupMembership[];
}

interface GroupCardProps {
  group: Group;
  onGroupLeft?: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onGroupLeft }) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [leaveGroup] = useMutation(LEAVE_GROUP);

  const memberCount = group.memberships?.length || 0;
  const adminCount = group.memberships?.filter(m => m.isAdmin).length || 0;

  // Check if current user is a member and their role
  const userMembership = group.memberships?.find(m => m.user.id === user?.id);
  const isMember = !!userMembership;
  const isAdmin = userMembership?.isAdmin || false;
  const isOnlyAdmin = isAdmin && adminCount === 1;

  const handleLeaveGroup = async () => {
    setLoading(true);
    setError('');

    try {
      await leaveGroup({
        variables: { groupId: group.id },
      });

      setShowLeaveConfirm(false);
      if (onGroupLeft) {
        onGroupLeft();
      } else {
        // Redirect to dashboard if no callback provided
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="group-card" role="listitem">
      <div className="group-card-content">
        <header className="group-card-header">
          <h3 className="group-name">
            <Link to={`/group/${group.id}`} className="group-link">
              {group.name}
            </Link>
          </h3>
          <div className="group-meta">
            <span className="member-count">
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </span>
            {adminCount > 0 && (
              <span className="admin-count">
                {adminCount} admin{adminCount !== 1 ? 's' : ''}
              </span>
            )}
            {isMember && (
              <span className={`user-role ${isAdmin ? 'admin' : 'member'}`}>
                {isAdmin ? 'Admin' : 'Member'}
              </span>
            )}
          </div>
        </header>

        {group.description && (
          <p className="group-description">{group.description}</p>
        )}

        <footer className="group-card-footer">
          <time dateTime={group.createdAt} className="created-date">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </time>
          <div className="group-actions">
            <Link
              to={`/group/${group.id}`}
              className="btn-view-group"
              aria-label={`View details for ${group.name}`}
            >
              View Group
            </Link>
            {isMember && !isOnlyAdmin && (
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="btn-leave-group"
                disabled={loading}
              >
                Leave Group
              </button>
            )}
            {isOnlyAdmin && (
              <span className="only-admin-notice" title="You cannot leave as the only admin">
                Only Admin
              </span>
            )}
          </div>
        </footer>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Leave Group</h3>
            <p>Are you sure you want to leave "{group.name}"?</p>
            {error && <div className="error-message">{error}</div>}
            <div className="modal-actions">
              <button
                onClick={handleLeaveGroup}
                disabled={loading}
                className="btn-confirm-leave"
              >
                {loading ? 'Leaving...' : 'Leave Group'}
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                disabled={loading}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default GroupCard;
