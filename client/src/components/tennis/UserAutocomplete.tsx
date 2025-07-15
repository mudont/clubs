import { gql, useLazyQuery } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';

const USER_SEARCH = gql`
  query UserSearch($query: String!) {
    userSearch(query: $query) {
      id
      username
      email
      firstName
      lastName
    }
  }
`;

interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface UserAutocompleteProps {
  onChange: (userId: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const UserAutocomplete: React.FC<UserAutocompleteProps> = ({
  onChange,
  placeholder = 'Search for a user...',
  label,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, { data: userSearchData }] = useLazyQuery(USER_SEARCH);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      userSearch({ variables: { query } });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    // Clear selection if user is typing
    if (selectedUser) {
      setSelectedUser(null);
      onChange('');
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (user: User) => {
    setSelectedUser(user);
    setSearchQuery(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username);
    onChange(user.id);
    setShowSuggestions(false);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Get display value
  const getDisplayValue = () => {
    if (selectedUser) {
      return `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.username;
    }
    // If we have a value but no selectedUser, show the search query
    if (searchQuery) {
      return searchQuery;
    }
    return '';
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {showSuggestions && userSearchData?.userSearch && userSearchData.userSearch.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {userSearchData.userSearch.map((user: User) => (
              <div
                key={user.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(user)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSuggestionClick(user);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}`}
              >
                <div className="font-medium text-gray-900">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            ))}
          </div>
        )}
        {showSuggestions && userSearchData?.userSearch && userSearchData.userSearch.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-3 py-2 text-gray-500">No users found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAutocomplete;
