// Base types
export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface PointSystem {
  id: string;
  winPoints: number;
  lossPoints: number;
  drawPoints: number;
  defaultWinPoints: number;
  defaultLossPoints: number;
  defaultDrawPoints: number;
}

export interface Membership {
  id: string;
  user: User;
  isAdmin?: boolean;
  memberId?: number;
}

export interface TeamLeagueTeam {
  id: string;
  group: {
    id: string;
    name: string;
    description?: string;
    members?: Membership[];
  };
  captainId: string;
  captain: User;
  // name: string; // Remove this field
  // description?: string; // Remove this field if present
}

export interface TeamLeagueTeamMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: TeamLeagueTeam;
  awayTeam: TeamLeagueTeam;
  matchDate: string;
  createdAt: string;
  individualSinglesMatches: IndividualSinglesMatch[];
  individualDoublesMatches: IndividualDoublesMatch[];
  singlesMatches?: IndividualSinglesMatch[];
  doublesMatches?: IndividualDoublesMatch[];
}

export interface IndividualSinglesMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  player1: User;
  player2: User;
  matchDate: string;
  createdAt: string;
  teamMatchId: string;
  teamMatch: TeamLeagueTeamMatch;
  order: number;
  score: string;
  winner: 'HOME' | 'AWAY' | null;
}

export interface IndividualDoublesMatch {
  id: string;
  team1Player1Id: string;
  team1Player2Id: string;
  team2Player1Id: string;
  team2Player2Id: string;
  team1Player1: User;
  team1Player2: User;
  team2Player1: User;
  team2Player2: User;
  matchDate: string;
  createdAt: string;
  teamMatchId: string;
  teamMatch: TeamLeagueTeamMatch;
  order: number;
  score: string;
  winner: 'HOME' | 'AWAY' | null;
}

export interface TeamLeague {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  pointSystems: TeamLeaguePointSystem[];
  teams: TeamLeagueTeam[];
  teamMatches: TeamLeagueTeamMatch[];
  // individualSinglesMatches: IndividualSinglesMatch[]; // Remove if present
  // individualDoublesMatches: IndividualDoublesMatch[]; // Remove if present
}

export interface TeamLeagueStanding {
  teamId: string;
  teamName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  gamesWon: number;
  gamesLost: number;
}

// Input types for mutations
export interface CreateTennisLeagueInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateTennisLeagueInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface CreateTennisTeamInput {
  groupId: string;
  captainId: string;
  // memberIds: string[]; // Remove this field
}

export interface UpdateTennisTeamInput {
  groupId?: string;
  captainId?: string;
  // memberIds?: string[]; // Remove this field
}

export interface CreateTeamMatchInput {
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  homeScore?: number;
  awayScore?: number;
  isCompleted?: boolean;
}

export interface UpdateTeamMatchInput {
  homeTeamId?: string;
  awayTeamId?: string;
  matchDate?: string;
  homeScore?: number;
  awayScore?: number;
  isCompleted?: boolean;
}

export interface CreateIndividualSinglesMatchInput {
  player1Id: string;
  player2Id: string;
  matchDate: string;
  teamMatchId: string;
  order: number;
  score: string;
  winner: 'HOME' | 'AWAY' | null;
}

export interface UpdateIndividualSinglesMatchInput {
  player1Id?: string;
  player2Id?: string;
  matchDate?: string;
  teamMatchId?: string;
  order?: number;
  score?: string;
  winner?: 'HOME' | 'AWAY' | null;
}

export interface CreateIndividualDoublesMatchInput {
  team1Player1Id: string;
  team1Player2Id: string;
  team2Player1Id: string;
  team2Player2Id: string;
  matchDate: string;
  teamMatchId: string;
  order: number;
  score: string;
  winner: 'HOME' | 'AWAY' | null;
}

export interface UpdateIndividualDoublesMatchInput {
  team1Player1Id?: string;
  team1Player2Id?: string;
  team2Player1Id?: string;
  team2Player2Id?: string;
  matchDate?: string;
  teamMatchId?: string;
  order?: number;
  score?: string;
  winner?: 'HOME' | 'AWAY' | null;
}

export interface UpdatePointSystemInput {
  winPoints?: number;
  lossPoints?: number;
  drawPoints?: number;
  defaultWinPoints?: number;
  defaultLossPoints?: number;
  defaultDrawPoints?: number;
}

// GraphQL response types
export interface GetTennisLeaguesData {
  tennisLeagues: {
    id: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    teams: { id: string; group: { id: string; name: string } }[];
  }[];
}

export interface GetTennisLeagueData {
  tennisLeague: TeamLeague;
}

export interface GetTennisLeagueStandingsData {
  tennisLeagueStandings: TeamLeagueStanding[];
}

export interface CreateTennisLeagueData {
  createTennisLeague: TeamLeague;
}

export interface UpdateTennisLeagueData {
  updateTennisLeague: TeamLeague;
}

export interface DeleteTennisLeagueData {
  deleteTennisLeague: boolean;
}

export interface CreateTennisTeamData {
  createTennisTeam: TeamLeagueTeam;
}

export interface UpdateTennisTeamData {
  updateTennisTeam: TeamLeagueTeam;
}

export interface DeleteTennisTeamData {
  deleteTennisTeam: boolean;
}

export interface CreateTeamMatchData {
  createTeamMatch: TeamLeagueTeamMatch;
}

export interface UpdateTeamMatchData {
  updateTeamMatch: TeamLeagueTeamMatch;
}

export interface DeleteTeamMatchData {
  deleteTeamMatch: boolean;
}

export interface CreateIndividualSinglesMatchData {
  createIndividualSinglesMatch: IndividualSinglesMatch;
}

export interface UpdateIndividualSinglesMatchData {
  updateIndividualSinglesMatch: IndividualSinglesMatch;
}

export interface DeleteIndividualSinglesMatchData {
  deleteIndividualSinglesMatch: boolean;
}

export interface CreateIndividualDoublesMatchData {
  createIndividualDoublesMatch: IndividualDoublesMatch;
}

export interface UpdateIndividualDoublesMatchData {
  updateIndividualDoublesMatch: IndividualDoublesMatch;
}

export interface DeleteIndividualDoublesMatchData {
  deleteIndividualDoublesMatch: boolean;
}

export interface UpdatePointSystemData {
  updatePointSystem: PointSystem;
}

export type MatchType = 'SINGLES' | 'DOUBLES';

export interface TeamLeaguePointSystem {
  id: string;
  matchType: MatchType;
  order: number;
  winPoints: number;
  lossPoints: number;
  drawPoints: number;
  defaultWinPoints: number;
  defaultLossPoints: number;
  defaultDrawPoints: number;
}

export interface GetLeaguePointSystemsData {
  tennisLeague: {
    id: string;
    pointSystems: TeamLeaguePointSystem[];
  };
}

export interface CreateLeaguePointSystemData {
  createTeamLeaguePointSystem: TeamLeaguePointSystem;
}

export interface UpdateLeaguePointSystemData {
  updateTeamLeaguePointSystem: TeamLeaguePointSystem;
}

export interface DeleteLeaguePointSystemData {
  deleteTeamLeaguePointSystem: boolean;
}
