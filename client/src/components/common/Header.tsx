import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import './Header.css';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, backTo = '/dashboard', children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {showBackButton && (
          <Link to={backTo} className="btn-back">
            ← Back
          </Link>
        )}
        <h1>{title}</h1>
        {children}
      </div>

      <div className="header-right">
        <div className="user-info">
          <span className="username">{user?.username || 'User'}</span>
          <Link to="/profile" className="btn-profile">Profile</Link>
          <button type="button" onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
