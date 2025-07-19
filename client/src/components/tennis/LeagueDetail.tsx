import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  CREATE_INDIVIDUAL_DOUBLES_MATCH,
  CREATE_INDIVIDUAL_SINGLES_MATCH,
  DELETE_INDIVIDUAL_DOUBLES_MATCH,
  DELETE_INDIVIDUAL_SINGLES_MATCH,
  GET_TENNIS_LEAGUE, GET_TENNIS_LEAGUE_STANDINGS,
  UPDATE_INDIVIDUAL_DOUBLES_MATCH,
  UPDATE_INDIVIDUAL_SINGLES_MATCH,
} from './graphql';
import PointSystemEditor from './PointSystemEditor';
import StandingsTable from './StandingsTable';
import TeamList from './TeamList';
import TeamMatchList from './TeamMatchList';
import TennisNavbar from './TennisNavbar';
import { CreateIndividualDoublesMatchInput, CreateIndividualSinglesMatchInput, GetTennisLeagueData, GetTennisLeagueStandingsData, IndividualDoublesMatch, IndividualSinglesMatch, User } from './types';

const LeagueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  // Move all useState/useMutation hooks to the top, before any early returns
  const [showSinglesForm, setShowSinglesForm] = useState(false);
  const [editingSinglesMatch, setEditingSinglesMatch] = useState<IndividualSinglesMatch | null>(null);
  const [singlesFormData, setSinglesFormData] = useState<CreateIndividualSinglesMatchInput>({
    player1Id: '',
    player2Id: '',
    matchDate: '',
    order: 1,
    score: '',
    winner: null,
    teamMatchId: '',
  });
  const [showDoublesForm, setShowDoublesForm] = useState(false);
  const [editingDoublesMatch, setEditingDoublesMatch] = useState<IndividualDoublesMatch | null>(null);
  const [doublesFormData, setDoublesFormData] = useState<CreateIndividualDoublesMatchInput>({
    team1Player1Id: '',
    team1Player2Id: '',
    team2Player1Id: '',
    team2Player2Id: '',
    matchDate: '',
    order: 1,
    score: '',
    winner: null,
    teamMatchId: '',
  });
  const [createSinglesMatch] = useMutation(CREATE_INDIVIDUAL_SINGLES_MATCH, { onCompleted: () => { setShowSinglesForm(false); setEditingSinglesMatch(null); refetch(); } });
  const [updateSinglesMatch] = useMutation(UPDATE_INDIVIDUAL_SINGLES_MATCH, { onCompleted: () => { setShowSinglesForm(false); setEditingSinglesMatch(null); refetch(); } });
  const [deleteSinglesMatch] = useMutation(DELETE_INDIVIDUAL_SINGLES_MATCH, { onCompleted: () => refetch() });
  const [createDoublesMatch] = useMutation(CREATE_INDIVIDUAL_DOUBLES_MATCH, { onCompleted: () => { setShowDoublesForm(false); setEditingDoublesMatch(null); refetch(); } });
  const [updateDoublesMatch] = useMutation(UPDATE_INDIVIDUAL_DOUBLES_MATCH, { onCompleted: () => { setShowDoublesForm(false); setEditingDoublesMatch(null); refetch(); } });
  const [deleteDoublesMatch] = useMutation(DELETE_INDIVIDUAL_DOUBLES_MATCH, { onCompleted: () => refetch() });

  const { data: leagueData, loading: leagueLoading, error: leagueError, refetch } = useQuery<GetTennisLeagueData>(
    GET_TENNIS_LEAGUE,
    {
      variables: { id: id! },
      skip: !id,
    }
  );

  const { data: standingsData, loading: standingsLoading } = useQuery<GetTennisLeagueStandingsData>(
    GET_TENNIS_LEAGUE_STANDINGS,
    {
      variables: { id: id! },
      skip: !id,
    }
  );

  // Move useEffect hooks for resetting player fields above any early returns
  useEffect(() => {
    // Only clear player fields when creating new matches, not when editing
    if (!editingSinglesMatch) {
      setSinglesFormData(f => ({ ...f, player1Id: '', player2Id: '' }));
    }
  }, [singlesFormData.teamMatchId, editingSinglesMatch]);

  useEffect(() => {
    // Only clear player fields when creating new matches, not when editing
    if (!editingDoublesMatch) {
      setDoublesFormData(f => ({ ...f, team1Player1Id: '', team1Player2Id: '', team2Player1Id: '', team2Player2Id: '' }));
    }
  }, [doublesFormData.teamMatchId, editingDoublesMatch]);

  if (leagueLoading) return <div className="text-center p-4">Loading league details...</div>;
  if (leagueError) return <div className="text-red-500 p-4">Error loading league: {leagueError.message}</div>;
  if (!leagueData?.tennisLeague) return <div className="text-center p-4">League not found</div>;

  const league = leagueData.tennisLeague;
  const standings = standingsData?.tennisLeagueStandings || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const singlesCount = league.teamMatches.reduce(
    (sum, m) => sum + (m.individualSinglesMatches?.length ?? 0),
    0
  );
  const doublesCount = league.teamMatches.reduce(
    (sum, m) => sum + (m.individualDoublesMatches?.length ?? 0),
    0
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'teams', label: 'Teams', icon: '👥' },
    { id: 'team-matches', label: 'Team Matches', icon: '🏆' },
    { id: 'singles', label: 'Singles', icon: '🎾' },
    { id: 'doubles', label: 'Doubles', icon: '🎾🎾' },
    { id: 'standings', label: 'Standings', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  // Helper to get all users for a team match
  // const getTeamUsers = (teamMatch: TeamLeagueTeamMatch, which: 'home' | 'away') => {
  //   const team = which === 'home' ? teamMatch.homeTeam : teamMatch.awayTeam;
  //   return team?.members || [];
  // };

  // Helper to get selected team match
  const selectedSinglesTeamMatch = league.teamMatches.find(tm => tm.id === singlesFormData.teamMatchId);
  const selectedDoublesTeamMatch = league.teamMatches.find(tm => tm.id === doublesFormData.teamMatchId);

  // Helper to format date for HTML date input
  const formatDateForInput = (dateString: string) => {
    return dateString.split('T')[0]; // Convert "2024-01-15T00:00:00.000Z" to "2024-01-15"
  };

  return (
    <div className="tennis-page">
      <TennisNavbar />
      <div className="max-w-7xl mx-auto p-4">
        {/* League Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{league.name}</h1>
              {league.description && (
                <p className="text-gray-600 text-lg">{league.description}</p>
              )}
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                league.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {league.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Start Date:</span>
              <div className="font-medium">{formatDate(league.startDate)}</div>
            </div>
            <div>
              <span className="text-gray-500">End Date:</span>
              <div className="font-medium">{formatDate(league.endDate)}</div>
            </div>
            <div>
              <span className="text-gray-500">Teams:</span>
              <div className="font-medium">{league.teams.length}</div>
            </div>
            <div>
              <span className="text-gray-500">Total Matches:</span>
              <div className="font-medium">
                {league.teamMatches.length + singlesCount + doublesCount}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">League Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Teams</h3>
                  <p className="text-2xl font-bold text-blue-600">{league.teams.length}</p>
                  <p className="text-sm text-blue-700">Registered teams</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Team Matches</h3>
                  <p className="text-2xl font-bold text-green-600">{league.teamMatches.length}</p>
                  <p className="text-sm text-green-700">Team vs team matches</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Individual Matches</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {singlesCount + doublesCount}
                  </p>
                  <p className="text-sm text-purple-700">Singles & doubles matches</p>
                </div>
              </div>

              {standings.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Current Standings</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            P
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            W
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            L
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            D
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pts
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {standings.slice(0, 5).map((standing, index) => (
                          <tr key={standing.teamId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {standing.teamName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {standing.matchesPlayed}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {standing.wins}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {standing.losses}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {standing.draws}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {standing.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {standings.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing top 5 teams. View full standings in the Standings tab.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="p-6">
              <TeamList leagueId={id!} teams={league.teams} />
            </div>
          )}

          {activeTab === 'team-matches' && (
            <div className="p-6">
              <TeamMatchList leagueId={id!} matches={league.teamMatches} />
            </div>
          )}

          {activeTab === 'singles' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">All Singles Matches</h3>
                <button className="btn-primary" onClick={() => { setShowSinglesForm(true); setEditingSinglesMatch(null); setSinglesFormData({ player1Id: '', player2Id: '', matchDate: '', order: 1, score: '', winner: null, teamMatchId: league.teamMatches[0]?.id || '' }); }}>Create New Match</button>
              </div>
              {showSinglesForm && (
                <form className="mb-6 bg-gray-50 p-4 rounded" onSubmit={e => { e.preventDefault(); if (editingSinglesMatch) { updateSinglesMatch({ variables: { id: editingSinglesMatch.id, input: singlesFormData } }); } else { createSinglesMatch({ variables: { leagueId: league.id, input: singlesFormData } }); } }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Team Match</label>
                      <select value={singlesFormData.teamMatchId} onChange={e => setSinglesFormData(f => ({ ...f, teamMatchId: e.target.value }))} className="w-full border rounded p-2">
                        {league.teamMatches.map(tm => <option key={tm.id} value={tm.id}>{formatDate(tm.matchDate)}: {tm.homeTeam.group.name} vs {tm.awayTeam.group.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Player 1</label>
                      <select value={singlesFormData.player1Id} onChange={e => setSinglesFormData(f => ({ ...f, player1Id: e.target.value }))} className="w-full border rounded p-2">
                        <option value="">Select Player 1</option>
                        {(selectedSinglesTeamMatch?.homeTeam.group?.members?.map(m => m.user) || []).map((u: User) => (
                          <option key={u.id} value={u.id}>
                            {((u.firstName || u.lastName)
                              ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                              : u.username) + ` (${u.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Player 2</label>
                      <select value={singlesFormData.player2Id} onChange={e => setSinglesFormData(f => ({ ...f, player2Id: e.target.value }))} className="w-full border rounded p-2">
                        <option value="">Select Player 2</option>
                        {(selectedSinglesTeamMatch?.awayTeam.group?.members?.map(m => m.user) || []).map((u: User) => (
                          <option key={u.id} value={u.id}>
                            {((u.firstName || u.lastName)
                              ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                              : u.username) + ` (${u.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Date</label>
                      <input type="date" value={singlesFormData.matchDate} onChange={e => setSinglesFormData(f => ({ ...f, matchDate: e.target.value }))} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Order</label>
                      <input type="number" value={singlesFormData.order} onChange={e => setSinglesFormData(f => ({ ...f, order: parseInt(e.target.value, 10) || 1 }))} className="w-full border rounded p-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Score</label>
                      <input type="text" value={singlesFormData.score} onChange={e => setSinglesFormData(f => ({ ...f, score: e.target.value }))} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Winner</label>
                      <select value={singlesFormData.winner ?? ''} onChange={e => setSinglesFormData(f => ({ ...f, winner: e.target.value === '' ? null : e.target.value as 'HOME' | 'AWAY' }))} className="w-full border rounded p-2">
                        <option value="">Select Winner</option>
                        <option value="HOME">Home</option>
                        <option value="AWAY">Away</option>
                        <option value="DRAW">Draw</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary">{editingSinglesMatch ? 'Update' : 'Create'} Match</button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowSinglesForm(false); setEditingSinglesMatch(null); }}>Cancel</button>
                  </div>
                </form>
              )}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Sched/Played</th>
                    <th className="px-4 py-2">Order</th>
                    <th className="px-4 py-2">Home</th>
                    <th className="px-4 py-2">Away</th>
                    <th className="px-4 py-2">Score</th>
                    <th className="px-4 py-2">Winner</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {league.teamMatches.flatMap(m => m.individualSinglesMatches ?? []).map(match => {
                    const teamMatch = league.teamMatches.find(tm => tm.id === match.teamMatchId);
                    return { match, teamMatch };
                  }).sort((a, b) => {
                    // Sort by team match date first, then by order
                    const dateA = new Date(a.teamMatch?.matchDate || '');
                    const dateB = new Date(b.teamMatch?.matchDate || '');
                    if (dateA.getTime() !== dateB.getTime()) {
                      return dateA.getTime() - dateB.getTime();
                    }
                    return (a.match.order || 0) - (b.match.order || 0);
                  }).map(({ match, teamMatch }) => (
                    <tr key={match.id} className="bg-white">
                      <td className="px-4 py-2">
                        {teamMatch ? `${formatDate(teamMatch.matchDate)} / ${formatDate(match.matchDate)}` : formatDate(match.matchDate)}
                      </td>
                      <td className="px-4 py-2">{match.order}</td>
                      <td className="px-4 py-2">{
                        (match.player1.firstName || match.player1.lastName)
                          ? `${match.player1.firstName ?? ''} ${match.player1.lastName ?? ''}`.trim()
                          : (match.player1.username || match.player1.email)
                      }</td>
                      <td className="px-4 py-2">{
                        (match.player2.firstName || match.player2.lastName)
                          ? `${match.player2.firstName ?? ''} ${match.player2.lastName ?? ''}`.trim()
                          : (match.player2.username || match.player2.email)
                      }</td>
                      <td className="px-4 py-2">{match.score}</td>
                      <td className="px-4 py-2">{match.winner ? (match.winner === 'HOME' ? 'Home' : 'Away') : '-'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => {
                            setShowSinglesForm(true);
                            setEditingSinglesMatch(match);
                            setSinglesFormData({
                              player1Id: match.player1Id,
                              player2Id: match.player2Id,
                              matchDate: formatDateForInput(match.matchDate),
                              order: match.order,
                              score: match.score,
                              winner: match.winner,
                              teamMatchId: match.teamMatchId
                            });
                          }}
                          title="Edit Match"
                        >
                          ✏️
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={() => { if (window.confirm('Delete this match?')) deleteSinglesMatch({ variables: { id: match.id } }); }}
                          title="Delete Match"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'doubles' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">All Doubles Matches</h3>
                <button className="btn-primary" onClick={() => { setShowDoublesForm(true); setEditingDoublesMatch(null); setDoublesFormData({ team1Player1Id: '', team1Player2Id: '', team2Player1Id: '', team2Player2Id: '', matchDate: '', order: 1, score: '', winner: null, teamMatchId: league.teamMatches[0]?.id || '' }); }}>Create New Match</button>
              </div>
              {showDoublesForm && (
                <form className="mb-6 bg-gray-50 p-4 rounded" onSubmit={e => { e.preventDefault(); if (editingDoublesMatch) { updateDoublesMatch({ variables: { id: editingDoublesMatch.id, input: doublesFormData } }); } else { createDoublesMatch({ variables: { leagueId: league.id, input: doublesFormData } }); } }}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Team Match</label>
                      <select value={doublesFormData.teamMatchId} onChange={e => setDoublesFormData(f => ({ ...f, teamMatchId: e.target.value }))} className="w-full border rounded p-2">
                        {league.teamMatches.map(tm => <option key={tm.id} value={tm.id}>{formatDate(tm.matchDate)}: {tm.homeTeam.group.name} vs {tm.awayTeam.group.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Home</label>
                      <select value={doublesFormData.team1Player1Id} onChange={e => setDoublesFormData(f => ({ ...f, team1Player1Id: e.target.value }))} className="w-full border rounded p-2">
                        <option value="">Select Home Player 1</option>
                        {(selectedDoublesTeamMatch?.homeTeam.group?.members?.map(m => m.user) || []).map((u: User) => (
                          <option key={u.id} value={u.id}>
                            {((u.firstName || u.lastName)
                              ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                              : u.username) + ` (${u.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Home</label>
                      <select value={doublesFormData.team1Player2Id} onChange={e => setDoublesFormData(f => ({ ...f, team1Player2Id: e.target.value }))} className="w-full border rounded p-2">
                        <option value="">Select Home Player 2</option>
                        {(selectedDoublesTeamMatch?.homeTeam.group?.members?.map(m => m.user) || []).map((u: User) => (
                          <option key={u.id} value={u.id}>
                            {((u.firstName || u.lastName)
                              ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                              : u.username) + ` (${u.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Away</label>
                      <select value={doublesFormData.team2Player1Id} onChange={e => setDoublesFormData(f => ({ ...f, team2Player1Id: e.target.value }))} className="w-full border rounded p-2">
                        <option value="">Select Away Player 1</option>
                        {(selectedDoublesTeamMatch?.awayTeam.group?.members?.map(m => m.user) || []).map((u: User) => (
                          <option key={u.id} value={u.id}>
                            {((u.firstName || u.lastName)
                              ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                              : u.username) + ` (${u.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Away</label>
                      <select value={doublesFormData.team2Player2Id} onChange={e => setDoublesFormData(f => ({ ...f, team2Player2Id: e.target.value }))} className="w-full border rounded p-2">
                        <option value="">Select Away Player 2</option>
                        {(selectedDoublesTeamMatch?.awayTeam.group?.members?.map(m => m.user) || []).map((u: User) => (
                          <option key={u.id} value={u.id}>
                            {((u.firstName || u.lastName)
                              ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
                              : u.username) + ` (${u.email})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Date</label>
                      <input type="date" value={doublesFormData.matchDate} onChange={e => setDoublesFormData(f => ({ ...f, matchDate: e.target.value }))} className="w-full border rounded p-2" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Order</label>
                      <input type="number" value={doublesFormData.order} onChange={e => setDoublesFormData(f => ({ ...f, order: parseInt(e.target.value, 10) || 1 }))} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Score</label>
                      <input type="text" value={doublesFormData.score} onChange={e => setDoublesFormData(f => ({ ...f, score: e.target.value }))} className="w-full border rounded p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Winner</label>
                      <select value={doublesFormData.winner ?? ''} onChange={e => setDoublesFormData(f => ({ ...f, winner: e.target.value === '' ? null : e.target.value as 'HOME' | 'AWAY' }))} className="w-full border rounded p-2">
                        <option value="">Select Winner</option>
                        <option value="HOME">Home</option>
                        <option value="AWAY">Away</option>
                        <option value="DRAW">Draw</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button type="submit" className="btn-primary">{editingDoublesMatch ? 'Update' : 'Create'} Match</button>
                    <button type="button" className="btn-secondary" onClick={() => { setShowDoublesForm(false); setEditingDoublesMatch(null); }}>Cancel</button>
                  </div>
                </form>
              )}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Sched/Played</th>
                    <th className="px-4 py-2">Order</th>
                    <th className="px-4 py-2">Home</th>
                    <th className="px-4 py-2">Away</th>
                    <th className="px-4 py-2">Score</th>
                    <th className="px-4 py-2">Winner</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {league.teamMatches.flatMap(m => m.individualDoublesMatches ?? []).map(match => {
                    const teamMatch = league.teamMatches.find(tm => tm.id === match.teamMatchId);
                    return { match, teamMatch };
                  }).sort((a, b) => {
                    // Sort by team match date first, then by order
                    const dateA = new Date(a.teamMatch?.matchDate || '');
                    const dateB = new Date(b.teamMatch?.matchDate || '');
                    if (dateA.getTime() !== dateB.getTime()) {
                      return dateA.getTime() - dateB.getTime();
                    }
                    return (a.match.order || 0) - (b.match.order || 0);
                  }).map(({ match, teamMatch }) => (
                    <tr key={match.id} className="bg-white">
                      <td className="px-4 py-2">
                        {teamMatch ? `${formatDate(teamMatch.matchDate)} / ${formatDate(match.matchDate)}` : formatDate(match.matchDate)}
                      </td>
                      <td className="px-4 py-2">{match.order}</td>
                      <td className="px-4 py-2">{
                        (match.team1Player1.firstName || match.team1Player1.lastName)
                          ? `${match.team1Player1.firstName ?? ''} ${match.team1Player1.lastName ?? ''}`.trim()
                          : (match.team1Player1.username || match.team1Player1.email)
                      } & {
                        (match.team1Player2.firstName || match.team1Player2.lastName)
                          ? `${match.team1Player2.firstName ?? ''} ${match.team1Player2.lastName ?? ''}`.trim()
                          : (match.team1Player2.username || match.team1Player2.email)
                      }</td>
                      <td className="px-4 py-2">{
                        (match.team2Player1.firstName || match.team2Player1.lastName)
                          ? `${match.team2Player1.firstName ?? ''} ${match.team2Player1.lastName ?? ''}`.trim()
                          : (match.team2Player1.username || match.team2Player1.email)
                      } & {
                        (match.team2Player2.firstName || match.team2Player2.lastName)
                          ? `${match.team2Player2.firstName ?? ''} ${match.team2Player2.lastName ?? ''}`.trim()
                          : (match.team2Player2.username || match.team2Player2.email)
                      }</td>
                      <td className="px-4 py-2">{match.score}</td>
                      <td className="px-4 py-2">{match.winner ? (match.winner === 'HOME' ? 'Home' : 'Away') : '-'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => {
                            setShowDoublesForm(true);
                            setEditingDoublesMatch(match);
                            setDoublesFormData({
                              team1Player1Id: match.team1Player1Id,
                              team1Player2Id: match.team1Player2Id,
                              team2Player1Id: match.team2Player1Id,
                              team2Player2Id: match.team2Player2Id,
                              matchDate: formatDateForInput(match.matchDate),
                              order: match.order,
                              score: match.score,
                              winner: match.winner,
                              teamMatchId: match.teamMatchId
                            });
                          }}
                          title="Edit Match"
                        >
                          ✏️
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          onClick={() => { if (window.confirm('Delete this match?')) deleteDoublesMatch({ variables: { id: match.id } }); }}
                          title="Delete Match"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'standings' && (
            <div className="p-6">
              <StandingsTable standings={standings} loading={standingsLoading} teams={league.teams.map(t => ({ teamId: t.id, teamName: t.group.name }))} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <PointSystemEditor leagueId={id!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueDetail;
