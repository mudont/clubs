import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';

import { CREATE_TEAM_MATCH, DELETE_TEAM_MATCH, GET_TENNIS_LEAGUE, UPDATE_TEAM_MATCH } from './graphql';
import { CreateTeamMatchData, CreateTeamMatchInput, DeleteTeamMatchData, TeamLeagueTeamMatch, UpdateTeamMatchData, UpdateTeamMatchInput } from './types';

interface TeamMatchListProps {
  leagueId: string;
  matches: TeamLeagueTeamMatch[];
}

const TeamMatchList: React.FC<TeamMatchListProps> = ({ leagueId, matches }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<TeamLeagueTeamMatch | null>(null);
  const [formData, setFormData] = useState<CreateTeamMatchInput>({
    homeTeamId: '',
    awayTeamId: '',
    matchDate: '',
    homeScore: undefined,
    awayScore: undefined,
    isCompleted: false,
  });

  const { data: leagueData } = useQuery(GET_TENNIS_LEAGUE, { variables: { id: leagueId } });
  const { refetch } = useQuery(GET_TENNIS_LEAGUE, { variables: { id: leagueId } });

  const [createMatch, { loading: creating }] = useMutation<CreateTeamMatchData, { leagueId: string; input: CreateTeamMatchInput }>(
    CREATE_TEAM_MATCH,
    {
      onCompleted: () => {
        setShowCreateForm(false);
        setFormData({ homeTeamId: '', awayTeamId: '', matchDate: '', homeScore: undefined, awayScore: undefined, isCompleted: false });
        refetch();
      },
      onError: (error) => {
        console.error('Error creating match:', error);
        alert('Failed to create match. Please try again.');
      },
    }
  );

  const [updateMatch, { loading: updating }] = useMutation<UpdateTeamMatchData, { id: string; input: UpdateTeamMatchInput }>(
    UPDATE_TEAM_MATCH,
    {
      onCompleted: () => {
        setEditingMatch(null);
        setFormData({ homeTeamId: '', awayTeamId: '', matchDate: '', homeScore: undefined, awayScore: undefined, isCompleted: false });
        refetch();
      },
      onError: (error) => {
        console.error('Error updating match:', error);
        alert('Failed to update match. Please try again.');
      },
    }
  );

  const [deleteMatch] = useMutation<DeleteTeamMatchData, { id: string }>(DELETE_TEAM_MATCH, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting match:', error);
      alert('Failed to delete match. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.homeTeamId || !formData.awayTeamId || !formData.matchDate) {
      alert('Please fill in all required fields.');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      alert('Home and away teams cannot be the same.');
      return;
    }

    if (editingMatch) {
      updateMatch({ variables: { id: editingMatch.id, input: formData } });
    } else {
      createMatch({ variables: { leagueId, input: formData } });
    }
  };

  const handleEdit = (match: TeamLeagueTeamMatch) => {
    setEditingMatch(match);
    setFormData({
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      matchDate: match.matchDate.split('T')[0], // Convert to date input format
      homeScore: match.homeScore || undefined,
      awayScore: match.awayScore || undefined,
      isCompleted: match.isCompleted,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      deleteMatch({ variables: { id } });
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingMatch(null);
    setFormData({ homeTeamId: '', awayTeamId: '', matchDate: '', homeScore: undefined, awayScore: undefined, isCompleted: false });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getMatchResult = (match: TeamLeagueTeamMatch) => {
    if (!match.isCompleted || match.homeScore === undefined || match.awayScore === undefined) {
      return 'Scheduled';
    }

    if (match.homeScore > match.awayScore) {
      return `${match.homeTeam.group.name} wins`;
    } else if (match.awayScore > match.homeScore) {
      return `${match.awayTeam.group.name} wins`;
    } else {
      return 'Draw';
    }
  };

  const teams = leagueData?.tennisLeague?.teams || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Team Matches</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Match
        </button>
      </div>

      {/* Create/Edit Match Form */}
      {(showCreateForm || editingMatch) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingMatch ? 'Edit Match' : 'Create New Match'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Team *
                </label>
                <select
                  value={formData.homeTeamId}
                  onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select home team</option>
                  {teams.map((team: { id: string; group: { id: string; name: string } }) => (
                    <option key={team.id} value={team.id}>
                      {team.group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Away Team *
                </label>
                <select
                  value={formData.awayTeamId}
                  onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select away team</option>
                  {teams.map((team: { id: string; group: { id: string; name: string } }) => (
                    <option key={team.id} value={team.id}>
                      {team.group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Date *
              </label>
              <input
                type="date"
                value={formData.matchDate}
                onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.homeScore || ''}
                  onChange={(e) => setFormData({ ...formData, homeScore: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Away Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.awayScore || ''}
                  onChange={(e) => setFormData({ ...formData, awayScore: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCompleted"
                  checked={formData.isCompleted}
                  onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-900">
                  Match Completed
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || updating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {creating || updating ? 'Saving...' : (editingMatch ? 'Update Match' : 'Create Match')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold">
                    {match.homeTeam.group.name} vs {match.awayTeam.group.name}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      match.isCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {match.isCompleted ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(match.matchDate)}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(match)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Match"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(match.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Match"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {match.homeScore !== undefined ? match.homeScore : '-'}
                </div>
                <div className="text-sm text-gray-600">{match.homeTeam.group.name}</div>
              </div>
              <div className="text-center flex items-center justify-center">
                <div className="text-lg font-medium text-gray-500">vs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {match.awayScore !== undefined ? match.awayScore : '-'}
                </div>
                <div className="text-sm text-gray-600">{match.awayTeam.group.name}</div>
              </div>
            </div>

            {match.isCompleted && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700">Result: </span>
                  <span className="text-sm font-semibold text-gray-900">{getMatchResult(match)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Team Matches Yet</h3>
          <p className="text-gray-600 mb-4">Create your first team match to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First Match
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamMatchList;
