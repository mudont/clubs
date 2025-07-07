import React from 'react';
import { Link } from 'react-router-dom';

interface ClubMembership {
  id: string;
  isAdmin: boolean;
  memberId: string;
  user: {
    id: string;
    username: string;
  };
}

interface Club {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  memberships?: ClubMembership[];
}

interface ClubCardProps {
  club: Club;
  className?: string;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, className = '' }) => {
  const memberCount = club.memberships?.length || 0;
  
  return (
    <article 
      className={`club-card ${className}`}
      role="gridcell"
      aria-labelledby={`club-title-${club.id}`}
      aria-describedby={`club-description-${club.id}`}
    >
      <div className="club-header">
        <h3 id={`club-title-${club.id}`}>{club.name}</h3>
        <span 
          className="member-count"
          aria-label={`${memberCount} members in this club`}
        >
          {memberCount} members
        </span>
      </div>
      
      {club.description && (
        <p 
          className="club-description" 
          id={`club-description-${club.id}`}
        >
          {club.description}
        </p>
      )}
      
      <div className="club-actions">
        <Link 
          to={`/club/${club.id}`} 
          className="btn-view"
          aria-label={`View details for ${club.name} club`}
        >
          View Club
        </Link>
      </div>
    </article>
  );
};

// Memoize component with custom comparison function
export default React.memo(ClubCard, (prevProps, nextProps) => {
  // Only re-render if club data has actually changed
  return (
    prevProps.club.id === nextProps.club.id &&
    prevProps.club.name === nextProps.club.name &&
    prevProps.club.description === nextProps.club.description &&
    prevProps.club.memberships?.length === nextProps.club.memberships?.length &&
    prevProps.className === nextProps.className
  );
}); 