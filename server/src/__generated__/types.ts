/* eslint-disable */
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../types/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type BlockUserInput = {
  groupId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};

export type BlockedUser = {
  __typename?: 'BlockedUser';
  blockedAt: Scalars['DateTime']['output'];
  blockedBy: User;
  group: Group;
  id: Scalars['ID']['output'];
  reason: Maybe<Scalars['String']['output']>;
  user: User;
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ChangePasswordResponse = {
  __typename?: 'ChangePasswordResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type CreateEventInput = {
  date: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
};

export type CreateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type CreateIndividualDoublesMatchInput = {
  matchDate: Scalars['DateTime']['input'];
  order: Scalars['Int']['input'];
  resultType?: InputMaybe<ResultType>;
  score: Scalars['String']['input'];
  team1Player1Id: Scalars['String']['input'];
  team1Player2Id: Scalars['String']['input'];
  team2Player1Id: Scalars['String']['input'];
  team2Player2Id: Scalars['String']['input'];
  teamMatchId: Scalars['String']['input'];
  winner?: InputMaybe<Winner>;
};

export type CreateIndividualSinglesMatchInput = {
  matchDate: Scalars['DateTime']['input'];
  order: Scalars['Int']['input'];
  player1Id: Scalars['String']['input'];
  player2Id: Scalars['String']['input'];
  resultType?: InputMaybe<ResultType>;
  score: Scalars['String']['input'];
  teamMatchId: Scalars['String']['input'];
  winner?: InputMaybe<Winner>;
};

export type CreateRsvpInput = {
  eventId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  status: RsvpStatus;
};

export type CreateTeamLeaguePointSystemInput = {
  drawPoints?: InputMaybe<Scalars['Int']['input']>;
  lossPoints?: InputMaybe<Scalars['Int']['input']>;
  matchType: MatchType;
  order: Scalars['Int']['input'];
  winPoints: Scalars['Int']['input'];
};

export type CreateTeamMatchInput = {
  awayTeamId: Scalars['String']['input'];
  homeTeamId: Scalars['String']['input'];
  matchDate: Scalars['DateTime']['input'];
};

export type CreateTennisLeagueInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['DateTime']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type CreateTennisTeamInput = {
  captainId: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
};

export type Event = {
  __typename?: 'Event';
  createdBy: User;
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  group: Group;
  id: Scalars['ID']['output'];
  rsvps: Array<Rsvp>;
};

export type Group = {
  __typename?: 'Group';
  blockedUsers: Array<BlockedUser>;
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  events: Array<Event>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  members: Array<Membership>;
  memberships: Array<Membership>;
  messages: Array<Message>;
  name: Scalars['String']['output'];
  rsvps: Array<Rsvp>;
  updatedAt: Scalars['DateTime']['output'];
};

export type LineupInput = {
  slots: Array<LineupSlotInput>;
  teamId: Scalars['String']['input'];
  teamMatchId: Scalars['String']['input'];
  visibility?: InputMaybe<LineupVisibility>;
};

export type LineupSlotInput = {
  order: Scalars['Int']['input'];
  player1Id: Scalars['String']['input'];
  player2Id?: InputMaybe<Scalars['String']['input']>;
  type: LineupSlotType;
};

export type LineupSlotType =
  | 'DOUBLES'
  | 'SINGLES';

export type LineupVisibility =
  | 'ALL'
  | 'PRIVATE'
  | 'TEAM';

export type LoginInput = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type MatchType =
  | 'DOUBLES'
  | 'SINGLES';

export type Membership = {
  __typename?: 'Membership';
  group: Group;
  id: Scalars['ID']['output'];
  isAdmin: Scalars['Boolean']['output'];
  joinedAt: Scalars['DateTime']['output'];
  memberId: Scalars['Int']['output'];
  role: Scalars['String']['output'];
  user: User;
};

export type Message = {
  __typename?: 'Message';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  group: Group;
  id: Scalars['ID']['output'];
  user: User;
};

export type Mutation = {
  __typename?: 'Mutation';
  addMember: Membership;
  addMemberByEmail: Membership;
  addMemberByUsername: Membership;
  blockUser: Scalars['Boolean']['output'];
  changePassword: ChangePasswordResponse;
  createEvent: Event;
  createGroup: Group;
  createIndividualDoublesMatch: TeamLeagueIndividualDoublesMatch;
  createIndividualSinglesMatch: TeamLeagueIndividualSinglesMatch;
  createOrUpdateLineup: TeamMatchLineup;
  createRSVP: Rsvp;
  createTeamLeaguePointSystem: TeamLeaguePointSystem;
  createTeamMatch: TeamLeagueTeamMatch;
  createTennisLeague: TeamLeague;
  createTennisTeam: TeamLeagueTeam;
  deleteEvent: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  deleteIndividualDoublesMatch: Scalars['Boolean']['output'];
  deleteIndividualSinglesMatch: Scalars['Boolean']['output'];
  deleteRSVP: Scalars['Boolean']['output'];
  deleteTeamLeaguePointSystem: Scalars['Boolean']['output'];
  deleteTeamMatch: Scalars['Boolean']['output'];
  deleteTennisLeague: Scalars['Boolean']['output'];
  deleteTennisTeam: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  joinGroup: Group;
  leaveGroup: Scalars['Boolean']['output'];
  login: AuthPayload;
  makeAdmin: Membership;
  publishLineup: TeamMatchLineup;
  removeAdmin: Membership;
  removeMember: Scalars['Boolean']['output'];
  sendMessage: Message;
  signup: AuthPayload;
  unblockUser: Scalars['Boolean']['output'];
  updateEvent: Event;
  updateGroup: Group;
  updateIndividualDoublesMatch: TeamLeagueIndividualDoublesMatch;
  updateIndividualSinglesMatch: TeamLeagueIndividualSinglesMatch;
  updatePointSystem: TeamLeaguePointSystem;
  updateProfile: User;
  updateRSVP: Rsvp;
  updateTeamLeaguePointSystem: TeamLeaguePointSystem;
  updateTeamMatch: TeamLeagueTeamMatch;
  updateTennisLeague: TeamLeague;
  updateTennisTeam: TeamLeagueTeam;
};


export type MutationAddMemberArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationAddMemberByEmailArgs = {
  email: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
};


export type MutationAddMemberByUsernameArgs = {
  groupId: Scalars['ID']['input'];
  username: Scalars['String']['input'];
};


export type MutationBlockUserArgs = {
  input: BlockUserInput;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationCreateIndividualDoublesMatchArgs = {
  input: CreateIndividualDoublesMatchInput;
  leagueId: Scalars['ID']['input'];
};


export type MutationCreateIndividualSinglesMatchArgs = {
  input: CreateIndividualSinglesMatchInput;
  leagueId: Scalars['ID']['input'];
};


export type MutationCreateOrUpdateLineupArgs = {
  input: LineupInput;
};


export type MutationCreateRsvpArgs = {
  input: CreateRsvpInput;
};


export type MutationCreateTeamLeaguePointSystemArgs = {
  input: CreateTeamLeaguePointSystemInput;
  leagueId: Scalars['ID']['input'];
};


export type MutationCreateTeamMatchArgs = {
  input: CreateTeamMatchInput;
  leagueId: Scalars['ID']['input'];
};


export type MutationCreateTennisLeagueArgs = {
  input: CreateTennisLeagueInput;
};


export type MutationCreateTennisTeamArgs = {
  input: CreateTennisTeamInput;
  leagueId: Scalars['ID']['input'];
};


export type MutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteGroupArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteIndividualDoublesMatchArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteIndividualSinglesMatchArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRsvpArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTeamLeaguePointSystemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTeamMatchArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTennisLeagueArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTennisTeamArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  userId: Scalars['ID']['input'];
};


export type MutationJoinGroupArgs = {
  groupId: Scalars['ID']['input'];
};


export type MutationLeaveGroupArgs = {
  groupId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMakeAdminArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationPublishLineupArgs = {
  lineupId: Scalars['ID']['input'];
  visibility: LineupVisibility;
};


export type MutationRemoveAdminArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationRemoveMemberArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationSendMessageArgs = {
  input: SendMessageInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUnblockUserArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationUpdateEventArgs = {
  id: Scalars['ID']['input'];
  input: CreateEventInput;
};


export type MutationUpdateGroupArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGroupInput;
};


export type MutationUpdateIndividualDoublesMatchArgs = {
  id: Scalars['ID']['input'];
  input: UpdateIndividualDoublesMatchInput;
};


export type MutationUpdateIndividualSinglesMatchArgs = {
  id: Scalars['ID']['input'];
  input: UpdateIndividualSinglesMatchInput;
};


export type MutationUpdatePointSystemArgs = {
  input: UpdatePointSystemInput;
  leagueId: Scalars['ID']['input'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateRsvpArgs = {
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  status: RsvpStatus;
};


export type MutationUpdateTeamLeaguePointSystemArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTeamLeaguePointSystemInput;
};


export type MutationUpdateTeamMatchArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTeamMatchInput;
};


export type MutationUpdateTennisLeagueArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTennisLeagueInput;
};


export type MutationUpdateTennisTeamArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTennisTeamInput;
};

