import { useLazyQuery } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';

import { GROUP_SEARCH } from './graphql';


interface Group {
  id: string;
  name: string;
  description?: string;
}

interface GroupAutocompleteProps {
  onChange: (groupId: string, group?: Group) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const GroupAutocomplete: React.FC<GroupAutocompleteProps> = ({
  onChange,
  placeholder = 'Search for a group...',
  label,
  required = false,
  disabled = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupSearch, { data: groupSearchData }] = useLazyQuery(GROUP_SEARCH);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      groupSearch({ variables: { query } });
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    if (selectedGroup) {
      setSelectedGroup(null);
      onChange('');
    }
  };

  const handleSuggestionClick = (group: Group) => {
    setSelectedGroup(group);
    setSearchQuery(group.name);
    onChange(group.id, group);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const getDisplayValue = () => {
    if (selectedGroup) {
      return selectedGroup.name;
    }
    return searchQuery;
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
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {showSuggestions && groupSearchData?.publicGroups && groupSearchData.publicGroups.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {groupSearchData.publicGroups.map((group: Group) => (
              <div
                key={group.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(group)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSuggestionClick(group);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${group.name}`}
              >
                <div className="font-medium text-gray-900">{group.name}</div>
                {group.description && (
                  <div className="text-sm text-gray-500">{group.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {showSuggestions && groupSearchData?.publicGroups && groupSearchData.publicGroups.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-3 py-2 text-gray-500">No groups found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupAutocomplete;
