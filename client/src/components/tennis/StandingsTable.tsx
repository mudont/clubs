import React from 'react';

import { TeamLeagueStanding } from './types';

interface StandingsTableProps {
  standings: TeamLeagueStanding[];
  loading?: boolean;
  teams?: { teamId: string; teamName: string }[];
}

const StandingsTable: React.FC<StandingsTableProps> = ({ standings, loading = false, teams = [] }) => {
  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading standings...</p>
      </div>
    );
  }

  // If standings is empty, show all teams with 0 stats
  const displayStandings = standings.length > 0 ? standings : teams.map(t => ({
    teamId: t.teamId,
    teamName: t.teamName,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    gamesWon: 0,
    gamesLost: 0,
  }));

  // Sort standings by points (descending), then by goal difference, then by goals scored
  const sortedStandings = [...displayStandings].sort((a, b) => {
    // First by points (descending)
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    // Then by goal difference (descending)
    const aGoalDiff = a.gamesWon - a.gamesLost;
    const bGoalDiff = b.gamesWon - b.gamesLost;
    if (bGoalDiff !== aGoalDiff) {
      return bGoalDiff - aGoalDiff;
    }

    // Then by goals scored (descending)
    if (b.gamesWon !== a.gamesWon) {
      return b.gamesWon - a.gamesWon;
    }

    // Finally by team name (alphabetical)
    return a.teamName.localeCompare(b.teamName);
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">League Standings</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">MP</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GW</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GL</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStandings.map((standing, index) => {
                const isTopThree = index < 3;

                return (
                  <tr
                    key={standing.teamId}
                    className={`hover:bg-gray-50 transition-colors ${
                      isTopThree ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          index === 0 ? 'text-yellow-600' :
                          index === 1 ? 'text-gray-600' :
                          index === 2 ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {index + 1}
                        </span>
                        {isTopThree && (
                          <span className="ml-2 text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {standing.teamName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-lg text-gray-900">
                      {standing.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {standing.matchesPlayed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-green-600 font-medium">
                        {standing.wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500 font-medium">
                        {standing.losses}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500 font-medium">
                        {standing.draws}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500 font-medium">
                        {standing.gamesWon}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-500 font-medium">
                        {standing.gamesLost}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="w-4 h-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded mr-2"></span>
            <span>P = Matches Played</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></span>
            <span>W = Wins</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></span>
            <span>L = Losses</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-gray-100 border border-gray-200 rounded mr-2"></span>
            <span>D = Draws</span>
          </div>
          <div className="flex items-center">
            <span className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></span>
            <span>Pts = Points</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsTable;