export type Query = {
  __typename?: 'Query';
  event: Maybe<Event>;
  events: Array<Event>;
  group: Maybe<Group>;
  groups: Array<Group>;
  health: Scalars['String']['output'];
  lineup: Maybe<TeamMatchLineup>;
  me: Maybe<User>;
  messages: Array<Message>;
  myGroups: Array<Group>;
  publicGroups: Array<Group>;
  teamMatch: Maybe<TeamLeagueTeamMatch>;
  tennisLeague: Maybe<TeamLeague>;
  tennisLeagueStandings: Array<TeamLeagueStandingsRow>;
  tennisLeagues: Array<TeamLeague>;
  user: Maybe<User>;
  userPendingEvents: Array<Event>;
  userSearch: Array<User>;
  userTennisLeagues: Array<TeamLeague>;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLineupArgs = {
  teamId: Scalars['ID']['input'];
  teamMatchId: Scalars['ID']['input'];
};


export type QueryMessagesArgs = {
  groupId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPublicGroupsArgs = {
  query?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeamMatchArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTennisLeagueArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTennisLeagueStandingsArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserSearchArgs = {
  query: Scalars['String']['input'];
};

export type Rsvp = {
  __typename?: 'RSVP';
  createdAt: Scalars['DateTime']['output'];
  event: Event;
  id: Scalars['ID']['output'];
  note: Maybe<Scalars['String']['output']>;
  status: RsvpStatus;
  user: User;
};

export type RsvpStatus =
  | 'AVAILABLE'
  | 'MAYBE'
  | 'NOT_AVAILABLE'
  | 'ONLY_IF_NEEDED';

export type ResultType =
  | 'C'
  | 'D'
  | 'NONE'
  | 'TM';

export type SendMessageInput = {
  content: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
};

export type SignupInput = {
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  eventCreated: Event;
  memberJoined: Membership;
  messageAdded: Message;
  rsvpUpdated: Rsvp;
};


export type SubscriptionEventCreatedArgs = {
  groupId: Scalars['ID']['input'];
};


export type SubscriptionMemberJoinedArgs = {
  groupId: Scalars['ID']['input'];
};


export type SubscriptionMessageAddedArgs = {
  groupId: Scalars['ID']['input'];
};


export type SubscriptionRsvpUpdatedArgs = {
  eventId: Scalars['ID']['input'];
};

export type TeamLeague = {
  __typename?: 'TeamLeague';
  createdAt: Scalars['DateTime']['output'];
  description: Maybe<Scalars['String']['output']>;
  endDate: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  pointSystems: Array<TeamLeaguePointSystem>;
  startDate: Scalars['DateTime']['output'];
  teamMatches: Array<TeamLeagueTeamMatch>;
  teams: Array<TeamLeagueTeam>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TeamLeagueIndividualDoublesMatch = {
  __typename?: 'TeamLeagueIndividualDoublesMatch';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  matchDate: Scalars['DateTime']['output'];
  order: Scalars['Int']['output'];
  resultType: Maybe<ResultType>;
  score: Scalars['String']['output'];
  team1Player1: User;
  team1Player1Id: Scalars['String']['output'];
  team1Player2: User;
  team1Player2Id: Scalars['String']['output'];
  team2Player1: User;
  team2Player1Id: Scalars['String']['output'];
  team2Player2: User;
  team2Player2Id: Scalars['String']['output'];
  teamMatch: TeamLeagueTeamMatch;
  teamMatchId: Scalars['String']['output'];
  winner: Maybe<Winner>;
};

export type TeamLeagueIndividualSinglesMatch = {
  __typename?: 'TeamLeagueIndividualSinglesMatch';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  matchDate: Scalars['DateTime']['output'];
  order: Scalars['Int']['output'];
  player1: User;
  player1Id: Scalars['String']['output'];
  player2: User;
  player2Id: Scalars['String']['output'];
  resultType: Maybe<ResultType>;
  score: Scalars['String']['output'];
  teamMatch: TeamLeagueTeamMatch;
  teamMatchId: Scalars['String']['output'];
  winner: Maybe<Winner>;
};

export type TeamLeaguePointSystem = {
  __typename?: 'TeamLeaguePointSystem';
  defaultDrawPoints: Scalars['Int']['output'];
  defaultLossPoints: Scalars['Int']['output'];
  defaultWinPoints: Scalars['Int']['output'];
  drawPoints: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lossPoints: Scalars['Int']['output'];
  matchType: MatchType;
  order: Scalars['Int']['output'];
  teamLeagueId: Scalars['String']['output'];
  winPoints: Scalars['Int']['output'];
};

export type TeamLeagueStandingsRow = {
  __typename?: 'TeamLeagueStandingsRow';
  draws: Scalars['Int']['output'];
  gamesLost: Scalars['Int']['output'];
  gamesWon: Scalars['Int']['output'];
  losses: Scalars['Int']['output'];
  matchesPlayed: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  teamId: Scalars['String']['output'];
  teamName: Scalars['String']['output'];
  wins: Scalars['Int']['output'];
};

export type TeamLeagueTeam = {
  __typename?: 'TeamLeagueTeam';
  captain: User;
  captainId: Scalars['String']['output'];
  group: Group;
  id: Scalars['ID']['output'];
  members: Array<User>;
};

export type TeamLeagueTeamMatch = {
  __typename?: 'TeamLeagueTeamMatch';
  associatedEvents: Array<Event>;
  awayTeam: TeamLeagueTeam;
  awayTeamEvent: Maybe<Event>;
  awayTeamId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  homeTeam: TeamLeagueTeam;
  homeTeamEvent: Maybe<Event>;
  homeTeamId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  individualDoublesMatches: Array<TeamLeagueIndividualDoublesMatch>;
  individualSinglesMatches: Array<TeamLeagueIndividualSinglesMatch>;
  matchDate: Scalars['DateTime']['output'];
  teamLeagueId: Scalars['String']['output'];
};

export type TeamMatchLineup = {
  __typename?: 'TeamMatchLineup';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  publishedAt: Maybe<Scalars['DateTime']['output']>;
  slots: Array<TeamMatchLineupSlot>;
  teamId: Scalars['String']['output'];
  teamMatchId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  visibility: LineupVisibility;
};

export type TeamMatchLineupSlot = {
  __typename?: 'TeamMatchLineupSlot';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  player1: User;
  player1Id: Scalars['String']['output'];
  player2: Maybe<User>;
  player2Id: Maybe<Scalars['String']['output']>;
  type: LineupSlotType;
};

export type UpdateGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateIndividualDoublesMatchInput = {
  matchDate?: InputMaybe<Scalars['DateTime']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  resultType?: InputMaybe<ResultType>;
  score?: InputMaybe<Scalars['String']['input']>;
  team1Player1Id?: InputMaybe<Scalars['String']['input']>;
  team1Player2Id?: InputMaybe<Scalars['String']['input']>;
  team2Player1Id?: InputMaybe<Scalars['String']['input']>;
  team2Player2Id?: InputMaybe<Scalars['String']['input']>;
  teamMatchId?: InputMaybe<Scalars['String']['input']>;
  winner?: InputMaybe<Winner>;
};

export type UpdateIndividualSinglesMatchInput = {
  matchDate?: InputMaybe<Scalars['DateTime']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  player1Id?: InputMaybe<Scalars['String']['input']>;
  player2Id?: InputMaybe<Scalars['String']['input']>;
  resultType?: InputMaybe<ResultType>;
  score?: InputMaybe<Scalars['String']['input']>;
  teamMatchId?: InputMaybe<Scalars['String']['input']>;
  winner?: InputMaybe<Winner>;
};

export type UpdatePointSystemInput = {
  defaultDrawPoints?: InputMaybe<Scalars['Int']['input']>;
  defaultLossPoints?: InputMaybe<Scalars['Int']['input']>;
  defaultWinPoints?: InputMaybe<Scalars['Int']['input']>;
  drawPoints?: InputMaybe<Scalars['Int']['input']>;
  lossPoints?: InputMaybe<Scalars['Int']['input']>;
  winPoints?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTeamLeaguePointSystemInput = {
  drawPoints?: InputMaybe<Scalars['Int']['input']>;
  lossPoints?: InputMaybe<Scalars['Int']['input']>;
  matchType?: InputMaybe<MatchType>;
  order?: InputMaybe<Scalars['Int']['input']>;
  winPoints?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTeamMatchInput = {
  awayTeamId?: InputMaybe<Scalars['String']['input']>;
  homeTeamId?: InputMaybe<Scalars['String']['input']>;
  matchDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateTennisLeagueInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateTennisTeamInput = {
  captainId?: InputMaybe<Scalars['String']['input']>;
  groupId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  photoUrl?: InputMaybe<Scalars['String']['input']>;
  username?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avatar: Maybe<Scalars['String']['output']>;
  bio: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName: Maybe<Scalars['String']['output']>;
  memberships: Array<Membership>;
  messages: Array<Message>;
  phone: Maybe<Scalars['String']['output']>;
  photoUrl: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type Winner =
  | 'AWAY'
  | 'HOME';

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AuthPayload: ResolverTypeWrapper<AuthPayload>;
  BlockUserInput: BlockUserInput;
  BlockedUser: ResolverTypeWrapper<BlockedUser>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  ChangePasswordInput: ChangePasswordInput;
  ChangePasswordResponse: ResolverTypeWrapper<ChangePasswordResponse>;
  CreateEventInput: CreateEventInput;
  CreateGroupInput: CreateGroupInput;
  CreateIndividualDoublesMatchInput: CreateIndividualDoublesMatchInput;
  CreateIndividualSinglesMatchInput: CreateIndividualSinglesMatchInput;
  CreateRSVPInput: CreateRsvpInput;
  CreateTeamLeaguePointSystemInput: CreateTeamLeaguePointSystemInput;
  CreateTeamMatchInput: CreateTeamMatchInput;
  CreateTennisLeagueInput: CreateTennisLeagueInput;
  CreateTennisTeamInput: CreateTennisTeamInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Event: ResolverTypeWrapper<Event>;
  Group: ResolverTypeWrapper<Group>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LineupInput: LineupInput;
  LineupSlotInput: LineupSlotInput;
  LineupSlotType: LineupSlotType;
  LineupVisibility: LineupVisibility;
  LoginInput: LoginInput;
  MatchType: MatchType;
  Membership: ResolverTypeWrapper<Membership>;
  Message: ResolverTypeWrapper<Message>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  RSVP: ResolverTypeWrapper<Rsvp>;
  RSVPStatus: RsvpStatus;
  ResultType: ResultType;
  SendMessageInput: SendMessageInput;
  SignupInput: SignupInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscription: ResolverTypeWrapper<{}>;
  TeamLeague: ResolverTypeWrapper<TeamLeague>;
  TeamLeagueIndividualDoublesMatch: ResolverTypeWrapper<TeamLeagueIndividualDoublesMatch>;
  TeamLeagueIndividualSinglesMatch: ResolverTypeWrapper<TeamLeagueIndividualSinglesMatch>;
  TeamLeaguePointSystem: ResolverTypeWrapper<TeamLeaguePointSystem>;
  TeamLeagueStandingsRow: ResolverTypeWrapper<TeamLeagueStandingsRow>;
  TeamLeagueTeam: ResolverTypeWrapper<TeamLeagueTeam>;
  TeamLeagueTeamMatch: ResolverTypeWrapper<TeamLeagueTeamMatch>;
  TeamMatchLineup: ResolverTypeWrapper<TeamMatchLineup>;
  TeamMatchLineupSlot: ResolverTypeWrapper<TeamMatchLineupSlot>;
  UpdateGroupInput: UpdateGroupInput;
  UpdateIndividualDoublesMatchInput: UpdateIndividualDoublesMatchInput;
  UpdateIndividualSinglesMatchInput: UpdateIndividualSinglesMatchInput;
  UpdatePointSystemInput: UpdatePointSystemInput;
  UpdateTeamLeaguePointSystemInput: UpdateTeamLeaguePointSystemInput;
  UpdateTeamMatchInput: UpdateTeamMatchInput;
  UpdateTennisLeagueInput: UpdateTennisLeagueInput;
  UpdateTennisTeamInput: UpdateTennisTeamInput;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<User>;
  Winner: Winner;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AuthPayload: AuthPayload;
  BlockUserInput: BlockUserInput;
  BlockedUser: BlockedUser;
  Boolean: Scalars['Boolean']['output'];
  ChangePasswordInput: ChangePasswordInput;
  ChangePasswordResponse: ChangePasswordResponse;
  CreateEventInput: CreateEventInput;
  CreateGroupInput: CreateGroupInput;
  CreateIndividualDoublesMatchInput: CreateIndividualDoublesMatchInput;
  CreateIndividualSinglesMatchInput: CreateIndividualSinglesMatchInput;
  CreateRSVPInput: CreateRsvpInput;
  CreateTeamLeaguePointSystemInput: CreateTeamLeaguePointSystemInput;
  CreateTeamMatchInput: CreateTeamMatchInput;
  CreateTennisLeagueInput: CreateTennisLeagueInput;
  CreateTennisTeamInput: CreateTennisTeamInput;
  DateTime: Scalars['DateTime']['output'];
  Event: Event;
  Group: Group;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LineupInput: LineupInput;
  LineupSlotInput: LineupSlotInput;
  LoginInput: LoginInput;
  Membership: Membership;
  Message: Message;
  Mutation: {};
  Query: {};
  RSVP: Rsvp;
  SendMessageInput: SendMessageInput;
  SignupInput: SignupInput;
  String: Scalars['String']['output'];
  Subscription: {};
  TeamLeague: TeamLeague;
  TeamLeagueIndividualDoublesMatch: TeamLeagueIndividualDoublesMatch;
  TeamLeagueIndividualSinglesMatch: TeamLeagueIndividualSinglesMatch;
  TeamLeaguePointSystem: TeamLeaguePointSystem;
  TeamLeagueStandingsRow: TeamLeagueStandingsRow;
  TeamLeagueTeam: TeamLeagueTeam;
  TeamLeagueTeamMatch: TeamLeagueTeamMatch;
  TeamMatchLineup: TeamMatchLineup;
  TeamMatchLineupSlot: TeamMatchLineupSlot;
  UpdateGroupInput: UpdateGroupInput;
  UpdateIndividualDoublesMatchInput: UpdateIndividualDoublesMatchInput;
  UpdateIndividualSinglesMatchInput: UpdateIndividualSinglesMatchInput;
  UpdatePointSystemInput: UpdatePointSystemInput;
  UpdateTeamLeaguePointSystemInput: UpdateTeamLeaguePointSystemInput;
  UpdateTeamMatchInput: UpdateTeamMatchInput;
  UpdateTennisLeagueInput: UpdateTennisLeagueInput;
  UpdateTennisTeamInput: UpdateTennisTeamInput;
  UpdateUserInput: UpdateUserInput;
  User: User;
}>;

export type AuthPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['AuthPayload'] = ResolversParentTypes['AuthPayload']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BlockedUserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['BlockedUser'] = ResolversParentTypes['BlockedUser']> = ResolversObject<{
  blockedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  blockedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  group?: Resolver<ResolversTypes['Group'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ChangePasswordResponseResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ChangePasswordResponse'] = ResolversParentTypes['ChangePasswordResponse']> = ResolversObject<{
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  createdBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  group?: Resolver<ResolversTypes['Group'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  rsvps?: Resolver<Array<ResolversTypes['RSVP']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GroupResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Group'] = ResolversParentTypes['Group']> = ResolversObject<{
  blockedUsers?: Resolver<Array<ResolversTypes['BlockedUser']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isPublic?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['Membership']>, ParentType, ContextType>;
  memberships?: Resolver<Array<ResolversTypes['Membership']>, ParentType, ContextType>;
  messages?: Resolver<Array<ResolversTypes['Message']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  rsvps?: Resolver<Array<ResolversTypes['RSVP']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MembershipResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Membership'] = ResolversParentTypes['Membership']> = ResolversObject<{
  group?: Resolver<ResolversTypes['Group'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAdmin?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  joinedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  memberId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MessageResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Message'] = ResolversParentTypes['Message']> = ResolversObject<{
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  group?: Resolver<ResolversTypes['Group'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addMember?: Resolver<ResolversTypes['Membership'], ParentType, ContextType, RequireFields<MutationAddMemberArgs, 'groupId' | 'userId'>>;
  addMemberByEmail?: Resolver<ResolversTypes['Membership'], ParentType, ContextType, RequireFields<MutationAddMemberByEmailArgs, 'email' | 'groupId'>>;
  addMemberByUsername?: Resolver<ResolversTypes['Membership'], ParentType, ContextType, RequireFields<MutationAddMemberByUsernameArgs, 'groupId' | 'username'>>;
  blockUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationBlockUserArgs, 'input'>>;
  changePassword?: Resolver<ResolversTypes['ChangePasswordResponse'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'input'>>;
  createEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationCreateEventArgs, 'input'>>;
  createGroup?: Resolver<ResolversTypes['Group'], ParentType, ContextType, RequireFields<MutationCreateGroupArgs, 'input'>>;
  createIndividualDoublesMatch?: Resolver<ResolversTypes['TeamLeagueIndividualDoublesMatch'], ParentType, ContextType, RequireFields<MutationCreateIndividualDoublesMatchArgs, 'input' | 'leagueId'>>;
  createIndividualSinglesMatch?: Resolver<ResolversTypes['TeamLeagueIndividualSinglesMatch'], ParentType, ContextType, RequireFields<MutationCreateIndividualSinglesMatchArgs, 'input' | 'leagueId'>>;
  createOrUpdateLineup?: Resolver<ResolversTypes['TeamMatchLineup'], ParentType, ContextType, RequireFields<MutationCreateOrUpdateLineupArgs, 'input'>>;
  createRSVP?: Resolver<ResolversTypes['RSVP'], ParentType, ContextType, RequireFields<MutationCreateRsvpArgs, 'input'>>;
  createTeamLeaguePointSystem?: Resolver<ResolversTypes['TeamLeaguePointSystem'], ParentType, ContextType, RequireFields<MutationCreateTeamLeaguePointSystemArgs, 'input' | 'leagueId'>>;
  createTeamMatch?: Resolver<ResolversTypes['TeamLeagueTeamMatch'], ParentType, ContextType, RequireFields<MutationCreateTeamMatchArgs, 'input' | 'leagueId'>>;
  createTennisLeague?: Resolver<ResolversTypes['TeamLeague'], ParentType, ContextType, RequireFields<MutationCreateTennisLeagueArgs, 'input'>>;
  createTennisTeam?: Resolver<ResolversTypes['TeamLeagueTeam'], ParentType, ContextType, RequireFields<MutationCreateTennisTeamArgs, 'input' | 'leagueId'>>;
  deleteEvent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteEventArgs, 'id'>>;
  deleteGroup?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteGroupArgs, 'id'>>;
  deleteIndividualDoublesMatch?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteIndividualDoublesMatchArgs, 'id'>>;
  deleteIndividualSinglesMatch?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteIndividualSinglesMatchArgs, 'id'>>;
  deleteRSVP?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteRsvpArgs, 'id'>>;
  deleteTeamLeaguePointSystem?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTeamLeaguePointSystemArgs, 'id'>>;
  deleteTeamMatch?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTeamMatchArgs, 'id'>>;
  deleteTennisLeague?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTennisLeagueArgs, 'id'>>;
  deleteTennisTeam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTennisTeamArgs, 'id'>>;
  deleteUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'userId'>>;
  joinGroup?: Resolver<ResolversTypes['Group'], ParentType, ContextType, RequireFields<MutationJoinGroupArgs, 'groupId'>>;
  leaveGroup?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationLeaveGroupArgs, 'groupId'>>;
  login?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  makeAdmin?: Resolver<ResolversTypes['Membership'], ParentType, ContextType, RequireFields<MutationMakeAdminArgs, 'groupId' | 'userId'>>;
  publishLineup?: Resolver<ResolversTypes['TeamMatchLineup'], ParentType, ContextType, RequireFields<MutationPublishLineupArgs, 'lineupId' | 'visibility'>>;
  removeAdmin?: Resolver<ResolversTypes['Membership'], ParentType, ContextType, RequireFields<MutationRemoveAdminArgs, 'groupId' | 'userId'>>;
  removeMember?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRemoveMemberArgs, 'groupId' | 'userId'>>;
  sendMessage?: Resolver<ResolversTypes['Message'], ParentType, ContextType, RequireFields<MutationSendMessageArgs, 'input'>>;
  signup?: Resolver<ResolversTypes['AuthPayload'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  unblockUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationUnblockUserArgs, 'groupId' | 'userId'>>;
  updateEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationUpdateEventArgs, 'id' | 'input'>>;
  updateGroup?: Resolver<ResolversTypes['Group'], ParentType, ContextType, RequireFields<MutationUpdateGroupArgs, 'id' | 'input'>>;
  updateIndividualDoublesMatch?: Resolver<ResolversTypes['TeamLeagueIndividualDoublesMatch'], ParentType, ContextType, RequireFields<MutationUpdateIndividualDoublesMatchArgs, 'id' | 'input'>>;
  updateIndividualSinglesMatch?: Resolver<ResolversTypes['TeamLeagueIndividualSinglesMatch'], ParentType, ContextType, RequireFields<MutationUpdateIndividualSinglesMatchArgs, 'id' | 'input'>>;
  updatePointSystem?: Resolver<ResolversTypes['TeamLeaguePointSystem'], ParentType, ContextType, RequireFields<MutationUpdatePointSystemArgs, 'input' | 'leagueId'>>;
  updateProfile?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateProfileArgs, 'input'>>;
  updateRSVP?: Resolver<ResolversTypes['RSVP'], ParentType, ContextType, RequireFields<MutationUpdateRsvpArgs, 'id' | 'status'>>;
  updateTeamLeaguePointSystem?: Resolver<ResolversTypes['TeamLeaguePointSystem'], ParentType, ContextType, RequireFields<MutationUpdateTeamLeaguePointSystemArgs, 'id' | 'input'>>;
  updateTeamMatch?: Resolver<ResolversTypes['TeamLeagueTeamMatch'], ParentType, ContextType, RequireFields<MutationUpdateTeamMatchArgs, 'id' | 'input'>>;
  updateTennisLeague?: Resolver<ResolversTypes['TeamLeague'], ParentType, ContextType, RequireFields<MutationUpdateTennisLeagueArgs, 'id' | 'input'>>;
  updateTennisTeam?: Resolver<ResolversTypes['TeamLeagueTeam'], ParentType, ContextType, RequireFields<MutationUpdateTennisTeamArgs, 'id' | 'input'>>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  event?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventArgs, 'id'>>;
  events?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType, RequireFields<QueryEventsArgs, 'groupId'>>;
  group?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<QueryGroupArgs, 'id'>>;
  groups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType>;
  health?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lineup?: Resolver<Maybe<ResolversTypes['TeamMatchLineup']>, ParentType, ContextType, RequireFields<QueryLineupArgs, 'teamId' | 'teamMatchId'>>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  messages?: Resolver<Array<ResolversTypes['Message']>, ParentType, ContextType, RequireFields<QueryMessagesArgs, 'groupId' | 'limit'>>;
  myGroups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType>;
  publicGroups?: Resolver<Array<ResolversTypes['Group']>, ParentType, ContextType, Partial<QueryPublicGroupsArgs>>;
  teamMatch?: Resolver<Maybe<ResolversTypes['TeamLeagueTeamMatch']>, ParentType, ContextType, RequireFields<QueryTeamMatchArgs, 'id'>>;
  tennisLeague?: Resolver<Maybe<ResolversTypes['TeamLeague']>, ParentType, ContextType, RequireFields<QueryTennisLeagueArgs, 'id'>>;
  tennisLeagueStandings?: Resolver<Array<ResolversTypes['TeamLeagueStandingsRow']>, ParentType, ContextType, RequireFields<QueryTennisLeagueStandingsArgs, 'id'>>;
  tennisLeagues?: Resolver<Array<ResolversTypes['TeamLeague']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  userPendingEvents?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  userSearch?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserSearchArgs, 'query'>>;
  userTennisLeagues?: Resolver<Array<ResolversTypes['TeamLeague']>, ParentType, ContextType>;
}>;

export type RsvpResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RSVP'] = ResolversParentTypes['RSVP']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  event?: Resolver<ResolversTypes['Event'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RSVPStatus'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  eventCreated?: SubscriptionResolver<ResolversTypes['Event'], "eventCreated", ParentType, ContextType, RequireFields<SubscriptionEventCreatedArgs, 'groupId'>>;
  memberJoined?: SubscriptionResolver<ResolversTypes['Membership'], "memberJoined", ParentType, ContextType, RequireFields<SubscriptionMemberJoinedArgs, 'groupId'>>;
  messageAdded?: SubscriptionResolver<ResolversTypes['Message'], "messageAdded", ParentType, ContextType, RequireFields<SubscriptionMessageAddedArgs, 'groupId'>>;
  rsvpUpdated?: SubscriptionResolver<ResolversTypes['RSVP'], "rsvpUpdated", ParentType, ContextType, RequireFields<SubscriptionRsvpUpdatedArgs, 'eventId'>>;
}>;

export type TeamLeagueResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamLeague'] = ResolversParentTypes['TeamLeague']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pointSystems?: Resolver<Array<ResolversTypes['TeamLeaguePointSystem']>, ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  teamMatches?: Resolver<Array<ResolversTypes['TeamLeagueTeamMatch']>, ParentType, ContextType>;
  teams?: Resolver<Array<ResolversTypes['TeamLeagueTeam']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamLeagueIndividualDoublesMatchResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamLeagueIndividualDoublesMatch'] = ResolversParentTypes['TeamLeagueIndividualDoublesMatch']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  matchDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resultType?: Resolver<Maybe<ResolversTypes['ResultType']>, ParentType, ContextType>;
  score?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  team1Player1?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  team1Player1Id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  team1Player2?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  team1Player2Id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  team2Player1?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  team2Player1Id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  team2Player2?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  team2Player2Id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamMatch?: Resolver<ResolversTypes['TeamLeagueTeamMatch'], ParentType, ContextType>;
  teamMatchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  winner?: Resolver<Maybe<ResolversTypes['Winner']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamLeagueIndividualSinglesMatchResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamLeagueIndividualSinglesMatch'] = ResolversParentTypes['TeamLeagueIndividualSinglesMatch']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  matchDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  player1?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  player1Id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  player2?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  player2Id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resultType?: Resolver<Maybe<ResolversTypes['ResultType']>, ParentType, ContextType>;
  score?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamMatch?: Resolver<ResolversTypes['TeamLeagueTeamMatch'], ParentType, ContextType>;
  teamMatchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  winner?: Resolver<Maybe<ResolversTypes['Winner']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamLeaguePointSystemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamLeaguePointSystem'] = ResolversParentTypes['TeamLeaguePointSystem']> = ResolversObject<{
  defaultDrawPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  defaultLossPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  defaultWinPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  drawPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lossPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  matchType?: Resolver<ResolversTypes['MatchType'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  teamLeagueId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  winPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamLeagueStandingsRowResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamLeagueStandingsRow'] = ResolversParentTypes['TeamLeagueStandingsRow']> = ResolversObject<{
  draws?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  gamesLost?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  gamesWon?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  losses?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  matchesPlayed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  points?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  wins?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamLeagueTeamResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamLeagueTeam'] = ResolversParentTypes['TeamLeagueTeam']> = ResolversObject<{
  captain?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  captainId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  group?: Resolver<ResolversTypes['Group'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamLeagueTeamMatchResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamLeagueTeamMatch'] = ResolversParentTypes['TeamLeagueTeamMatch']> = ResolversObject<{
  associatedEvents?: Resolver<Array<ResolversTypes['Event']>, ParentType, ContextType>;
  awayTeam?: Resolver<ResolversTypes['TeamLeagueTeam'], ParentType, ContextType>;
  awayTeamEvent?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>;
  awayTeamId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  homeTeam?: Resolver<ResolversTypes['TeamLeagueTeam'], ParentType, ContextType>;
  homeTeamEvent?: Resolver<Maybe<ResolversTypes['Event']>, ParentType, ContextType>;
  homeTeamId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  individualDoublesMatches?: Resolver<Array<ResolversTypes['TeamLeagueIndividualDoublesMatch']>, ParentType, ContextType>;
  individualSinglesMatches?: Resolver<Array<ResolversTypes['TeamLeagueIndividualSinglesMatch']>, ParentType, ContextType>;
  matchDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  teamLeagueId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamMatchLineupResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamMatchLineup'] = ResolversParentTypes['TeamMatchLineup']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  slots?: Resolver<Array<ResolversTypes['TeamMatchLineupSlot']>, ParentType, ContextType>;
  teamId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamMatchId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  visibility?: Resolver<ResolversTypes['LineupVisibility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamMatchLineupSlotResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TeamMatchLineupSlot'] = ResolversParentTypes['TeamMatchLineupSlot']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  player1?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  player1Id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  player2?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  player2Id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['LineupSlotType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  avatar?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emailVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  memberships?: Resolver<Array<ResolversTypes['Membership']>, ParentType, ContextType>;
  messages?: Resolver<Array<ResolversTypes['Message']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  photoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  AuthPayload?: AuthPayloadResolvers<ContextType>;
  BlockedUser?: BlockedUserResolvers<ContextType>;
  ChangePasswordResponse?: ChangePasswordResponseResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Group?: GroupResolvers<ContextType>;
  Membership?: MembershipResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RSVP?: RsvpResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  TeamLeague?: TeamLeagueResolvers<ContextType>;
  TeamLeagueIndividualDoublesMatch?: TeamLeagueIndividualDoublesMatchResolvers<ContextType>;
  TeamLeagueIndividualSinglesMatch?: TeamLeagueIndividualSinglesMatchResolvers<ContextType>;
  TeamLeaguePointSystem?: TeamLeaguePointSystemResolvers<ContextType>;
  TeamLeagueStandingsRow?: TeamLeagueStandingsRowResolvers<ContextType>;
  TeamLeagueTeam?: TeamLeagueTeamResolvers<ContextType>;
  TeamLeagueTeamMatch?: TeamLeagueTeamMatchResolvers<ContextType>;
  TeamMatchLineup?: TeamMatchLineupResolvers<ContextType>;
  TeamMatchLineupSlot?: TeamMatchLineupSlotResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
}>;

