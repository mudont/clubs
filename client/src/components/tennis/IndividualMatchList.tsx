import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';

import { CREATE_INDIVIDUAL_DOUBLES_MATCH, CREATE_INDIVIDUAL_SINGLES_MATCH, DELETE_INDIVIDUAL_DOUBLES_MATCH, DELETE_INDIVIDUAL_SINGLES_MATCH, GET_TENNIS_LEAGUE, UPDATE_INDIVIDUAL_DOUBLES_MATCH, UPDATE_INDIVIDUAL_SINGLES_MATCH } from './graphql';
import { CreateIndividualDoublesMatchData, CreateIndividualDoublesMatchInput, CreateIndividualSinglesMatchData, CreateIndividualSinglesMatchInput, DeleteIndividualDoublesMatchData, DeleteIndividualSinglesMatchData, IndividualDoublesMatch, IndividualSinglesMatch, UpdateIndividualDoublesMatchData, UpdateIndividualDoublesMatchInput, UpdateIndividualSinglesMatchData, UpdateIndividualSinglesMatchInput } from './types';

interface IndividualMatchListProps {
  teamMatchId: string;
  matches: IndividualSinglesMatch[] | IndividualDoublesMatch[];
  matchType: 'singles' | 'doubles';
}

const IndividualMatchList: React.FC<IndividualMatchListProps> = ({ teamMatchId, matches, matchType }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<IndividualSinglesMatch | IndividualDoublesMatch | null>(null);

  // Form data for singles matches
  const [singlesFormData, setSinglesFormData] = useState<CreateIndividualSinglesMatchInput>({
    player1Id: '',
    player2Id: '',
    matchDate: '',
    player1Score: undefined,
    player2Score: undefined,
    isCompleted: false,
    teamMatchId,
  });

  // Form data for doubles matches
  const [doublesFormData, setDoublesFormData] = useState<CreateIndividualDoublesMatchInput>({
    team1Player1Id: '',
    team1Player2Id: '',
    team2Player1Id: '',
    team2Player2Id: '',
    matchDate: '',
    team1Score: undefined,
    team2Score: undefined,
    isCompleted: false,
    teamMatchId,
  });

  const { data: leagueData } = useQuery(GET_TENNIS_LEAGUE, { variables: { id: teamMatchId } });
  const { refetch } = useQuery(GET_TENNIS_LEAGUE, { variables: { id: teamMatchId } });

  // Singles mutations
  const [createSinglesMatch, { loading: creatingSingles }] = useMutation<CreateIndividualSinglesMatchData, { input: CreateIndividualSinglesMatchInput }>(
    CREATE_INDIVIDUAL_SINGLES_MATCH,
    {
      onCompleted: () => {
        setShowCreateForm(false);
        setSinglesFormData({ player1Id: '', player2Id: '', matchDate: '', player1Score: undefined, player2Score: undefined, isCompleted: false, teamMatchId });
        refetch();
      },
      onError: (error) => {
        console.error('Error creating singles match:', error);
        alert('Failed to create match. Please try again.');
      },
    }
  );

  const [updateSinglesMatch, { loading: updatingSingles }] = useMutation<UpdateIndividualSinglesMatchData, { id: string; input: UpdateIndividualSinglesMatchInput }>(
    UPDATE_INDIVIDUAL_SINGLES_MATCH,
    {
      onCompleted: () => {
        setEditingMatch(null);
        setSinglesFormData({ player1Id: '', player2Id: '', matchDate: '', player1Score: undefined, player2Score: undefined, isCompleted: false, teamMatchId });
        refetch();
      },
      onError: (error) => {
        console.error('Error updating singles match:', error);
        alert('Failed to update match. Please try again.');
      },
    }
  );

  const [deleteSinglesMatch] = useMutation<DeleteIndividualSinglesMatchData, { id: string }>(DELETE_INDIVIDUAL_SINGLES_MATCH, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting singles match:', error);
      alert('Failed to delete match. Please try again.');
    },
  });

  // Doubles mutations
  const [createDoublesMatch, { loading: creatingDoubles }] = useMutation<CreateIndividualDoublesMatchData, { input: CreateIndividualDoublesMatchInput }>(
    CREATE_INDIVIDUAL_DOUBLES_MATCH,
    {
      onCompleted: () => {
        setShowCreateForm(false);
        setDoublesFormData({ team1Player1Id: '', team1Player2Id: '', team2Player1Id: '', team2Player2Id: '', matchDate: '', team1Score: undefined, team2Score: undefined, isCompleted: false, teamMatchId });
        refetch();
      },
      onError: (error) => {
        console.error('Error creating doubles match:', error);
        alert('Failed to create match. Please try again.');
      },
    }
  );

  const [updateDoublesMatch, { loading: updatingDoubles }] = useMutation<UpdateIndividualDoublesMatchData, { id: string; input: UpdateIndividualDoublesMatchInput }>(
    UPDATE_INDIVIDUAL_DOUBLES_MATCH,
    {
      onCompleted: () => {
        setEditingMatch(null);
        setDoublesFormData({ team1Player1Id: '', team1Player2Id: '', team2Player1Id: '', team2Player2Id: '', matchDate: '', team1Score: undefined, team2Score: undefined, isCompleted: false, teamMatchId });
        refetch();
      },
      onError: (error) => {
        console.error('Error updating doubles match:', error);
        alert('Failed to update match. Please try again.');
      },
    }
  );

  const [deleteDoublesMatch] = useMutation<DeleteIndividualDoublesMatchData, { id: string }>(DELETE_INDIVIDUAL_DOUBLES_MATCH, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting doubles match:', error);
      alert('Failed to delete match. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (matchType === 'singles') {
      if (!singlesFormData.player1Id || !singlesFormData.player2Id || !singlesFormData.matchDate) {
        alert('Please fill in all required fields.');
        return;
      }

      if (singlesFormData.player1Id === singlesFormData.player2Id) {
        alert('Player 1 and Player 2 cannot be the same.');
        return;
      }

      if (editingMatch) {
        updateSinglesMatch({ variables: { id: editingMatch.id, input: singlesFormData } });
      } else {
        createSinglesMatch({ variables: { input: singlesFormData } });
      }
    } else {
      if (!doublesFormData.team1Player1Id || !doublesFormData.team1Player2Id || !doublesFormData.team2Player1Id || !doublesFormData.team2Player2Id || !doublesFormData.matchDate) {
        alert('Please fill in all required fields.');
        return;
      }

      const team1Players = [doublesFormData.team1Player1Id, doublesFormData.team1Player2Id];
      const team2Players = [doublesFormData.team2Player1Id, doublesFormData.team2Player2Id];

      if (new Set([...team1Players, ...team2Players]).size !== 4) {
        alert('All players must be different.');
        return;
      }

      if (editingMatch) {
        updateDoublesMatch({ variables: { id: editingMatch.id, input: doublesFormData } });
      } else {
        createDoublesMatch({ variables: { input: doublesFormData } });
      }
    }
  };

  const handleEdit = (match: IndividualSinglesMatch | IndividualDoublesMatch) => {
    setEditingMatch(match);

    if (matchType === 'singles') {
      const singlesMatch = match as IndividualSinglesMatch;
      setSinglesFormData({
        player1Id: singlesMatch.player1Id,
        player2Id: singlesMatch.player2Id,
        matchDate: singlesMatch.matchDate.split('T')[0],
        player1Score: singlesMatch.player1Score || undefined,
        player2Score: singlesMatch.player2Score || undefined,
        isCompleted: singlesMatch.isCompleted,
        teamMatchId,
      });
    } else {
      const doublesMatch = match as IndividualDoublesMatch;
      setDoublesFormData({
        team1Player1Id: doublesMatch.team1Player1Id,
        team1Player2Id: doublesMatch.team1Player2Id,
        team2Player1Id: doublesMatch.team2Player1Id,
        team2Player2Id: doublesMatch.team2Player2Id,
        matchDate: doublesMatch.matchDate.split('T')[0],
        team1Score: doublesMatch.team1Score || undefined,
        team2Score: doublesMatch.team2Score || undefined,
        isCompleted: doublesMatch.isCompleted,
        teamMatchId,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      if (matchType === 'singles') {
        deleteSinglesMatch({ variables: { id } });
      } else {
        deleteDoublesMatch({ variables: { id } });
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingMatch(null);
    setSinglesFormData({ player1Id: '', player2Id: '', matchDate: '', player1Score: undefined, player2Score: undefined, isCompleted: false, teamMatchId });
    setDoublesFormData({ team1Player1Id: '', team1Player2Id: '', team2Player1Id: '', team2Player2Id: '', matchDate: '', team1Score: undefined, team2Score: undefined, isCompleted: false, teamMatchId });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getMatchResult = (match: IndividualSinglesMatch | IndividualDoublesMatch) => {
    if (matchType === 'singles') {
      const singlesMatch = match as IndividualSinglesMatch;
      if (!singlesMatch.isCompleted || singlesMatch.player1Score === undefined || singlesMatch.player2Score === undefined) {
        return 'Scheduled';
      }

      if (singlesMatch.player1Score > singlesMatch.player2Score) {
        return `${singlesMatch.player1.firstName} ${singlesMatch.player1.lastName} wins`;
      } else if (singlesMatch.player2Score > singlesMatch.player1Score) {
        return `${singlesMatch.player2.firstName} ${singlesMatch.player2.lastName} wins`;
      } else {
        return 'Draw';
      }
    } else {
      const doublesMatch = match as IndividualDoublesMatch;
      if (!doublesMatch.isCompleted || doublesMatch.team1Score === undefined || doublesMatch.team2Score === undefined) {
        return 'Scheduled';
      }

      if (doublesMatch.team1Score > doublesMatch.team2Score) {
        return 'Team 1 wins';
      } else if (doublesMatch.team2Score > doublesMatch.team1Score) {
        return 'Team 2 wins';
      } else {
        return 'Draw';
      }
    }
  };

  const getAllPlayers = () => {
    const players: { id: string; name: string }[] = [];
    leagueData?.tennisLeague?.teams.forEach((team: { members: { id: string; firstName: string; lastName: string }[] }) => {
      team.members.forEach(member => {
        if (!players.find(p => p.id === member.id)) {
          players.push({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`
          });
        }
      });
    });
    return players;
  };

  const players = getAllPlayers();
  const loading = creatingSingles || updatingSingles || creatingDoubles || updatingDoubles;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {matchType === 'singles' ? 'Singles Matches' : 'Doubles Matches'}
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add {matchType === 'singles' ? 'Singles' : 'Doubles'} Match
        </button>
      </div>

      {/* Create/Edit Match Form */}
      {(showCreateForm || editingMatch) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingMatch ? 'Edit Match' : `Create New ${matchType === 'singles' ? 'Singles' : 'Doubles'} Match`}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {matchType === 'singles' ? (
              // Singles form
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Player 1 *
                    </label>
                    <select
                      value={singlesFormData.player1Id}
                      onChange={(e) => setSinglesFormData({ ...singlesFormData, player1Id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select player 1</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Player 2 *
                    </label>
                    <select
                      value={singlesFormData.player2Id}
                      onChange={(e) => setSinglesFormData({ ...singlesFormData, player2Id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select player 2</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Player 1 Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={singlesFormData.player1Score || ''}
                      onChange={(e) => setSinglesFormData({ ...singlesFormData, player1Score: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Player 2 Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={singlesFormData.player2Score || ''}
                      onChange={(e) => setSinglesFormData({ ...singlesFormData, player2Score: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCompleted"
                      checked={singlesFormData.isCompleted}
                      onChange={(e) => setSinglesFormData({ ...singlesFormData, isCompleted: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-900">
                      Match Completed
                    </label>
                  </div>
                </div>
              </>
            ) : (
              // Doubles form
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 1 Player 1 *
                    </label>
                    <select
                      value={doublesFormData.team1Player1Id}
                      onChange={(e) => setDoublesFormData({ ...doublesFormData, team1Player1Id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select player</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 1 Player 2 *
                    </label>
                    <select
                      value={doublesFormData.team1Player2Id}
                      onChange={(e) => setDoublesFormData({ ...doublesFormData, team1Player2Id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select player</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 2 Player 1 *
                    </label>
                    <select
                      value={doublesFormData.team2Player1Id}
                      onChange={(e) => setDoublesFormData({ ...doublesFormData, team2Player1Id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select player</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 2 Player 2 *
                    </label>
                    <select
                      value={doublesFormData.team2Player2Id}
                      onChange={(e) => setDoublesFormData({ ...doublesFormData, team2Player2Id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select player</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 1 Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={doublesFormData.team1Score || ''}
                      onChange={(e) => setDoublesFormData({ ...doublesFormData, team1Score: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 2 Score
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={doublesFormData.team2Score || ''}
                      onChange={(e) => setDoublesFormData({ ...doublesFormData, team2Score: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCompleted"
                      checked={doublesFormData.isCompleted}
                      onChange={(e) => setDoublesFormData({ ...doublesFormData, isCompleted: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-900">
                      Match Completed
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Match Date *
              </label>
              <input
                type="date"
                value={matchType === 'singles' ? singlesFormData.matchDate : doublesFormData.matchDate}
                onChange={(e) => {
                  if (matchType === 'singles') {
                    setSinglesFormData({ ...singlesFormData, matchDate: e.target.value });
                  } else {
                    setDoublesFormData({ ...doublesFormData, matchDate: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : (editingMatch ? 'Update Match' : 'Create Match')}
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
                    {matchType === 'singles' ? (
                      <>
                        {(match as IndividualSinglesMatch).player1.firstName} {(match as IndividualSinglesMatch).player1.lastName} vs {(match as IndividualSinglesMatch).player2.firstName} {(match as IndividualSinglesMatch).player2.lastName}
                      </>
                    ) : (
                      <>
                        Team 1 ({(match as IndividualDoublesMatch).team1Player1.firstName} & {(match as IndividualDoublesMatch).team1Player2.firstName}) vs Team 2 ({(match as IndividualDoublesMatch).team2Player1.firstName} & {(match as IndividualDoublesMatch).team2Player2.firstName})
                      </>
                    )}
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
                  {matchType === 'singles'
                    ? ((match as IndividualSinglesMatch).player1Score !== undefined ? (match as IndividualSinglesMatch).player1Score : '-')
                    : ((match as IndividualDoublesMatch).team1Score !== undefined ? (match as IndividualDoublesMatch).team1Score : '-')
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {matchType === 'singles'
                    ? `${(match as IndividualSinglesMatch).player1.firstName} ${(match as IndividualSinglesMatch).player1.lastName}`
                    : 'Team 1'
                  }
                </div>
              </div>
              <div className="text-center flex items-center justify-center">
                <div className="text-lg font-medium text-gray-500">vs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {matchType === 'singles'
                    ? ((match as IndividualSinglesMatch).player2Score !== undefined ? (match as IndividualSinglesMatch).player2Score : '-')
                    : ((match as IndividualDoublesMatch).team2Score !== undefined ? (match as IndividualDoublesMatch).team2Score : '-')
                  }
                </div>
                <div className="text-sm text-gray-600">
                  {matchType === 'singles'
                    ? `${(match as IndividualSinglesMatch).player2.firstName} ${(match as IndividualSinglesMatch).player2.lastName}`
                    : 'Team 2'
                  }
                </div>
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
          <div className="text-gray-400 text-6xl mb-4">
            {matchType === 'singles' ? '🎾' : '🎾🎾'}
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No {matchType === 'singles' ? 'Singles' : 'Doubles'} Matches Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first {matchType === 'singles' ? 'singles' : 'doubles'} match to get started!
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First {matchType === 'singles' ? 'Singles' : 'Doubles'} Match
          </button>
        </div>
      )}
    </div>
  );
};

export default IndividualMatchList;
