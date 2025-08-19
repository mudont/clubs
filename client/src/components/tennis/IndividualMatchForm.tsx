import { useMutation } from '@apollo/client';
import React, { useEffect, useState } from 'react';

import { CREATE_INDIVIDUAL_DOUBLES_MATCH, CREATE_INDIVIDUAL_SINGLES_MATCH } from './graphql';
import {
  CreateIndividualDoublesMatchData,
  CreateIndividualDoublesMatchInput,
  CreateIndividualSinglesMatchData,
  CreateIndividualSinglesMatchInput,
  TeamLeagueTeamMatch,
} from './types';
import { getFormattedAwayTeamPlayers, getFormattedHomeTeamPlayers } from './utils';

interface IndividualMatchFormProps {
  matchType: 'singles' | 'doubles';
  teamMatch: TeamLeagueTeamMatch;
  leagueId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialOrder?: number;
}

const IndividualMatchForm: React.FC<IndividualMatchFormProps> = ({
  matchType,
  teamMatch,
  leagueId,
  onSuccess,
  onCancel,
  initialOrder = 1,
}) => {
  // Form data for singles matches
  const [singlesFormData, setSinglesFormData] = useState<CreateIndividualSinglesMatchInput>({
    player1Id: '',
    player2Id: '',
    matchDate: teamMatch.matchDate.split('T')[0],
    order: initialOrder,
    score: '',
    winner: null,
    teamMatchId: teamMatch.id,
  });

  // Form data for doubles matches
  const [doublesFormData, setDoublesFormData] = useState<CreateIndividualDoublesMatchInput>({
    team1Player1Id: '',
    team1Player2Id: '',
    team2Player1Id: '',
    team2Player2Id: '',
    matchDate: teamMatch.matchDate.split('T')[0],
    order: initialOrder,
    score: '',
    winner: null,
    teamMatchId: teamMatch.id,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Update form data when initialOrder changes
  useEffect(() => {
    setSinglesFormData(prev => ({ ...prev, order: initialOrder }));
    setDoublesFormData(prev => ({ ...prev, order: initialOrder }));
  }, [initialOrder]);

  // Clear validation errors when form data changes
  useEffect(() => {
    if (validationError) {
      setValidationError(null);
    }
  }, [singlesFormData, doublesFormData, validationError]);

  // Singles mutations
  const [createSinglesMatch, { loading: creatingSingles, error: createSinglesError }] = useMutation<
    CreateIndividualSinglesMatchData,
    { leagueId: string; input: CreateIndividualSinglesMatchInput }
  >(CREATE_INDIVIDUAL_SINGLES_MATCH, {
    onCompleted: () => {
      onSuccess();
    },
    onError: error => {
      console.error('Error creating singles match:', error);
    },
  });

  // Doubles mutations
  const [createDoublesMatch, { loading: creatingDoubles, error: createDoublesError }] = useMutation<
    CreateIndividualDoublesMatchData,
    { leagueId: string; input: CreateIndividualDoublesMatchInput }
  >(CREATE_INDIVIDUAL_DOUBLES_MATCH, {
    onCompleted: () => {
      onSuccess();
    },
    onError: error => {
      console.error('Error creating doubles match:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (matchType === 'singles') {
      if (!singlesFormData.player1Id || !singlesFormData.player2Id || !singlesFormData.matchDate) {
        setValidationError('Please fill in all required fields.');
        return;
      }

      if (singlesFormData.player1Id === singlesFormData.player2Id) {
        setValidationError('Home and away players cannot be the same.');
        return;
      }

      createSinglesMatch({ variables: { leagueId, input: singlesFormData } });
    } else {
      if (
        !doublesFormData.team1Player1Id ||
        !doublesFormData.team1Player2Id ||
        !doublesFormData.team2Player1Id ||
        !doublesFormData.team2Player2Id ||
        !doublesFormData.matchDate
      ) {
        setValidationError('Please fill in all required fields.');
        return;
      }

      const team1Players = [doublesFormData.team1Player1Id, doublesFormData.team1Player2Id];
      const team2Players = [doublesFormData.team2Player1Id, doublesFormData.team2Player2Id];

      if (new Set([...team1Players, ...team2Players]).size !== 4) {
        setValidationError('All players must be different.');
        return;
      }

      createDoublesMatch({ variables: { leagueId, input: doublesFormData } });
    }
  };

  const homeTeamPlayers = getFormattedHomeTeamPlayers(teamMatch);
  const awayTeamPlayers = getFormattedAwayTeamPlayers(teamMatch);

  const loading = creatingSingles || creatingDoubles;
  const error = createSinglesError || createDoublesError;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">
        Create New {matchType === 'singles' ? 'Singles' : 'Doubles'} Match
      </h3>
      {(error || validationError) && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-1">{validationError || error?.message}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {matchType === 'singles' ? (
          // Singles form
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Player *
                </label>
                <select
                  value={singlesFormData.player1Id}
                  onChange={e =>
                    setSinglesFormData({ ...singlesFormData, player1Id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Select home player"
                >
                  <option value="">Select home player</option>
                  {homeTeamPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Away Player *
                </label>
                <select
                  value={singlesFormData.player2Id}
                  onChange={e =>
                    setSinglesFormData({ ...singlesFormData, player2Id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Select away player"
                >
                  <option value="">Select away player</option>
                  {awayTeamPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Date *</label>
                <input
                  type="date"
                  value={singlesFormData.matchDate}
                  onChange={e =>
                    setSinglesFormData({ ...singlesFormData, matchDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Match date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Match Order *
                </label>
                <input
                  type="number"
                  min="1"
                  value={singlesFormData.order}
                  onChange={e =>
                    setSinglesFormData({ ...singlesFormData, order: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Match order"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <input
                  type="text"
                  value={singlesFormData.score}
                  onChange={e => setSinglesFormData({ ...singlesFormData, score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 6-4, 6-2"
                  aria-label="Match score"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Winner</label>
                <select
                  value={singlesFormData.winner ?? ''}
                  onChange={e =>
                    setSinglesFormData({
                      ...singlesFormData,
                      winner: e.target.value as 'HOME' | 'AWAY' | null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Match winner"
                >
                  <option value="">Select winner</option>
                  <option value="HOME">Home</option>
                  <option value="AWAY">Away</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          // Doubles form
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Player 1 *
                </label>
                <select
                  value={doublesFormData.team1Player1Id}
                  onChange={e =>
                    setDoublesFormData({ ...doublesFormData, team1Player1Id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Select home player 1"
                >
                  <option value="">Select player</option>
                  {homeTeamPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Player 2 *
                </label>
                <select
                  value={doublesFormData.team1Player2Id}
                  onChange={e =>
                    setDoublesFormData({ ...doublesFormData, team1Player2Id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Select home player 2"
                >
                  <option value="">Select player</option>
                  {homeTeamPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Away Player 1 *
                </label>
                <select
                  value={doublesFormData.team2Player1Id}
                  onChange={e =>
                    setDoublesFormData({ ...doublesFormData, team2Player1Id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Select away player 1"
                >
                  <option value="">Select player</option>
                  {awayTeamPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Away Player 2 *
                </label>
                <select
                  value={doublesFormData.team2Player2Id}
                  onChange={e =>
                    setDoublesFormData({ ...doublesFormData, team2Player2Id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Select away player 2"
                >
                  <option value="">Select player</option>
                  {awayTeamPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Date *</label>
                <input
                  type="date"
                  value={doublesFormData.matchDate}
                  onChange={e =>
                    setDoublesFormData({ ...doublesFormData, matchDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Match date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Match Order *
                </label>
                <input
                  type="number"
                  min="1"
                  value={doublesFormData.order}
                  onChange={e =>
                    setDoublesFormData({ ...doublesFormData, order: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  aria-label="Match order"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <input
                  type="text"
                  value={doublesFormData.score}
                  onChange={e => setDoublesFormData({ ...doublesFormData, score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 6-4, 6-2"
                  aria-label="Match score"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Winner</label>
                <select
                  value={doublesFormData.winner ?? ''}
                  onChange={e =>
                    setDoublesFormData({
                      ...doublesFormData,
                      winner: e.target.value as 'HOME' | 'AWAY' | null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Match winner"
                >
                  <option value="">Select winner</option>
                  <option value="HOME">Home</option>
                  <option value="AWAY">Away</option>
                </select>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            aria-label={`Create ${matchType} match`}
          >
            {loading ? 'Creating...' : 'Create Match'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            aria-label="Cancel match creation"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default IndividualMatchForm;
