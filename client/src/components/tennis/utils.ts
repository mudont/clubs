import { sortByName } from '../../utils/sorting';

import { TeamLeagueTeamMatch, User } from './types';

// Tennis score translation helpers

/**
 * Converts a score string like "6-4 0-6 7-6" to an array of arrays: [[6,4],[0,6],[7,6]]
 */
export function parseScoreString(scoreStr: string): number[][] {
  if (!scoreStr.trim()) return [];
  return scoreStr
    .trim()
    .split(' ')
    .map(set => set.split('-').map(Number));
}

/**
 * Converts an array of arrays like [[6,4],[0,6],[7,6]] to a score string: "6-4 0-6 7-6"
 */
export function scoreArrayToString(scoreArr: number[][]): string {
  return scoreArr.map(set => set.join('-')).join(' ');
}

// Player filtering utilities

/**
 * Extracts and returns players from the home team of a team match
 */
export function getHomeTeamPlayers(teamMatch: TeamLeagueTeamMatch): User[] {
  return teamMatch.homeTeam.group.members?.map(m => m.user) || [];
}

/**
 * Extracts and returns players from the away team of a team match
 */
export function getAwayTeamPlayers(teamMatch: TeamLeagueTeamMatch): User[] {
  return teamMatch.awayTeam.group.members?.map(m => m.user) || [];
}

/**
 * Formats a user's display name, preferring first/last name over username/email
 */
export function formatPlayerName(user: User): string {
  return user.firstName || user.lastName
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : user.username || user.email;
}

/**
 * Gets home team players formatted and sorted alphabetically by name
 */
export function getFormattedHomeTeamPlayers(
  teamMatch: TeamLeagueTeamMatch
): Array<User & { name: string }> {
  const players = getHomeTeamPlayers(teamMatch);
  return sortByName(
    players.map(player => ({
      ...player,
      name: formatPlayerName(player),
    }))
  );
}

/**
 * Gets away team players formatted and sorted alphabetically by name
 */
export function getFormattedAwayTeamPlayers(
  teamMatch: TeamLeagueTeamMatch
): Array<User & { name: string }> {
  const players = getAwayTeamPlayers(teamMatch);
  return sortByName(
    players.map(player => ({
      ...player,
      name: formatPlayerName(player),
    }))
  );
}
