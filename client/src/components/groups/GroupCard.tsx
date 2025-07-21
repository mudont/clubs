import { useMutation } from '@apollo/client';
import { LEAVE_GROUP } from 'graphql/Group';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { RootState } from '../../store';
import './GroupCard.css';

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
  const [error, setError] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const [leaveGroup] = useMutation(LEAVE_GROUP);

  const isMember = group.memberships?.some((m) => m.user.id === user?.id);
  const isAdmin = group.memberships?.some((m) => m.user.id === user?.id && m.isAdmin);

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
        <div className="group-info">
          <div className="group-title-row">
            <h3>
              <Link to={`/group/${group.id}`} className="group-link">
                {group.name}
              </Link>
            </h3>
            <div className="card-badges">
              {isMember && isAdmin && <span className="admin-badge" title="You are an admin">👑</span>}
              <span className="member-count">👥 {group.memberships?.length || 0}</span>
            </div>
          </div>
          <p className="group-description">{group.description}</p>
        </div>
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
