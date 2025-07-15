import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import './TennisNavbar.css';

const TennisNavbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/tennis/leagues', label: 'Leagues', icon: '🏆' },
    { path: '/tennis/teams', label: 'Teams', icon: '👥' },
    { path: '/tennis/matches', label: 'Matches', icon: '🎾' },
    { path: '/tennis/standings', label: 'Standings', icon: '📈' },
  ];

  const isActive = (path: string) => {
    if (path === '/tennis/leagues') {
      return location.pathname === '/tennis/leagues' || location.pathname.startsWith('/tennis/leagues/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="tennis-navbar">
      <div className="tennis-navbar-container">
        <div className="tennis-navbar-brand">
          <Link to="/tennis/leagues" className="tennis-navbar-logo">
            🎾 Tennis
          </Link>
        </div>

        <div className="tennis-navbar-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`tennis-navbar-item ${
                isActive(item.path) ? 'tennis-navbar-item-active' : ''
              }`}
            >
              <span className="tennis-navbar-icon">{item.icon}</span>
              <span className="tennis-navbar-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="tennis-navbar-actions">
          <Link to="/dashboard" className="tennis-navbar-back">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default TennisNavbar;
