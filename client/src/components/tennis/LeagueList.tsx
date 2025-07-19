import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { CREATE_TENNIS_LEAGUE, DELETE_TENNIS_LEAGUE, GET_TENNIS_LEAGUES } from './graphql';
import TennisNavbar from './TennisNavbar';
import { CreateTennisLeagueData, CreateTennisLeagueInput, DeleteTennisLeagueData, GetTennisLeaguesData } from './types';

const LeagueList: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateTennisLeagueInput>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const { data, loading, error, refetch } = useQuery<GetTennisLeaguesData>(GET_TENNIS_LEAGUES);

  const [createLeague, { loading: creating }] = useMutation<CreateTennisLeagueData, { input: CreateTennisLeagueInput }>(
    CREATE_TENNIS_LEAGUE,
    {
      onCompleted: () => {
        setShowCreateForm(false);
        setFormData({ name: '', description: '', startDate: '', endDate: '', isActive: true });
        refetch();
      },
      onError: (error) => {
        console.error('Error creating league:', error);
        alert('Failed to create league. Please try again.');
      },
    }
  );

  const [deleteLeague] = useMutation<DeleteTennisLeagueData, { id: string }>(DELETE_TENNIS_LEAGUE, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting league:', error);
      alert('Failed to delete league. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert('Please fill in all required fields.');
      return;
    }
    createLeague({ variables: { input: formData } });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the league "${name}"? This action cannot be undone.`)) {
      deleteLeague({ variables: { id } });
    }
  };

  const formatDate = (dateString: string) => {
    // Handle timezone issues by treating the date as UTC and formatting it safely
    const date = new Date(dateString);
    // Use UTC methods to avoid timezone conversion issues
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  };

  if (loading) return <div className="text-center p-4">Loading tennis leagues...</div>;
  if (error) return <div className="text-red-500 p-4">Error loading leagues: {error.message}</div>;

  return (
    <div className="tennis-page">
      <TennisNavbar />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tennis Leagues</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New League
          </button>
        </div>

        {/* Create League Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Tennis League</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  League Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active League
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {creating ? 'Creating...' : 'Create League'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Leagues List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.tennisLeagues.map((league) => (
            <div key={league.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{league.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    league.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {league.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {league.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{league.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium">{formatDate(league.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">End Date:</span>
                  <span className="font-medium">{formatDate(league.endDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Teams:</span>
                  <span className="font-medium">{league.teams.length}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/tennis/leagues/${league.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-lg transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(league.id, league.name)}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors"
                  title="Delete League"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {data?.tennisLeagues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎾</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Tennis Leagues Yet</h3>
            <p className="text-gray-600 mb-4">Create your first tennis league to get started!</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Your First League
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueList;
