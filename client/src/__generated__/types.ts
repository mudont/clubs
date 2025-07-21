import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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
  reason: InputMaybe<Scalars['String']['input']>;
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

export type BulkCreateSettlementsInput = {
  groupId: Scalars['ID']['input'];
  settlements: Array<CreateSettlementInput>;
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

export type CreateExpenseInput = {
  amount: Scalars['Float']['input'];
  category: Scalars['String']['input'];
  currency: Scalars['String']['input'];
  date: Scalars['DateTime']['input'];
  description: Scalars['String']['input'];
  groupId: Scalars['ID']['input'];
  paidBy: Scalars['ID']['input'];
  receiptUrl: InputMaybe<Scalars['String']['input']>;
  splitType: SplitType;
  splits: Array<ExpenseSplitInput>;
};

export type CreateGroupInput = {
  description: InputMaybe<Scalars['String']['input']>;
  isPublic: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type CreateIndividualDoublesMatchInput = {
  matchDate: Scalars['DateTime']['input'];
  order: Scalars['Int']['input'];
  resultType: InputMaybe<ResultType>;
  score: Scalars['String']['input'];
  team1Player1Id: Scalars['String']['input'];
  team1Player2Id: Scalars['String']['input'];
  team2Player1Id: Scalars['String']['input'];
  team2Player2Id: Scalars['String']['input'];
  teamMatchId: Scalars['String']['input'];
  winner: InputMaybe<Winner>;
};

export type CreateIndividualSinglesMatchInput = {
  matchDate: Scalars['DateTime']['input'];
  order: Scalars['Int']['input'];
  player1Id: Scalars['String']['input'];
  player2Id: Scalars['String']['input'];
  resultType: InputMaybe<ResultType>;
  score: Scalars['String']['input'];
  teamMatchId: Scalars['String']['input'];
  winner: InputMaybe<Winner>;
};

export type CreateRsvpInput = {
  eventId: Scalars['ID']['input'];
  note: InputMaybe<Scalars['String']['input']>;
  status: RsvpStatus;
};

export type CreateSettlementInput = {
  amount: Scalars['Float']['input'];
  currency: Scalars['String']['input'];
  fromUserId: Scalars['ID']['input'];
  groupId: Scalars['ID']['input'];
  notes: InputMaybe<Scalars['String']['input']>;
  paymentMethod: InputMaybe<PaymentMethod>;
  toUserId: Scalars['ID']['input'];
};

export type CreateTeamLeaguePointSystemInput = {
  drawPoints: InputMaybe<Scalars['Int']['input']>;
  lossPoints: InputMaybe<Scalars['Int']['input']>;
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
  description: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['DateTime']['input'];
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  startDate: Scalars['DateTime']['input'];
};

export type CreateTennisTeamInput = {
  captainId: Scalars['String']['input'];
  groupId: Scalars['String']['input'];
};

export type DebtDetail = {
  __typename?: 'DebtDetail';
  amount: Scalars['Float']['output'];
  currency: Scalars['String']['output'];
  toUser: User;
};

export type DebtSummary = {
  __typename?: 'DebtSummary';
  debts: Array<DebtDetail>;
  netAmount: Scalars['Float']['output'];
  totalOwed: Scalars['Float']['output'];
  totalOwedTo: Scalars['Float']['output'];
  user: User;
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

export type Expense = {
  __typename?: 'Expense';
  amount: Scalars['Float']['output'];
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  group: Group;
  id: Scalars['ID']['output'];
  paidBy: User;
  receiptUrl: Maybe<Scalars['String']['output']>;
  settlements: Array<Settlement>;
  splitType: SplitType;
  splits: Array<ExpenseSplit>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ExpenseSplit = {
  __typename?: 'ExpenseSplit';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  expense: Expense;
  id: Scalars['ID']['output'];
  percentage: Maybe<Scalars['Float']['output']>;
  shares: Maybe<Scalars['Int']['output']>;
  user: User;
};

export type ExpenseSplitInput = {
  amount: InputMaybe<Scalars['Float']['input']>;
  percentage: InputMaybe<Scalars['Float']['input']>;
  shares: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
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

export type GroupSettings = {
  __typename?: 'GroupSettings';
  allowExpenses: Scalars['Boolean']['output'];
  autoSettle: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultCurrency: Scalars['String']['output'];
  expenseLimit: Maybe<Scalars['Float']['output']>;
  group: Group;
  id: Scalars['ID']['output'];
  requireApproval: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type LineupInput = {
  slots: Array<LineupSlotInput>;
  teamId: Scalars['String']['input'];
  teamMatchId: Scalars['String']['input'];
  visibility: InputMaybe<LineupVisibility>;
};

export type LineupSlotInput = {
  order: Scalars['Int']['input'];
  player1Id: Scalars['String']['input'];
  player2Id: InputMaybe<Scalars['String']['input']>;
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

export type MarkSettlementPaidInput = {
  notes: InputMaybe<Scalars['String']['input']>;
  paymentMethod: PaymentMethod;
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
  bulkCreateSettlements: Array<Settlement>;
  changePassword: ChangePasswordResponse;
  createEvent: Event;
  createExpense: Expense;
  createGroup: Group;
  createIndividualDoublesMatch: TeamLeagueIndividualDoublesMatch;
  createIndividualSinglesMatch: TeamLeagueIndividualSinglesMatch;
  createOrUpdateLineup: TeamMatchLineup;
  createRSVP: Rsvp;
  createSettlement: Settlement;
  createTeamLeaguePointSystem: TeamLeaguePointSystem;
  createTeamMatch: TeamLeagueTeamMatch;
  createTennisLeague: TeamLeague;
  createTennisTeam: TeamLeagueTeam;
  deleteEvent: Scalars['Boolean']['output'];
  deleteExpense: Scalars['Boolean']['output'];
  deleteGroup: Scalars['Boolean']['output'];
  deleteIndividualDoublesMatch: Scalars['Boolean']['output'];
  deleteIndividualSinglesMatch: Scalars['Boolean']['output'];
  deleteRSVP: Scalars['Boolean']['output'];
  deleteSettlement: Scalars['Boolean']['output'];
  deleteTeamLeaguePointSystem: Scalars['Boolean']['output'];
  deleteTeamMatch: Scalars['Boolean']['output'];
  deleteTennisLeague: Scalars['Boolean']['output'];
  deleteTennisTeam: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  generateOptimalSettlements: Array<Settlement>;
  joinGroup: Group;
  leaveGroup: Scalars['Boolean']['output'];
  login: AuthPayload;
  makeAdmin: Membership;
  markSettlementPaid: Settlement;
  publishLineup: TeamMatchLineup;
  removeAdmin: Membership;
  removeMember: Scalars['Boolean']['output'];
  sendMessage: Message;
  signup: AuthPayload;
  unblockUser: Scalars['Boolean']['output'];
  updateEvent: Event;
  updateExpense: Expense;
  updateGroup: Group;
  updateGroupSettings: GroupSettings;
  updateIndividualDoublesMatch: TeamLeagueIndividualDoublesMatch;
  updateIndividualSinglesMatch: TeamLeagueIndividualSinglesMatch;
  updatePointSystem: TeamLeaguePointSystem;
  updateProfile: User;
  updateRSVP: Rsvp;
  updateSettlement: Settlement;
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


export type MutationBulkCreateSettlementsArgs = {
  input: BulkCreateSettlementsInput;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateEventArgs = {
  input: CreateEventInput;
};


export type MutationCreateExpenseArgs = {
  input: CreateExpenseInput;
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


export type MutationCreateSettlementArgs = {
  input: CreateSettlementInput;
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


export type MutationDeleteExpenseArgs = {
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


export type MutationDeleteSettlementArgs = {
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


export type MutationGenerateOptimalSettlementsArgs = {
  groupId: Scalars['ID']['input'];
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


export type MutationMarkSettlementPaidArgs = {
  id: Scalars['ID']['input'];
  input: MarkSettlementPaidInput;
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


export type MutationUpdateExpenseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateExpenseInput;
};


export type MutationUpdateGroupArgs = {
  id: Scalars['ID']['input'];
  input: UpdateGroupInput;
};


export type MutationUpdateGroupSettingsArgs = {
  groupId: Scalars['ID']['input'];
  input: UpdateGroupSettingsInput;
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
  note: InputMaybe<Scalars['String']['input']>;
  status: RsvpStatus;
};


export type MutationUpdateSettlementArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSettlementInput;
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

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CASH_APP'
  | 'OTHER'
  | 'PAYPAL'
  | 'VENMO';

export type Query = {
  __typename?: 'Query';
  event: Maybe<Event>;
  events: Array<Event>;
  expense: Maybe<Expense>;
  group: Maybe<Group>;
  groupDebtSummary: Array<DebtSummary>;
  groupExpenses: Array<Expense>;
  groupSettings: Maybe<GroupSettings>;
  groupSettlements: Array<Settlement>;
  groups: Array<Group>;
  health: Scalars['String']['output'];
  lineup: Maybe<TeamMatchLineup>;
  me: Maybe<User>;
  messages: Array<Message>;
  myGroups: Array<Group>;
  optimalSettlements: Array<Settlement>;
  publicGroups: Array<Group>;
  teamMatch: Maybe<TeamLeagueTeamMatch>;
  tennisLeague: Maybe<TeamLeague>;
  tennisLeagueStandings: Array<TeamLeagueStandingsRow>;
  tennisLeagues: Array<TeamLeague>;
  user: Maybe<User>;
  userDebtSummary: Maybe<DebtSummary>;
  userExpenses: Array<Expense>;
  userPendingEvents: Array<Event>;
  userSearch: Array<User>;
  userSettlements: Array<Settlement>;
  userTennisLeagues: Array<TeamLeague>;
};


export type QueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type QueryEventsArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryExpenseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGroupArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGroupDebtSummaryArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryGroupExpensesArgs = {
  groupId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGroupSettingsArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryGroupSettlementsArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryLineupArgs = {
  teamId: Scalars['ID']['input'];
  teamMatchId: Scalars['ID']['input'];
};


export type QueryMessagesArgs = {
  groupId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOptimalSettlementsArgs = {
  groupId: Scalars['ID']['input'];
};


export type QueryPublicGroupsArgs = {
  query: InputMaybe<Scalars['String']['input']>;
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


export type QueryUserDebtSummaryArgs = {
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type QueryUserExpensesArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryUserSearchArgs = {
  query: Scalars['String']['input'];
};


export type QueryUserSettlementsArgs = {
  userId: Scalars['ID']['input'];
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

export type Settlement = {
  __typename?: 'Settlement';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  fromUser: User;
  group: Group;
  id: Scalars['ID']['output'];
  notes: Maybe<Scalars['String']['output']>;
  paidAt: Maybe<Scalars['DateTime']['output']>;
  paymentMethod: Maybe<PaymentMethod>;
  status: SettlementStatus;
  toUser: User;
  updatedAt: Scalars['DateTime']['output'];
};

export type SettlementStatus =
  | 'CANCELLED'
  | 'PAID'
  | 'PENDING';

export type SignupInput = {
  email: Scalars['String']['input'];
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type SplitType =
  | 'CUSTOM'
  | 'EQUAL'
  | 'PERCENTAGE'
  | 'SHARES';

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
  awayTeamId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  homeTeam: TeamLeagueTeam;
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

export type UpdateExpenseInput = {
  amount: InputMaybe<Scalars['Float']['input']>;
  category: InputMaybe<Scalars['String']['input']>;
  currency: InputMaybe<Scalars['String']['input']>;
  date: InputMaybe<Scalars['DateTime']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  receiptUrl: InputMaybe<Scalars['String']['input']>;
  splitType: InputMaybe<SplitType>;
  splits: InputMaybe<Array<ExpenseSplitInput>>;
};

export type UpdateGroupInput = {
  description: InputMaybe<Scalars['String']['input']>;
  isPublic: InputMaybe<Scalars['Boolean']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateGroupSettingsInput = {
  allowExpenses: InputMaybe<Scalars['Boolean']['input']>;
  autoSettle: InputMaybe<Scalars['Boolean']['input']>;
  defaultCurrency: InputMaybe<Scalars['String']['input']>;
  expenseLimit: InputMaybe<Scalars['Float']['input']>;
  requireApproval: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateIndividualDoublesMatchInput = {
  matchDate: InputMaybe<Scalars['DateTime']['input']>;
  order: InputMaybe<Scalars['Int']['input']>;
  resultType: InputMaybe<ResultType>;
  score: InputMaybe<Scalars['String']['input']>;
  team1Player1Id: InputMaybe<Scalars['String']['input']>;
  team1Player2Id: InputMaybe<Scalars['String']['input']>;
  team2Player1Id: InputMaybe<Scalars['String']['input']>;
  team2Player2Id: InputMaybe<Scalars['String']['input']>;
  teamMatchId: InputMaybe<Scalars['String']['input']>;
  winner: InputMaybe<Winner>;
};

export type UpdateIndividualSinglesMatchInput = {
  matchDate: InputMaybe<Scalars['DateTime']['input']>;
  order: InputMaybe<Scalars['Int']['input']>;
  player1Id: InputMaybe<Scalars['String']['input']>;
  player2Id: InputMaybe<Scalars['String']['input']>;
  resultType: InputMaybe<ResultType>;
  score: InputMaybe<Scalars['String']['input']>;
  teamMatchId: InputMaybe<Scalars['String']['input']>;
  winner: InputMaybe<Winner>;
};

export type UpdatePointSystemInput = {
  defaultDrawPoints: InputMaybe<Scalars['Int']['input']>;
  defaultLossPoints: InputMaybe<Scalars['Int']['input']>;
  defaultWinPoints: InputMaybe<Scalars['Int']['input']>;
  drawPoints: InputMaybe<Scalars['Int']['input']>;
  lossPoints: InputMaybe<Scalars['Int']['input']>;
  winPoints: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateSettlementInput = {
  amount: InputMaybe<Scalars['Float']['input']>;
  currency: InputMaybe<Scalars['String']['input']>;
  notes: InputMaybe<Scalars['String']['input']>;
  paymentMethod: InputMaybe<PaymentMethod>;
  status: InputMaybe<SettlementStatus>;
};

export type UpdateTeamLeaguePointSystemInput = {
  drawPoints: InputMaybe<Scalars['Int']['input']>;
  lossPoints: InputMaybe<Scalars['Int']['input']>;
  matchType: InputMaybe<MatchType>;
  order: InputMaybe<Scalars['Int']['input']>;
  winPoints: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTeamMatchInput = {
  awayTeamId: InputMaybe<Scalars['String']['input']>;
  homeTeamId: InputMaybe<Scalars['String']['input']>;
  matchDate: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateTennisLeagueInput = {
  description: InputMaybe<Scalars['String']['input']>;
  endDate: InputMaybe<Scalars['DateTime']['input']>;
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  startDate: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateTennisTeamInput = {
  captainId: InputMaybe<Scalars['String']['input']>;
  groupId: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  bio: InputMaybe<Scalars['String']['input']>;
  firstName: InputMaybe<Scalars['String']['input']>;
  lastName: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  photoUrl: InputMaybe<Scalars['String']['input']>;
  username: InputMaybe<Scalars['String']['input']>;
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

export type TeamLeagueFragmentFragment = { __typename?: 'TeamLeague', id: string, name: string, description: string | null, startDate: string, endDate: string, isActive: boolean, createdAt: string, updatedAt: string, pointSystems: Array<{ __typename?: 'TeamLeaguePointSystem', id: string, matchType: MatchType, order: number, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number }>, teams: Array<{ __typename?: 'TeamLeagueTeam', id: string, captainId: string, group: { __typename?: 'Group', id: string, name: string, description: string | null, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }, captain: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }>, teamMatches: Array<{ __typename?: 'TeamLeagueTeamMatch', id: string, homeTeamId: string, awayTeamId: string, matchDate: string, createdAt: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, individualSinglesMatches: Array<{ __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }>, individualDoublesMatches: Array<{ __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }> };

export type TeamFragmentFragment = { __typename?: 'TeamLeagueTeam', id: string, captainId: string, group: { __typename?: 'Group', id: string, name: string, description: string | null, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }, captain: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } };

export type MatchFragmentFragment = { __typename?: 'TeamLeagueTeamMatch', id: string, homeTeamId: string, awayTeamId: string, matchDate: string, createdAt: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, individualSinglesMatches: Array<{ __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }>, individualDoublesMatches: Array<{ __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> };

export type GetTennisLeaguesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTennisLeaguesQuery = { __typename?: 'Query', tennisLeagues: Array<{ __typename?: 'TeamLeague', id: string, name: string, description: string | null, startDate: string, endDate: string, isActive: boolean, createdAt: string, teams: Array<{ __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string } }> }> };

export type GetTennisLeagueQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTennisLeagueQuery = { __typename?: 'Query', tennisLeague: { __typename?: 'TeamLeague', id: string, name: string, description: string | null, startDate: string, endDate: string, isActive: boolean, createdAt: string, updatedAt: string, pointSystems: Array<{ __typename?: 'TeamLeaguePointSystem', id: string, matchType: MatchType, order: number, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number }>, teams: Array<{ __typename?: 'TeamLeagueTeam', id: string, captainId: string, group: { __typename?: 'Group', id: string, name: string, description: string | null, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }, captain: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }>, teamMatches: Array<{ __typename?: 'TeamLeagueTeamMatch', id: string, homeTeamId: string, awayTeamId: string, matchDate: string, createdAt: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, individualSinglesMatches: Array<{ __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }>, individualDoublesMatches: Array<{ __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }> } | null };

export type GetTennisLeagueStandingsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTennisLeagueStandingsQuery = { __typename?: 'Query', tennisLeagueStandings: Array<{ __typename?: 'TeamLeagueStandingsRow', teamId: string, teamName: string, matchesPlayed: number, wins: number, losses: number, draws: number, points: number, gamesWon: number, gamesLost: number }> };

export type GetLeaguePointSystemsQueryVariables = Exact<{
  leagueId: Scalars['ID']['input'];
}>;


export type GetLeaguePointSystemsQuery = { __typename?: 'Query', tennisLeague: { __typename?: 'TeamLeague', id: string, pointSystems: Array<{ __typename?: 'TeamLeaguePointSystem', id: string, matchType: MatchType, order: number, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number }> } | null };

export type GetLineupQueryVariables = Exact<{
  teamMatchId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
}>;


export type GetLineupQuery = { __typename?: 'Query', lineup: { __typename?: 'TeamMatchLineup', id: string, teamMatchId: string, teamId: string, visibility: LineupVisibility, publishedAt: string | null, createdAt: string, updatedAt: string, slots: Array<{ __typename?: 'TeamMatchLineupSlot', id: string, order: number, type: LineupSlotType, player1Id: string, player2Id: string | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } | null }> } | null };

export type GetTeamMatchQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetTeamMatchQuery = { __typename?: 'Query', teamMatch: { __typename?: 'TeamLeagueTeamMatch', id: string, teamLeagueId: string, homeTeamId: string, awayTeamId: string, matchDate: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, memberships: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, memberships: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } } } | null };

export type GetTeamMatchEventRsvpsQueryVariables = Exact<{
  teamMatchId: Scalars['ID']['input'];
}>;


export type GetTeamMatchEventRsvpsQuery = { __typename?: 'Query', teamMatch: { __typename?: 'TeamLeagueTeamMatch', id: string, matchDate: string, associatedEvents: Array<{ __typename?: 'Event', id: string, date: string, group: { __typename?: 'Group', id: string }, rsvps: Array<{ __typename?: 'RSVP', id: string, status: RsvpStatus, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }> } | null };

export type UserSearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type UserSearchQuery = { __typename?: 'Query', userSearch: Array<{ __typename?: 'User', id: string, username: string, email: string, firstName: string | null, lastName: string | null }> };

export type GroupSearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;


export type GroupSearchQuery = { __typename?: 'Query', publicGroups: Array<{ __typename?: 'Group', id: string, name: string, description: string | null }> };

export type CreateTennisLeagueMutationVariables = Exact<{
  input: CreateTennisLeagueInput;
}>;


export type CreateTennisLeagueMutation = { __typename?: 'Mutation', createTennisLeague: { __typename?: 'TeamLeague', id: string, name: string, description: string | null, startDate: string, endDate: string, isActive: boolean, createdAt: string, updatedAt: string, pointSystems: Array<{ __typename?: 'TeamLeaguePointSystem', id: string, matchType: MatchType, order: number, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number }>, teams: Array<{ __typename?: 'TeamLeagueTeam', id: string, captainId: string, group: { __typename?: 'Group', id: string, name: string, description: string | null, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }, captain: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }>, teamMatches: Array<{ __typename?: 'TeamLeagueTeamMatch', id: string, homeTeamId: string, awayTeamId: string, matchDate: string, createdAt: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, individualSinglesMatches: Array<{ __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }>, individualDoublesMatches: Array<{ __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }> } };

export type UpdateTennisLeagueMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTennisLeagueInput;
}>;


export type UpdateTennisLeagueMutation = { __typename?: 'Mutation', updateTennisLeague: { __typename?: 'TeamLeague', id: string, name: string, description: string | null, startDate: string, endDate: string, isActive: boolean, createdAt: string, updatedAt: string, pointSystems: Array<{ __typename?: 'TeamLeaguePointSystem', id: string, matchType: MatchType, order: number, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number }>, teams: Array<{ __typename?: 'TeamLeagueTeam', id: string, captainId: string, group: { __typename?: 'Group', id: string, name: string, description: string | null, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }, captain: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }>, teamMatches: Array<{ __typename?: 'TeamLeagueTeamMatch', id: string, homeTeamId: string, awayTeamId: string, matchDate: string, createdAt: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, individualSinglesMatches: Array<{ __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }>, individualDoublesMatches: Array<{ __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }> } };

export type DeleteTennisLeagueMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTennisLeagueMutation = { __typename?: 'Mutation', deleteTennisLeague: boolean };

export type CreateTennisTeamMutationVariables = Exact<{
  leagueId: Scalars['ID']['input'];
  input: CreateTennisTeamInput;
}>;


export type CreateTennisTeamMutation = { __typename?: 'Mutation', createTennisTeam: { __typename?: 'TeamLeagueTeam', id: string, captainId: string, group: { __typename?: 'Group', id: string, name: string, description: string | null, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }, captain: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } } };

export type UpdateTennisTeamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTennisTeamInput;
}>;


export type UpdateTennisTeamMutation = { __typename?: 'Mutation', updateTennisTeam: { __typename?: 'TeamLeagueTeam', id: string, captainId: string, group: { __typename?: 'Group', id: string, name: string, description: string | null, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> }, captain: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } } };

export type DeleteTennisTeamMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTennisTeamMutation = { __typename?: 'Mutation', deleteTennisTeam: boolean };

export type CreateTeamMatchMutationVariables = Exact<{
  leagueId: Scalars['ID']['input'];
  input: CreateTeamMatchInput;
}>;


export type CreateTeamMatchMutation = { __typename?: 'Mutation', createTeamMatch: { __typename?: 'TeamLeagueTeamMatch', id: string, homeTeamId: string, awayTeamId: string, matchDate: string, createdAt: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, individualSinglesMatches: Array<{ __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }>, individualDoublesMatches: Array<{ __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } };

export type UpdateTeamMatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTeamMatchInput;
}>;


export type UpdateTeamMatchMutation = { __typename?: 'Mutation', updateTeamMatch: { __typename?: 'TeamLeagueTeamMatch', id: string, homeTeamId: string, awayTeamId: string, matchDate: string, createdAt: string, homeTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, awayTeam: { __typename?: 'TeamLeagueTeam', id: string, group: { __typename?: 'Group', id: string, name: string, members: Array<{ __typename?: 'Membership', user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } }, individualSinglesMatches: Array<{ __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }>, individualDoublesMatches: Array<{ __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, resultType: ResultType | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } }> } };

export type DeleteTeamMatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteTeamMatchMutation = { __typename?: 'Mutation', deleteTeamMatch: boolean };

export type CreateIndividualSinglesMatchMutationVariables = Exact<{
  leagueId: Scalars['ID']['input'];
  input: CreateIndividualSinglesMatchInput;
}>;


export type CreateIndividualSinglesMatchMutation = { __typename?: 'Mutation', createIndividualSinglesMatch: { __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } } };

export type UpdateIndividualSinglesMatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateIndividualSinglesMatchInput;
}>;


export type UpdateIndividualSinglesMatchMutation = { __typename?: 'Mutation', updateIndividualSinglesMatch: { __typename?: 'TeamLeagueIndividualSinglesMatch', id: string, player1Id: string, player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } } };

export type DeleteIndividualSinglesMatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteIndividualSinglesMatchMutation = { __typename?: 'Mutation', deleteIndividualSinglesMatch: boolean };

export type CreateIndividualDoublesMatchMutationVariables = Exact<{
  leagueId: Scalars['ID']['input'];
  input: CreateIndividualDoublesMatchInput;
}>;


export type CreateIndividualDoublesMatchMutation = { __typename?: 'Mutation', createIndividualDoublesMatch: { __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } } };

export type UpdateIndividualDoublesMatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateIndividualDoublesMatchInput;
}>;


export type UpdateIndividualDoublesMatchMutation = { __typename?: 'Mutation', updateIndividualDoublesMatch: { __typename?: 'TeamLeagueIndividualDoublesMatch', id: string, team1Player1Id: string, team1Player2Id: string, team2Player1Id: string, team2Player2Id: string, matchDate: string, createdAt: string, teamMatchId: string, order: number, score: string, winner: Winner | null, team1Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, team1Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, team2Player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, team2Player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } } };

export type DeleteIndividualDoublesMatchMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteIndividualDoublesMatchMutation = { __typename?: 'Mutation', deleteIndividualDoublesMatch: boolean };

export type CreateLeaguePointSystemMutationVariables = Exact<{
  leagueId: Scalars['ID']['input'];
  input: CreateTeamLeaguePointSystemInput;
}>;


export type CreateLeaguePointSystemMutation = { __typename?: 'Mutation', createTeamLeaguePointSystem: { __typename?: 'TeamLeaguePointSystem', id: string, matchType: MatchType, order: number, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number } };

export type UpdateLeaguePointSystemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateTeamLeaguePointSystemInput;
}>;


export type UpdateLeaguePointSystemMutation = { __typename?: 'Mutation', updateTeamLeaguePointSystem: { __typename?: 'TeamLeaguePointSystem', id: string, matchType: MatchType, order: number, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number } };

export type DeleteLeaguePointSystemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteLeaguePointSystemMutation = { __typename?: 'Mutation', deleteTeamLeaguePointSystem: boolean };

export type UpdatePointSystemMutationVariables = Exact<{
  leagueId: Scalars['ID']['input'];
  input: UpdatePointSystemInput;
}>;


export type UpdatePointSystemMutation = { __typename?: 'Mutation', updatePointSystem: { __typename?: 'TeamLeaguePointSystem', id: string, winPoints: number, lossPoints: number, drawPoints: number, defaultWinPoints: number, defaultLossPoints: number, defaultDrawPoints: number } };

export type CreateOrUpdateLineupMutationVariables = Exact<{
  input: LineupInput;
}>;


export type CreateOrUpdateLineupMutation = { __typename?: 'Mutation', createOrUpdateLineup: { __typename?: 'TeamMatchLineup', id: string, teamMatchId: string, teamId: string, visibility: LineupVisibility, publishedAt: string | null, createdAt: string, updatedAt: string, slots: Array<{ __typename?: 'TeamMatchLineupSlot', id: string, order: number, type: LineupSlotType, player1Id: string, player2Id: string | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } | null }> } };

export type PublishLineupMutationVariables = Exact<{
  lineupId: Scalars['ID']['input'];
  visibility: LineupVisibility;
}>;


export type PublishLineupMutation = { __typename?: 'Mutation', publishLineup: { __typename?: 'TeamMatchLineup', id: string, teamMatchId: string, teamId: string, visibility: LineupVisibility, publishedAt: string | null, createdAt: string, updatedAt: string, slots: Array<{ __typename?: 'TeamMatchLineupSlot', id: string, order: number, type: LineupSlotType, player1Id: string, player2Id: string | null, player1: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string }, player2: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null, email: string } | null }> } };

export type GetEventsQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetEventsQuery = { __typename?: 'Query', events: Array<{ __typename?: 'Event', id: string, date: string, description: string, createdBy: { __typename?: 'User', id: string, username: string }, rsvps: Array<{ __typename?: 'RSVP', id: string, status: RsvpStatus, note: string | null, createdAt: string, user: { __typename?: 'User', id: string, username: string, email: string } }> }> };

export type CreateEventMutationVariables = Exact<{
  input: CreateEventInput;
}>;


export type CreateEventMutation = { __typename?: 'Mutation', createEvent: { __typename?: 'Event', id: string, date: string, description: string, createdBy: { __typename?: 'User', id: string, username: string } } };

export type CreateRsvpMutationVariables = Exact<{
  input: CreateRsvpInput;
}>;


export type CreateRsvpMutation = { __typename?: 'Mutation', createRSVP: { __typename?: 'RSVP', id: string, status: RsvpStatus, note: string | null, createdAt: string, event: { __typename?: 'Event', id: string } } };

export type UpdateRsvpMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  status: RsvpStatus;
  note: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateRsvpMutation = { __typename?: 'Mutation', updateRSVP: { __typename?: 'RSVP', id: string, status: RsvpStatus, note: string | null, createdAt: string, event: { __typename?: 'Event', id: string } } };

export type DeleteEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteEventMutation = { __typename?: 'Mutation', deleteEvent: boolean };

export type UpdateEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CreateEventInput;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'Event', id: string, date: string, description: string, createdBy: { __typename?: 'User', id: string, username: string } } };

export type GetUserPendingEventsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserPendingEventsQuery = { __typename?: 'Query', userPendingEvents: Array<{ __typename?: 'Event', id: string, date: string, description: string, group: { __typename?: 'Group', id: string, name: string }, createdBy: { __typename?: 'User', id: string, username: string }, rsvps: Array<{ __typename?: 'RSVP', id: string, status: RsvpStatus, note: string | null, user: { __typename?: 'User', id: string, username: string } }> }> };

export type GetGroupExpensesQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
  limit: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetGroupExpensesQuery = { __typename?: 'Query', groupExpenses: Array<{ __typename?: 'Expense', id: string, description: string, amount: number, currency: string, category: string, date: string, receiptUrl: string | null, splitType: SplitType, createdAt: string, updatedAt: string, paidBy: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string }, splits: Array<{ __typename?: 'ExpenseSplit', id: string, amount: number, percentage: number | null, shares: number | null, createdAt: string, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }> }> };

export type GetExpenseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetExpenseQuery = { __typename?: 'Query', expense: { __typename?: 'Expense', id: string, description: string, amount: number, currency: string, category: string, date: string, receiptUrl: string | null, splitType: SplitType, createdAt: string, updatedAt: string, paidBy: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string }, splits: Array<{ __typename?: 'ExpenseSplit', id: string, amount: number, percentage: number | null, shares: number | null, createdAt: string, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }> } | null };

export type GetUserExpensesQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetUserExpensesQuery = { __typename?: 'Query', userExpenses: Array<{ __typename?: 'Expense', id: string, description: string, amount: number, currency: string, category: string, date: string, receiptUrl: string | null, splitType: SplitType, createdAt: string, updatedAt: string, paidBy: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string }, splits: Array<{ __typename?: 'ExpenseSplit', id: string, amount: number, percentage: number | null, shares: number | null, createdAt: string, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }> }> };

export type GetGroupSettlementsQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetGroupSettlementsQuery = { __typename?: 'Query', groupSettlements: Array<{ __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } }> };

export type GetUserSettlementsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GetUserSettlementsQuery = { __typename?: 'Query', userSettlements: Array<{ __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } }> };

export type GetGroupDebtSummaryQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetGroupDebtSummaryQuery = { __typename?: 'Query', groupDebtSummary: Array<{ __typename?: 'DebtSummary', totalOwed: number, totalOwedTo: number, netAmount: number, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, debts: Array<{ __typename?: 'DebtDetail', amount: number, currency: string, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }> }> };

export type GetUserDebtSummaryQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  groupId: Scalars['ID']['input'];
}>;


export type GetUserDebtSummaryQuery = { __typename?: 'Query', userDebtSummary: { __typename?: 'DebtSummary', totalOwed: number, totalOwedTo: number, netAmount: number, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, debts: Array<{ __typename?: 'DebtDetail', amount: number, currency: string, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }> } | null };

export type GetOptimalSettlementsQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetOptimalSettlementsQuery = { __typename?: 'Query', optimalSettlements: Array<{ __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } }> };

export type GetGroupSettingsQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetGroupSettingsQuery = { __typename?: 'Query', groupSettings: { __typename?: 'GroupSettings', id: string, defaultCurrency: string, allowExpenses: boolean, expenseLimit: number | null, requireApproval: boolean, autoSettle: boolean, createdAt: string, updatedAt: string, group: { __typename?: 'Group', id: string, name: string } } | null };

export type CreateExpenseMutationVariables = Exact<{
  input: CreateExpenseInput;
}>;


export type CreateExpenseMutation = { __typename?: 'Mutation', createExpense: { __typename?: 'Expense', id: string, description: string, amount: number, currency: string, category: string, date: string, receiptUrl: string | null, splitType: SplitType, createdAt: string, updatedAt: string, paidBy: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string }, splits: Array<{ __typename?: 'ExpenseSplit', id: string, amount: number, percentage: number | null, shares: number | null, createdAt: string, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }> } };

export type UpdateExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateExpenseInput;
}>;


export type UpdateExpenseMutation = { __typename?: 'Mutation', updateExpense: { __typename?: 'Expense', id: string, description: string, amount: number, currency: string, category: string, date: string, receiptUrl: string | null, splitType: SplitType, createdAt: string, updatedAt: string, paidBy: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string }, splits: Array<{ __typename?: 'ExpenseSplit', id: string, amount: number, percentage: number | null, shares: number | null, createdAt: string, user: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null } }> } };

export type DeleteExpenseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteExpenseMutation = { __typename?: 'Mutation', deleteExpense: boolean };

export type CreateSettlementMutationVariables = Exact<{
  input: CreateSettlementInput;
}>;


export type CreateSettlementMutation = { __typename?: 'Mutation', createSettlement: { __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } } };

export type UpdateSettlementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSettlementInput;
}>;


export type UpdateSettlementMutation = { __typename?: 'Mutation', updateSettlement: { __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } } };

export type MarkSettlementPaidMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: MarkSettlementPaidInput;
}>;


export type MarkSettlementPaidMutation = { __typename?: 'Mutation', markSettlementPaid: { __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } } };

export type DeleteSettlementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSettlementMutation = { __typename?: 'Mutation', deleteSettlement: boolean };

export type UpdateGroupSettingsMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  input: UpdateGroupSettingsInput;
}>;


export type UpdateGroupSettingsMutation = { __typename?: 'Mutation', updateGroupSettings: { __typename?: 'GroupSettings', id: string, defaultCurrency: string, allowExpenses: boolean, expenseLimit: number | null, requireApproval: boolean, autoSettle: boolean, createdAt: string, updatedAt: string, group: { __typename?: 'Group', id: string, name: string } } };

export type GenerateOptimalSettlementsMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GenerateOptimalSettlementsMutation = { __typename?: 'Mutation', generateOptimalSettlements: Array<{ __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } }> };

export type BulkCreateSettlementsMutationVariables = Exact<{
  input: BulkCreateSettlementsInput;
}>;


export type BulkCreateSettlementsMutation = { __typename?: 'Mutation', bulkCreateSettlements: Array<{ __typename?: 'Settlement', id: string, amount: number, currency: string, status: SettlementStatus, paymentMethod: PaymentMethod | null, notes: string | null, paidAt: string | null, createdAt: string, updatedAt: string, fromUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, toUser: { __typename?: 'User', id: string, username: string, firstName: string | null, lastName: string | null }, group: { __typename?: 'Group', id: string, name: string } }> };

export type GetGroupMembersQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetGroupMembersQuery = { __typename?: 'Query', group: { __typename?: 'Group', id: string, name: string, description: string | null, isPublic: boolean, memberships: Array<{ __typename?: 'Membership', id: string, isAdmin: boolean, memberId: number, joinedAt: string, user: { __typename?: 'User', id: string, username: string, email: string, firstName: string | null, lastName: string | null } }>, blockedUsers: Array<{ __typename?: 'BlockedUser', id: string, blockedAt: string, reason: string | null, user: { __typename?: 'User', id: string, username: string, email: string }, blockedBy: { __typename?: 'User', id: string, username: string } }> } | null };

export type MakeAdminMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type MakeAdminMutation = { __typename?: 'Mutation', makeAdmin: { __typename?: 'Membership', id: string, isAdmin: boolean, user: { __typename?: 'User', id: string, username: string, email: string } } };

export type RemoveAdminMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type RemoveAdminMutation = { __typename?: 'Mutation', removeAdmin: { __typename?: 'Membership', id: string, isAdmin: boolean, user: { __typename?: 'User', id: string, username: string, email: string } } };

export type RemoveMemberMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type RemoveMemberMutation = { __typename?: 'Mutation', removeMember: boolean };

export type BlockUserMutationVariables = Exact<{
  input: BlockUserInput;
}>;


export type BlockUserMutation = { __typename?: 'Mutation', blockUser: boolean };

export type UnblockUserMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
}>;


export type UnblockUserMutation = { __typename?: 'Mutation', unblockUser: boolean };

export type UpdateGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateGroupInput;
}>;


export type UpdateGroupMutation = { __typename?: 'Mutation', updateGroup: { __typename?: 'Group', id: string, name: string, description: string | null, isPublic: boolean } };

export type AddMemberByUsernameMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  username: Scalars['String']['input'];
}>;


export type AddMemberByUsernameMutation = { __typename?: 'Mutation', addMemberByUsername: { __typename?: 'Membership', id: string, role: string, user: { __typename?: 'User', id: string, username: string, email: string, firstName: string | null, lastName: string | null } } };

export type AddMemberByEmailMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
  email: Scalars['String']['input'];
}>;


export type AddMemberByEmailMutation = { __typename?: 'Mutation', addMemberByEmail: { __typename?: 'Membership', id: string, user: { __typename?: 'User', id: string, username: string, email: string, firstName: string | null, lastName: string | null } } };

export type DeleteGroupMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteGroupMutation = { __typename?: 'Mutation', deleteGroup: boolean };

export type GetMyGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyGroupsQuery = { __typename?: 'Query', myGroups: Array<{ __typename?: 'Group', id: string, name: string, description: string | null, isPublic: boolean, createdAt: string, memberships: Array<{ __typename?: 'Membership', id: string, isAdmin: boolean, memberId: number, user: { __typename?: 'User', id: string, username: string, email: string } }> }> };

export type GetPublicGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPublicGroupsQuery = { __typename?: 'Query', publicGroups: Array<{ __typename?: 'Group', id: string, name: string, description: string | null, isPublic: boolean, createdAt: string, memberships: Array<{ __typename?: 'Membership', id: string, isAdmin: boolean, memberId: number, user: { __typename?: 'User', id: string, username: string, email: string } }> }> };

export type CreateGroupMutationVariables = Exact<{
  input: CreateGroupInput;
}>;


export type CreateGroupMutation = { __typename?: 'Mutation', createGroup: { __typename?: 'Group', id: string, name: string, description: string | null, isPublic: boolean, createdAt: string } };

export type JoinGroupMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type JoinGroupMutation = { __typename?: 'Mutation', joinGroup: { __typename?: 'Group', id: string, name: string, description: string | null, isPublic: boolean, createdAt: string } };

export type LeaveGroupMutationVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type LeaveGroupMutation = { __typename?: 'Mutation', leaveGroup: boolean };

export type GetGroupQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetGroupQuery = { __typename?: 'Query', group: { __typename?: 'Group', id: string, name: string, description: string | null, createdAt: string, memberships: Array<{ __typename?: 'Membership', id: string, isAdmin: boolean, memberId: number, user: { __typename?: 'User', id: string, username: string, email: string } }> } | null };

export type GetMessagesQueryVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type GetMessagesQuery = { __typename?: 'Query', messages: Array<{ __typename?: 'Message', id: string, content: string, createdAt: string, user: { __typename?: 'User', id: string, username: string, email: string } }> };

export type SendMessageMutationVariables = Exact<{
  input: SendMessageInput;
}>;


export type SendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'Message', id: string, content: string, createdAt: string, user: { __typename?: 'User', id: string, username: string, email: string } } };

export type OnMessageAddedSubscriptionVariables = Exact<{
  groupId: Scalars['ID']['input'];
}>;


export type OnMessageAddedSubscription = { __typename?: 'Subscription', messageAdded: { __typename?: 'Message', id: string, content: string, createdAt: string, user: { __typename?: 'User', id: string, username: string, email: string } } };

export type GetUserTennisLeaguesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserTennisLeaguesQuery = { __typename?: 'Query', userTennisLeagues: Array<{ __typename?: 'TeamLeague', id: string, name: string, description: string | null, isActive: boolean }> };

export type GetUserProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProfileQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username: string, email: string, firstName: string | null, lastName: string | null, bio: string | null, avatar: string | null, createdAt: string, emailVerified: boolean } | null };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, username: string, email: string, firstName: string | null, lastName: string | null, bio: string | null, avatar: string | null } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: { __typename?: 'ChangePasswordResponse', success: boolean, message: string } };

export type DeleteUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', deleteUser: boolean };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username: string, email: string, emailVerified: boolean, phone: string | null, photoUrl: string | null, firstName: string | null, lastName: string | null } | null };

export const TeamLeagueFragmentFragmentDoc = gql`
    fragment TeamLeagueFragment on TeamLeague {
  id
  name
  description
  startDate
  endDate
  isActive
  createdAt
  updatedAt
  pointSystems {
    id
    matchType
    order
    winPoints
    lossPoints
    drawPoints
    defaultWinPoints
    defaultLossPoints
    defaultDrawPoints
  }
  teams {
    id
    group {
      id
      name
      description
      members {
        user {
          id
          username
          firstName
          lastName
          email
        }
      }
    }
    captainId
    captain {
      id
      username
      firstName
      lastName
    }
  }
  teamMatches {
    id
    homeTeamId
    awayTeamId
    homeTeam {
      id
      group {
        id
        name
        members {
          user {
            id
            username
            firstName
            lastName
            email
          }
        }
      }
    }
    awayTeam {
      id
      group {
        id
        name
        members {
          user {
            id
            username
            firstName
            lastName
            email
          }
        }
      }
    }
    matchDate
    createdAt
    individualSinglesMatches {
      id
      player1Id
      player2Id
      player1 {
        id
        username
        firstName
        lastName
        email
      }
      player2 {
        id
        username
        firstName
        lastName
        email
      }
      matchDate
      createdAt
      teamMatchId
      order
      score
      winner
      resultType
    }
    individualDoublesMatches {
      id
      team1Player1Id
      team1Player2Id
      team2Player1Id
      team2Player2Id
      team1Player1 {
        id
        username
        firstName
        lastName
        email
      }
      team1Player2 {
        id
        username
        firstName
        lastName
        email
      }
      team2Player1 {
        id
        username
        firstName
        lastName
        email
      }
      team2Player2 {
        id
        username
        firstName
        lastName
        email
      }
      matchDate
      createdAt
      teamMatchId
      order
      score
      winner
      resultType
    }
  }
}
    `;
export const TeamFragmentFragmentDoc = gql`
    fragment TeamFragment on TeamLeagueTeam {
  id
  group {
    id
    name
    description
    members {
      user {
        id
        username
        firstName
        lastName
        email
      }
    }
  }
  captainId
  captain {
    id
    username
    firstName
    lastName
  }
}
    `;
export const MatchFragmentFragmentDoc = gql`
    fragment MatchFragment on TeamLeagueTeamMatch {
  id
  homeTeamId
  awayTeamId
  homeTeam {
    id
    group {
      id
      name
      members {
        user {
          id
          username
          firstName
          lastName
          email
        }
      }
    }
  }
  awayTeam {
    id
    group {
      id
      name
      members {
        user {
          id
          username
          firstName
          lastName
          email
        }
      }
    }
  }
  matchDate
  createdAt
  individualSinglesMatches {
    id
    player1Id
    player2Id
    player1 {
      id
      username
      firstName
      lastName
      email
    }
    player2 {
      id
      username
      firstName
      lastName
      email
    }
    matchDate
    createdAt
    teamMatchId
    order
    score
    winner
    resultType
  }
  individualDoublesMatches {
    id
    team1Player1Id
    team1Player2Id
    team2Player1Id
    team2Player2Id
    team1Player1 {
      id
      username
      firstName
      lastName
      email
    }
    team1Player2 {
      id
      username
      firstName
      lastName
      email
    }
    team2Player1 {
      id
      username
      firstName
      lastName
      email
    }
    team2Player2 {
      id
      username
      firstName
      lastName
      email
    }
    matchDate
    createdAt
    teamMatchId
    order
    score
    winner
    resultType
  }
}
    `;
export const GetTennisLeaguesDocument = gql`
    query GetTennisLeagues {
  tennisLeagues {
    id
    name
    description
    startDate
    endDate
    isActive
    createdAt
    teams {
      id
      group {
        id
        name
      }
    }
  }
}
    `;

/**
 * __useGetTennisLeaguesQuery__
 *
 * To run a query within a React component, call `useGetTennisLeaguesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTennisLeaguesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTennisLeaguesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTennisLeaguesQuery(baseOptions?: Apollo.QueryHookOptions<GetTennisLeaguesQuery, GetTennisLeaguesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTennisLeaguesQuery, GetTennisLeaguesQueryVariables>(GetTennisLeaguesDocument, options);
      }
export function useGetTennisLeaguesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTennisLeaguesQuery, GetTennisLeaguesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTennisLeaguesQuery, GetTennisLeaguesQueryVariables>(GetTennisLeaguesDocument, options);
        }
export type GetTennisLeaguesQueryHookResult = ReturnType<typeof useGetTennisLeaguesQuery>;
export type GetTennisLeaguesLazyQueryHookResult = ReturnType<typeof useGetTennisLeaguesLazyQuery>;
export type GetTennisLeaguesQueryResult = Apollo.QueryResult<GetTennisLeaguesQuery, GetTennisLeaguesQueryVariables>;
export const GetTennisLeagueDocument = gql`
    query GetTennisLeague($id: ID!) {
  tennisLeague(id: $id) {
    ...TeamLeagueFragment
  }
}
    ${TeamLeagueFragmentFragmentDoc}`;

/**
 * __useGetTennisLeagueQuery__
 *
 * To run a query within a React component, call `useGetTennisLeagueQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTennisLeagueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTennisLeagueQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTennisLeagueQuery(baseOptions: Apollo.QueryHookOptions<GetTennisLeagueQuery, GetTennisLeagueQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTennisLeagueQuery, GetTennisLeagueQueryVariables>(GetTennisLeagueDocument, options);
      }
export function useGetTennisLeagueLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTennisLeagueQuery, GetTennisLeagueQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTennisLeagueQuery, GetTennisLeagueQueryVariables>(GetTennisLeagueDocument, options);
        }
export type GetTennisLeagueQueryHookResult = ReturnType<typeof useGetTennisLeagueQuery>;
export type GetTennisLeagueLazyQueryHookResult = ReturnType<typeof useGetTennisLeagueLazyQuery>;
export type GetTennisLeagueQueryResult = Apollo.QueryResult<GetTennisLeagueQuery, GetTennisLeagueQueryVariables>;
export const GetTennisLeagueStandingsDocument = gql`
    query GetTennisLeagueStandings($id: ID!) {
  tennisLeagueStandings(id: $id) {
    teamId
    teamName
    matchesPlayed
    wins
    losses
    draws
    points
    gamesWon
    gamesLost
  }
}
    `;

/**
 * __useGetTennisLeagueStandingsQuery__
 *
 * To run a query within a React component, call `useGetTennisLeagueStandingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTennisLeagueStandingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTennisLeagueStandingsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTennisLeagueStandingsQuery(baseOptions: Apollo.QueryHookOptions<GetTennisLeagueStandingsQuery, GetTennisLeagueStandingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTennisLeagueStandingsQuery, GetTennisLeagueStandingsQueryVariables>(GetTennisLeagueStandingsDocument, options);
      }
export function useGetTennisLeagueStandingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTennisLeagueStandingsQuery, GetTennisLeagueStandingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTennisLeagueStandingsQuery, GetTennisLeagueStandingsQueryVariables>(GetTennisLeagueStandingsDocument, options);
        }
export type GetTennisLeagueStandingsQueryHookResult = ReturnType<typeof useGetTennisLeagueStandingsQuery>;
export type GetTennisLeagueStandingsLazyQueryHookResult = ReturnType<typeof useGetTennisLeagueStandingsLazyQuery>;
export type GetTennisLeagueStandingsQueryResult = Apollo.QueryResult<GetTennisLeagueStandingsQuery, GetTennisLeagueStandingsQueryVariables>;
export const GetLeaguePointSystemsDocument = gql`
    query GetLeaguePointSystems($leagueId: ID!) {
  tennisLeague(id: $leagueId) {
    id
    pointSystems {
      id
      matchType
      order
      winPoints
      lossPoints
      drawPoints
      defaultWinPoints
      defaultLossPoints
      defaultDrawPoints
    }
  }
}
    `;

/**
 * __useGetLeaguePointSystemsQuery__
 *
 * To run a query within a React component, call `useGetLeaguePointSystemsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLeaguePointSystemsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLeaguePointSystemsQuery({
 *   variables: {
 *      leagueId: // value for 'leagueId'
 *   },
 * });
 */
export function useGetLeaguePointSystemsQuery(baseOptions: Apollo.QueryHookOptions<GetLeaguePointSystemsQuery, GetLeaguePointSystemsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLeaguePointSystemsQuery, GetLeaguePointSystemsQueryVariables>(GetLeaguePointSystemsDocument, options);
      }
export function useGetLeaguePointSystemsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLeaguePointSystemsQuery, GetLeaguePointSystemsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLeaguePointSystemsQuery, GetLeaguePointSystemsQueryVariables>(GetLeaguePointSystemsDocument, options);
        }
export type GetLeaguePointSystemsQueryHookResult = ReturnType<typeof useGetLeaguePointSystemsQuery>;
export type GetLeaguePointSystemsLazyQueryHookResult = ReturnType<typeof useGetLeaguePointSystemsLazyQuery>;
export type GetLeaguePointSystemsQueryResult = Apollo.QueryResult<GetLeaguePointSystemsQuery, GetLeaguePointSystemsQueryVariables>;
export const GetLineupDocument = gql`
    query GetLineup($teamMatchId: ID!, $teamId: ID!) {
  lineup(teamMatchId: $teamMatchId, teamId: $teamId) {
    id
    teamMatchId
    teamId
    visibility
    publishedAt
    slots {
      id
      order
      type
      player1Id
      player2Id
      player1 {
        id
        username
        firstName
        lastName
        email
      }
      player2 {
        id
        username
        firstName
        lastName
        email
      }
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetLineupQuery__
 *
 * To run a query within a React component, call `useGetLineupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLineupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLineupQuery({
 *   variables: {
 *      teamMatchId: // value for 'teamMatchId'
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useGetLineupQuery(baseOptions: Apollo.QueryHookOptions<GetLineupQuery, GetLineupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLineupQuery, GetLineupQueryVariables>(GetLineupDocument, options);
      }
export function useGetLineupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLineupQuery, GetLineupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLineupQuery, GetLineupQueryVariables>(GetLineupDocument, options);
        }
export type GetLineupQueryHookResult = ReturnType<typeof useGetLineupQuery>;
export type GetLineupLazyQueryHookResult = ReturnType<typeof useGetLineupLazyQuery>;
export type GetLineupQueryResult = Apollo.QueryResult<GetLineupQuery, GetLineupQueryVariables>;
export const GetTeamMatchDocument = gql`
    query GetTeamMatch($id: ID!) {
  teamMatch(id: $id) {
    id
    teamLeagueId
    homeTeamId
    awayTeamId
    matchDate
    homeTeam {
      id
      group {
        id
        memberships {
          user {
            id
            username
            firstName
            lastName
            email
          }
        }
      }
    }
    awayTeam {
      id
      group {
        id
        memberships {
          user {
            id
            username
            firstName
            lastName
            email
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetTeamMatchQuery__
 *
 * To run a query within a React component, call `useGetTeamMatchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamMatchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTeamMatchQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTeamMatchQuery(baseOptions: Apollo.QueryHookOptions<GetTeamMatchQuery, GetTeamMatchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTeamMatchQuery, GetTeamMatchQueryVariables>(GetTeamMatchDocument, options);
      }
export function useGetTeamMatchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTeamMatchQuery, GetTeamMatchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTeamMatchQuery, GetTeamMatchQueryVariables>(GetTeamMatchDocument, options);
        }
export type GetTeamMatchQueryHookResult = ReturnType<typeof useGetTeamMatchQuery>;
export type GetTeamMatchLazyQueryHookResult = ReturnType<typeof useGetTeamMatchLazyQuery>;
export type GetTeamMatchQueryResult = Apollo.QueryResult<GetTeamMatchQuery, GetTeamMatchQueryVariables>;
export const GetTeamMatchEventRsvpsDocument = gql`
    query GetTeamMatchEventRsvps($teamMatchId: ID!) {
  teamMatch(id: $teamMatchId) {
    id
    matchDate
    associatedEvents {
      id
      date
      group {
        id
      }
      rsvps {
        id
        status
        user {
          id
          username
          firstName
          lastName
          email
        }
      }
    }
  }
}
    `;

/**
 * __useGetTeamMatchEventRsvpsQuery__
 *
 * To run a query within a React component, call `useGetTeamMatchEventRsvpsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamMatchEventRsvpsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTeamMatchEventRsvpsQuery({
 *   variables: {
 *      teamMatchId: // value for 'teamMatchId'
 *   },
 * });
 */
export function useGetTeamMatchEventRsvpsQuery(baseOptions: Apollo.QueryHookOptions<GetTeamMatchEventRsvpsQuery, GetTeamMatchEventRsvpsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTeamMatchEventRsvpsQuery, GetTeamMatchEventRsvpsQueryVariables>(GetTeamMatchEventRsvpsDocument, options);
      }
export function useGetTeamMatchEventRsvpsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTeamMatchEventRsvpsQuery, GetTeamMatchEventRsvpsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTeamMatchEventRsvpsQuery, GetTeamMatchEventRsvpsQueryVariables>(GetTeamMatchEventRsvpsDocument, options);
        }
export type GetTeamMatchEventRsvpsQueryHookResult = ReturnType<typeof useGetTeamMatchEventRsvpsQuery>;
export type GetTeamMatchEventRsvpsLazyQueryHookResult = ReturnType<typeof useGetTeamMatchEventRsvpsLazyQuery>;
export type GetTeamMatchEventRsvpsQueryResult = Apollo.QueryResult<GetTeamMatchEventRsvpsQuery, GetTeamMatchEventRsvpsQueryVariables>;
export const UserSearchDocument = gql`
    query UserSearch($query: String!) {
  userSearch(query: $query) {
    id
    username
    email
    firstName
    lastName
  }
}
    `;

/**
 * __useUserSearchQuery__
 *
 * To run a query within a React component, call `useUserSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserSearchQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useUserSearchQuery(baseOptions: Apollo.QueryHookOptions<UserSearchQuery, UserSearchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserSearchQuery, UserSearchQueryVariables>(UserSearchDocument, options);
      }
export function useUserSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserSearchQuery, UserSearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserSearchQuery, UserSearchQueryVariables>(UserSearchDocument, options);
        }
export type UserSearchQueryHookResult = ReturnType<typeof useUserSearchQuery>;
export type UserSearchLazyQueryHookResult = ReturnType<typeof useUserSearchLazyQuery>;
export type UserSearchQueryResult = Apollo.QueryResult<UserSearchQuery, UserSearchQueryVariables>;
export const GroupSearchDocument = gql`
    query GroupSearch($query: String!) {
  publicGroups(query: $query) {
    id
    name
    description
  }
}
    `;

/**
 * __useGroupSearchQuery__
 *
 * To run a query within a React component, call `useGroupSearchQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupSearchQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupSearchQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGroupSearchQuery(baseOptions: Apollo.QueryHookOptions<GroupSearchQuery, GroupSearchQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GroupSearchQuery, GroupSearchQueryVariables>(GroupSearchDocument, options);
      }
export function useGroupSearchLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GroupSearchQuery, GroupSearchQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GroupSearchQuery, GroupSearchQueryVariables>(GroupSearchDocument, options);
        }
export type GroupSearchQueryHookResult = ReturnType<typeof useGroupSearchQuery>;
export type GroupSearchLazyQueryHookResult = ReturnType<typeof useGroupSearchLazyQuery>;
export type GroupSearchQueryResult = Apollo.QueryResult<GroupSearchQuery, GroupSearchQueryVariables>;
export const CreateTennisLeagueDocument = gql`
    mutation CreateTennisLeague($input: CreateTennisLeagueInput!) {
  createTennisLeague(input: $input) {
    ...TeamLeagueFragment
  }
}
    ${TeamLeagueFragmentFragmentDoc}`;
export type CreateTennisLeagueMutationFn = Apollo.MutationFunction<CreateTennisLeagueMutation, CreateTennisLeagueMutationVariables>;

/**
 * __useCreateTennisLeagueMutation__
 *
 * To run a mutation, you first call `useCreateTennisLeagueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTennisLeagueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTennisLeagueMutation, { data, loading, error }] = useCreateTennisLeagueMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTennisLeagueMutation(baseOptions?: Apollo.MutationHookOptions<CreateTennisLeagueMutation, CreateTennisLeagueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTennisLeagueMutation, CreateTennisLeagueMutationVariables>(CreateTennisLeagueDocument, options);
      }
export type CreateTennisLeagueMutationHookResult = ReturnType<typeof useCreateTennisLeagueMutation>;
export type CreateTennisLeagueMutationResult = Apollo.MutationResult<CreateTennisLeagueMutation>;
export type CreateTennisLeagueMutationOptions = Apollo.BaseMutationOptions<CreateTennisLeagueMutation, CreateTennisLeagueMutationVariables>;
export const UpdateTennisLeagueDocument = gql`
    mutation UpdateTennisLeague($id: ID!, $input: UpdateTennisLeagueInput!) {
  updateTennisLeague(id: $id, input: $input) {
    ...TeamLeagueFragment
  }
}
    ${TeamLeagueFragmentFragmentDoc}`;
export type UpdateTennisLeagueMutationFn = Apollo.MutationFunction<UpdateTennisLeagueMutation, UpdateTennisLeagueMutationVariables>;

/**
 * __useUpdateTennisLeagueMutation__
 *
 * To run a mutation, you first call `useUpdateTennisLeagueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTennisLeagueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTennisLeagueMutation, { data, loading, error }] = useUpdateTennisLeagueMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTennisLeagueMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTennisLeagueMutation, UpdateTennisLeagueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTennisLeagueMutation, UpdateTennisLeagueMutationVariables>(UpdateTennisLeagueDocument, options);
      }
export type UpdateTennisLeagueMutationHookResult = ReturnType<typeof useUpdateTennisLeagueMutation>;
export type UpdateTennisLeagueMutationResult = Apollo.MutationResult<UpdateTennisLeagueMutation>;
export type UpdateTennisLeagueMutationOptions = Apollo.BaseMutationOptions<UpdateTennisLeagueMutation, UpdateTennisLeagueMutationVariables>;
export const DeleteTennisLeagueDocument = gql`
    mutation DeleteTennisLeague($id: ID!) {
  deleteTennisLeague(id: $id)
}
    `;
export type DeleteTennisLeagueMutationFn = Apollo.MutationFunction<DeleteTennisLeagueMutation, DeleteTennisLeagueMutationVariables>;

/**
 * __useDeleteTennisLeagueMutation__
 *
 * To run a mutation, you first call `useDeleteTennisLeagueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTennisLeagueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTennisLeagueMutation, { data, loading, error }] = useDeleteTennisLeagueMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTennisLeagueMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTennisLeagueMutation, DeleteTennisLeagueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTennisLeagueMutation, DeleteTennisLeagueMutationVariables>(DeleteTennisLeagueDocument, options);
      }
export type DeleteTennisLeagueMutationHookResult = ReturnType<typeof useDeleteTennisLeagueMutation>;
export type DeleteTennisLeagueMutationResult = Apollo.MutationResult<DeleteTennisLeagueMutation>;
export type DeleteTennisLeagueMutationOptions = Apollo.BaseMutationOptions<DeleteTennisLeagueMutation, DeleteTennisLeagueMutationVariables>;
export const CreateTennisTeamDocument = gql`
    mutation CreateTennisTeam($leagueId: ID!, $input: CreateTennisTeamInput!) {
  createTennisTeam(leagueId: $leagueId, input: $input) {
    ...TeamFragment
  }
}
    ${TeamFragmentFragmentDoc}`;
export type CreateTennisTeamMutationFn = Apollo.MutationFunction<CreateTennisTeamMutation, CreateTennisTeamMutationVariables>;

/**
 * __useCreateTennisTeamMutation__
 *
 * To run a mutation, you first call `useCreateTennisTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTennisTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTennisTeamMutation, { data, loading, error }] = useCreateTennisTeamMutation({
 *   variables: {
 *      leagueId: // value for 'leagueId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTennisTeamMutation(baseOptions?: Apollo.MutationHookOptions<CreateTennisTeamMutation, CreateTennisTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTennisTeamMutation, CreateTennisTeamMutationVariables>(CreateTennisTeamDocument, options);
      }
export type CreateTennisTeamMutationHookResult = ReturnType<typeof useCreateTennisTeamMutation>;
export type CreateTennisTeamMutationResult = Apollo.MutationResult<CreateTennisTeamMutation>;
export type CreateTennisTeamMutationOptions = Apollo.BaseMutationOptions<CreateTennisTeamMutation, CreateTennisTeamMutationVariables>;
export const UpdateTennisTeamDocument = gql`
    mutation UpdateTennisTeam($id: ID!, $input: UpdateTennisTeamInput!) {
  updateTennisTeam(id: $id, input: $input) {
    ...TeamFragment
  }
}
    ${TeamFragmentFragmentDoc}`;
export type UpdateTennisTeamMutationFn = Apollo.MutationFunction<UpdateTennisTeamMutation, UpdateTennisTeamMutationVariables>;

/**
 * __useUpdateTennisTeamMutation__
 *
 * To run a mutation, you first call `useUpdateTennisTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTennisTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTennisTeamMutation, { data, loading, error }] = useUpdateTennisTeamMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTennisTeamMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTennisTeamMutation, UpdateTennisTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTennisTeamMutation, UpdateTennisTeamMutationVariables>(UpdateTennisTeamDocument, options);
      }
export type UpdateTennisTeamMutationHookResult = ReturnType<typeof useUpdateTennisTeamMutation>;
export type UpdateTennisTeamMutationResult = Apollo.MutationResult<UpdateTennisTeamMutation>;
export type UpdateTennisTeamMutationOptions = Apollo.BaseMutationOptions<UpdateTennisTeamMutation, UpdateTennisTeamMutationVariables>;
export const DeleteTennisTeamDocument = gql`
    mutation DeleteTennisTeam($id: ID!) {
  deleteTennisTeam(id: $id)
}
    `;
export type DeleteTennisTeamMutationFn = Apollo.MutationFunction<DeleteTennisTeamMutation, DeleteTennisTeamMutationVariables>;

/**
 * __useDeleteTennisTeamMutation__
 *
 * To run a mutation, you first call `useDeleteTennisTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTennisTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTennisTeamMutation, { data, loading, error }] = useDeleteTennisTeamMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTennisTeamMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTennisTeamMutation, DeleteTennisTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTennisTeamMutation, DeleteTennisTeamMutationVariables>(DeleteTennisTeamDocument, options);
      }
export type DeleteTennisTeamMutationHookResult = ReturnType<typeof useDeleteTennisTeamMutation>;
export type DeleteTennisTeamMutationResult = Apollo.MutationResult<DeleteTennisTeamMutation>;
export type DeleteTennisTeamMutationOptions = Apollo.BaseMutationOptions<DeleteTennisTeamMutation, DeleteTennisTeamMutationVariables>;
export const CreateTeamMatchDocument = gql`
    mutation CreateTeamMatch($leagueId: ID!, $input: CreateTeamMatchInput!) {
  createTeamMatch(leagueId: $leagueId, input: $input) {
    ...MatchFragment
  }
}
    ${MatchFragmentFragmentDoc}`;
export type CreateTeamMatchMutationFn = Apollo.MutationFunction<CreateTeamMatchMutation, CreateTeamMatchMutationVariables>;

/**
 * __useCreateTeamMatchMutation__
 *
 * To run a mutation, you first call `useCreateTeamMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTeamMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTeamMatchMutation, { data, loading, error }] = useCreateTeamMatchMutation({
 *   variables: {
 *      leagueId: // value for 'leagueId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTeamMatchMutation(baseOptions?: Apollo.MutationHookOptions<CreateTeamMatchMutation, CreateTeamMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTeamMatchMutation, CreateTeamMatchMutationVariables>(CreateTeamMatchDocument, options);
      }
export type CreateTeamMatchMutationHookResult = ReturnType<typeof useCreateTeamMatchMutation>;
export type CreateTeamMatchMutationResult = Apollo.MutationResult<CreateTeamMatchMutation>;
export type CreateTeamMatchMutationOptions = Apollo.BaseMutationOptions<CreateTeamMatchMutation, CreateTeamMatchMutationVariables>;
export const UpdateTeamMatchDocument = gql`
    mutation UpdateTeamMatch($id: ID!, $input: UpdateTeamMatchInput!) {
  updateTeamMatch(id: $id, input: $input) {
    ...MatchFragment
  }
}
    ${MatchFragmentFragmentDoc}`;
export type UpdateTeamMatchMutationFn = Apollo.MutationFunction<UpdateTeamMatchMutation, UpdateTeamMatchMutationVariables>;

/**
 * __useUpdateTeamMatchMutation__
 *
 * To run a mutation, you first call `useUpdateTeamMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTeamMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTeamMatchMutation, { data, loading, error }] = useUpdateTeamMatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTeamMatchMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTeamMatchMutation, UpdateTeamMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTeamMatchMutation, UpdateTeamMatchMutationVariables>(UpdateTeamMatchDocument, options);
      }
export type UpdateTeamMatchMutationHookResult = ReturnType<typeof useUpdateTeamMatchMutation>;
export type UpdateTeamMatchMutationResult = Apollo.MutationResult<UpdateTeamMatchMutation>;
export type UpdateTeamMatchMutationOptions = Apollo.BaseMutationOptions<UpdateTeamMatchMutation, UpdateTeamMatchMutationVariables>;
export const DeleteTeamMatchDocument = gql`
    mutation DeleteTeamMatch($id: ID!) {
  deleteTeamMatch(id: $id)
}
    `;
export type DeleteTeamMatchMutationFn = Apollo.MutationFunction<DeleteTeamMatchMutation, DeleteTeamMatchMutationVariables>;

/**
 * __useDeleteTeamMatchMutation__
 *
 * To run a mutation, you first call `useDeleteTeamMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTeamMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTeamMatchMutation, { data, loading, error }] = useDeleteTeamMatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTeamMatchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTeamMatchMutation, DeleteTeamMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTeamMatchMutation, DeleteTeamMatchMutationVariables>(DeleteTeamMatchDocument, options);
      }
export type DeleteTeamMatchMutationHookResult = ReturnType<typeof useDeleteTeamMatchMutation>;
export type DeleteTeamMatchMutationResult = Apollo.MutationResult<DeleteTeamMatchMutation>;
export type DeleteTeamMatchMutationOptions = Apollo.BaseMutationOptions<DeleteTeamMatchMutation, DeleteTeamMatchMutationVariables>;
export const CreateIndividualSinglesMatchDocument = gql`
    mutation CreateIndividualSinglesMatch($leagueId: ID!, $input: CreateIndividualSinglesMatchInput!) {
  createIndividualSinglesMatch(leagueId: $leagueId, input: $input) {
    id
    player1Id
    player2Id
    player1 {
      id
      username
      firstName
      lastName
    }
    player2 {
      id
      username
      firstName
      lastName
    }
    matchDate
    createdAt
    teamMatchId
    order
    score
    winner
  }
}
    `;
export type CreateIndividualSinglesMatchMutationFn = Apollo.MutationFunction<CreateIndividualSinglesMatchMutation, CreateIndividualSinglesMatchMutationVariables>;

/**
 * __useCreateIndividualSinglesMatchMutation__
 *
 * To run a mutation, you first call `useCreateIndividualSinglesMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateIndividualSinglesMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createIndividualSinglesMatchMutation, { data, loading, error }] = useCreateIndividualSinglesMatchMutation({
 *   variables: {
 *      leagueId: // value for 'leagueId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateIndividualSinglesMatchMutation(baseOptions?: Apollo.MutationHookOptions<CreateIndividualSinglesMatchMutation, CreateIndividualSinglesMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateIndividualSinglesMatchMutation, CreateIndividualSinglesMatchMutationVariables>(CreateIndividualSinglesMatchDocument, options);
      }
export type CreateIndividualSinglesMatchMutationHookResult = ReturnType<typeof useCreateIndividualSinglesMatchMutation>;
export type CreateIndividualSinglesMatchMutationResult = Apollo.MutationResult<CreateIndividualSinglesMatchMutation>;
export type CreateIndividualSinglesMatchMutationOptions = Apollo.BaseMutationOptions<CreateIndividualSinglesMatchMutation, CreateIndividualSinglesMatchMutationVariables>;
export const UpdateIndividualSinglesMatchDocument = gql`
    mutation UpdateIndividualSinglesMatch($id: ID!, $input: UpdateIndividualSinglesMatchInput!) {
  updateIndividualSinglesMatch(id: $id, input: $input) {
    id
    player1Id
    player2Id
    player1 {
      id
      username
      firstName
      lastName
    }
    player2 {
      id
      username
      firstName
      lastName
    }
    matchDate
    createdAt
    teamMatchId
    order
    score
    winner
  }
}
    `;
export type UpdateIndividualSinglesMatchMutationFn = Apollo.MutationFunction<UpdateIndividualSinglesMatchMutation, UpdateIndividualSinglesMatchMutationVariables>;

/**
 * __useUpdateIndividualSinglesMatchMutation__
 *
 * To run a mutation, you first call `useUpdateIndividualSinglesMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIndividualSinglesMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIndividualSinglesMatchMutation, { data, loading, error }] = useUpdateIndividualSinglesMatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateIndividualSinglesMatchMutation(baseOptions?: Apollo.MutationHookOptions<UpdateIndividualSinglesMatchMutation, UpdateIndividualSinglesMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateIndividualSinglesMatchMutation, UpdateIndividualSinglesMatchMutationVariables>(UpdateIndividualSinglesMatchDocument, options);
      }
export type UpdateIndividualSinglesMatchMutationHookResult = ReturnType<typeof useUpdateIndividualSinglesMatchMutation>;
export type UpdateIndividualSinglesMatchMutationResult = Apollo.MutationResult<UpdateIndividualSinglesMatchMutation>;
export type UpdateIndividualSinglesMatchMutationOptions = Apollo.BaseMutationOptions<UpdateIndividualSinglesMatchMutation, UpdateIndividualSinglesMatchMutationVariables>;
export const DeleteIndividualSinglesMatchDocument = gql`
    mutation DeleteIndividualSinglesMatch($id: ID!) {
  deleteIndividualSinglesMatch(id: $id)
}
    `;
export type DeleteIndividualSinglesMatchMutationFn = Apollo.MutationFunction<DeleteIndividualSinglesMatchMutation, DeleteIndividualSinglesMatchMutationVariables>;

/**
 * __useDeleteIndividualSinglesMatchMutation__
 *
 * To run a mutation, you first call `useDeleteIndividualSinglesMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteIndividualSinglesMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteIndividualSinglesMatchMutation, { data, loading, error }] = useDeleteIndividualSinglesMatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteIndividualSinglesMatchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteIndividualSinglesMatchMutation, DeleteIndividualSinglesMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteIndividualSinglesMatchMutation, DeleteIndividualSinglesMatchMutationVariables>(DeleteIndividualSinglesMatchDocument, options);
      }
export type DeleteIndividualSinglesMatchMutationHookResult = ReturnType<typeof useDeleteIndividualSinglesMatchMutation>;
export type DeleteIndividualSinglesMatchMutationResult = Apollo.MutationResult<DeleteIndividualSinglesMatchMutation>;
export type DeleteIndividualSinglesMatchMutationOptions = Apollo.BaseMutationOptions<DeleteIndividualSinglesMatchMutation, DeleteIndividualSinglesMatchMutationVariables>;
export const CreateIndividualDoublesMatchDocument = gql`
    mutation CreateIndividualDoublesMatch($leagueId: ID!, $input: CreateIndividualDoublesMatchInput!) {
  createIndividualDoublesMatch(leagueId: $leagueId, input: $input) {
    id
    team1Player1Id
    team1Player2Id
    team2Player1Id
    team2Player2Id
    team1Player1 {
      id
      username
      firstName
      lastName
    }
    team1Player2 {
      id
      username
      firstName
      lastName
    }
    team2Player1 {
      id
      username
      firstName
      lastName
    }
    team2Player2 {
      id
      username
      firstName
      lastName
    }
    matchDate
    createdAt
    teamMatchId
    order
    score
    winner
  }
}
    `;
export type CreateIndividualDoublesMatchMutationFn = Apollo.MutationFunction<CreateIndividualDoublesMatchMutation, CreateIndividualDoublesMatchMutationVariables>;

/**
 * __useCreateIndividualDoublesMatchMutation__
 *
 * To run a mutation, you first call `useCreateIndividualDoublesMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateIndividualDoublesMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createIndividualDoublesMatchMutation, { data, loading, error }] = useCreateIndividualDoublesMatchMutation({
 *   variables: {
 *      leagueId: // value for 'leagueId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateIndividualDoublesMatchMutation(baseOptions?: Apollo.MutationHookOptions<CreateIndividualDoublesMatchMutation, CreateIndividualDoublesMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateIndividualDoublesMatchMutation, CreateIndividualDoublesMatchMutationVariables>(CreateIndividualDoublesMatchDocument, options);
      }
export type CreateIndividualDoublesMatchMutationHookResult = ReturnType<typeof useCreateIndividualDoublesMatchMutation>;
export type CreateIndividualDoublesMatchMutationResult = Apollo.MutationResult<CreateIndividualDoublesMatchMutation>;
export type CreateIndividualDoublesMatchMutationOptions = Apollo.BaseMutationOptions<CreateIndividualDoublesMatchMutation, CreateIndividualDoublesMatchMutationVariables>;
export const UpdateIndividualDoublesMatchDocument = gql`
    mutation UpdateIndividualDoublesMatch($id: ID!, $input: UpdateIndividualDoublesMatchInput!) {
  updateIndividualDoublesMatch(id: $id, input: $input) {
    id
    team1Player1Id
    team1Player2Id
    team2Player1Id
    team2Player2Id
    team1Player1 {
      id
      username
      firstName
      lastName
    }
    team1Player2 {
      id
      username
      firstName
      lastName
    }
    team2Player1 {
      id
      username
      firstName
      lastName
    }
    team2Player2 {
      id
      username
      firstName
      lastName
    }
    matchDate
    createdAt
    teamMatchId
    order
    score
    winner
  }
}
    `;
export type UpdateIndividualDoublesMatchMutationFn = Apollo.MutationFunction<UpdateIndividualDoublesMatchMutation, UpdateIndividualDoublesMatchMutationVariables>;

/**
 * __useUpdateIndividualDoublesMatchMutation__
 *
 * To run a mutation, you first call `useUpdateIndividualDoublesMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateIndividualDoublesMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateIndividualDoublesMatchMutation, { data, loading, error }] = useUpdateIndividualDoublesMatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateIndividualDoublesMatchMutation(baseOptions?: Apollo.MutationHookOptions<UpdateIndividualDoublesMatchMutation, UpdateIndividualDoublesMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateIndividualDoublesMatchMutation, UpdateIndividualDoublesMatchMutationVariables>(UpdateIndividualDoublesMatchDocument, options);
      }
export type UpdateIndividualDoublesMatchMutationHookResult = ReturnType<typeof useUpdateIndividualDoublesMatchMutation>;
export type UpdateIndividualDoublesMatchMutationResult = Apollo.MutationResult<UpdateIndividualDoublesMatchMutation>;
export type UpdateIndividualDoublesMatchMutationOptions = Apollo.BaseMutationOptions<UpdateIndividualDoublesMatchMutation, UpdateIndividualDoublesMatchMutationVariables>;
export const DeleteIndividualDoublesMatchDocument = gql`
    mutation DeleteIndividualDoublesMatch($id: ID!) {
  deleteIndividualDoublesMatch(id: $id)
}
    `;
export type DeleteIndividualDoublesMatchMutationFn = Apollo.MutationFunction<DeleteIndividualDoublesMatchMutation, DeleteIndividualDoublesMatchMutationVariables>;

/**
 * __useDeleteIndividualDoublesMatchMutation__
 *
 * To run a mutation, you first call `useDeleteIndividualDoublesMatchMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteIndividualDoublesMatchMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteIndividualDoublesMatchMutation, { data, loading, error }] = useDeleteIndividualDoublesMatchMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteIndividualDoublesMatchMutation(baseOptions?: Apollo.MutationHookOptions<DeleteIndividualDoublesMatchMutation, DeleteIndividualDoublesMatchMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteIndividualDoublesMatchMutation, DeleteIndividualDoublesMatchMutationVariables>(DeleteIndividualDoublesMatchDocument, options);
      }
export type DeleteIndividualDoublesMatchMutationHookResult = ReturnType<typeof useDeleteIndividualDoublesMatchMutation>;
export type DeleteIndividualDoublesMatchMutationResult = Apollo.MutationResult<DeleteIndividualDoublesMatchMutation>;
export type DeleteIndividualDoublesMatchMutationOptions = Apollo.BaseMutationOptions<DeleteIndividualDoublesMatchMutation, DeleteIndividualDoublesMatchMutationVariables>;
export const CreateLeaguePointSystemDocument = gql`
    mutation CreateLeaguePointSystem($leagueId: ID!, $input: CreateTeamLeaguePointSystemInput!) {
  createTeamLeaguePointSystem(leagueId: $leagueId, input: $input) {
    id
    matchType
    order
    winPoints
    lossPoints
    drawPoints
    defaultWinPoints
    defaultLossPoints
    defaultDrawPoints
  }
}
    `;
export type CreateLeaguePointSystemMutationFn = Apollo.MutationFunction<CreateLeaguePointSystemMutation, CreateLeaguePointSystemMutationVariables>;

/**
 * __useCreateLeaguePointSystemMutation__
 *
 * To run a mutation, you first call `useCreateLeaguePointSystemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateLeaguePointSystemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createLeaguePointSystemMutation, { data, loading, error }] = useCreateLeaguePointSystemMutation({
 *   variables: {
 *      leagueId: // value for 'leagueId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateLeaguePointSystemMutation(baseOptions?: Apollo.MutationHookOptions<CreateLeaguePointSystemMutation, CreateLeaguePointSystemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateLeaguePointSystemMutation, CreateLeaguePointSystemMutationVariables>(CreateLeaguePointSystemDocument, options);
      }
export type CreateLeaguePointSystemMutationHookResult = ReturnType<typeof useCreateLeaguePointSystemMutation>;
export type CreateLeaguePointSystemMutationResult = Apollo.MutationResult<CreateLeaguePointSystemMutation>;
export type CreateLeaguePointSystemMutationOptions = Apollo.BaseMutationOptions<CreateLeaguePointSystemMutation, CreateLeaguePointSystemMutationVariables>;
export const UpdateLeaguePointSystemDocument = gql`
    mutation UpdateLeaguePointSystem($id: ID!, $input: UpdateTeamLeaguePointSystemInput!) {
  updateTeamLeaguePointSystem(id: $id, input: $input) {
    id
    matchType
    order
    winPoints
    lossPoints
    drawPoints
    defaultWinPoints
    defaultLossPoints
    defaultDrawPoints
  }
}
    `;
export type UpdateLeaguePointSystemMutationFn = Apollo.MutationFunction<UpdateLeaguePointSystemMutation, UpdateLeaguePointSystemMutationVariables>;

/**
 * __useUpdateLeaguePointSystemMutation__
 *
 * To run a mutation, you first call `useUpdateLeaguePointSystemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLeaguePointSystemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLeaguePointSystemMutation, { data, loading, error }] = useUpdateLeaguePointSystemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateLeaguePointSystemMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLeaguePointSystemMutation, UpdateLeaguePointSystemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLeaguePointSystemMutation, UpdateLeaguePointSystemMutationVariables>(UpdateLeaguePointSystemDocument, options);
      }
export type UpdateLeaguePointSystemMutationHookResult = ReturnType<typeof useUpdateLeaguePointSystemMutation>;
export type UpdateLeaguePointSystemMutationResult = Apollo.MutationResult<UpdateLeaguePointSystemMutation>;
export type UpdateLeaguePointSystemMutationOptions = Apollo.BaseMutationOptions<UpdateLeaguePointSystemMutation, UpdateLeaguePointSystemMutationVariables>;
export const DeleteLeaguePointSystemDocument = gql`
    mutation DeleteLeaguePointSystem($id: ID!) {
  deleteTeamLeaguePointSystem(id: $id)
}
    `;
export type DeleteLeaguePointSystemMutationFn = Apollo.MutationFunction<DeleteLeaguePointSystemMutation, DeleteLeaguePointSystemMutationVariables>;

/**
 * __useDeleteLeaguePointSystemMutation__
 *
 * To run a mutation, you first call `useDeleteLeaguePointSystemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteLeaguePointSystemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteLeaguePointSystemMutation, { data, loading, error }] = useDeleteLeaguePointSystemMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteLeaguePointSystemMutation(baseOptions?: Apollo.MutationHookOptions<DeleteLeaguePointSystemMutation, DeleteLeaguePointSystemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteLeaguePointSystemMutation, DeleteLeaguePointSystemMutationVariables>(DeleteLeaguePointSystemDocument, options);
      }
export type DeleteLeaguePointSystemMutationHookResult = ReturnType<typeof useDeleteLeaguePointSystemMutation>;
export type DeleteLeaguePointSystemMutationResult = Apollo.MutationResult<DeleteLeaguePointSystemMutation>;
export type DeleteLeaguePointSystemMutationOptions = Apollo.BaseMutationOptions<DeleteLeaguePointSystemMutation, DeleteLeaguePointSystemMutationVariables>;
export const UpdatePointSystemDocument = gql`
    mutation UpdatePointSystem($leagueId: ID!, $input: UpdatePointSystemInput!) {
  updatePointSystem(leagueId: $leagueId, input: $input) {
    id
    winPoints
    lossPoints
    drawPoints
    defaultWinPoints
    defaultLossPoints
    defaultDrawPoints
  }
}
    `;
export type UpdatePointSystemMutationFn = Apollo.MutationFunction<UpdatePointSystemMutation, UpdatePointSystemMutationVariables>;

/**
 * __useUpdatePointSystemMutation__
 *
 * To run a mutation, you first call `useUpdatePointSystemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePointSystemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePointSystemMutation, { data, loading, error }] = useUpdatePointSystemMutation({
 *   variables: {
 *      leagueId: // value for 'leagueId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePointSystemMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePointSystemMutation, UpdatePointSystemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePointSystemMutation, UpdatePointSystemMutationVariables>(UpdatePointSystemDocument, options);
      }
export type UpdatePointSystemMutationHookResult = ReturnType<typeof useUpdatePointSystemMutation>;
export type UpdatePointSystemMutationResult = Apollo.MutationResult<UpdatePointSystemMutation>;
export type UpdatePointSystemMutationOptions = Apollo.BaseMutationOptions<UpdatePointSystemMutation, UpdatePointSystemMutationVariables>;
export const CreateOrUpdateLineupDocument = gql`
    mutation CreateOrUpdateLineup($input: LineupInput!) {
  createOrUpdateLineup(input: $input) {
    id
    teamMatchId
    teamId
    visibility
    publishedAt
    slots {
      id
      order
      type
      player1Id
      player2Id
      player1 {
        id
        username
        firstName
        lastName
        email
      }
      player2 {
        id
        username
        firstName
        lastName
        email
      }
    }
    createdAt
    updatedAt
  }
}
    `;
export type CreateOrUpdateLineupMutationFn = Apollo.MutationFunction<CreateOrUpdateLineupMutation, CreateOrUpdateLineupMutationVariables>;

/**
 * __useCreateOrUpdateLineupMutation__
 *
 * To run a mutation, you first call `useCreateOrUpdateLineupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrUpdateLineupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrUpdateLineupMutation, { data, loading, error }] = useCreateOrUpdateLineupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrUpdateLineupMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrUpdateLineupMutation, CreateOrUpdateLineupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateOrUpdateLineupMutation, CreateOrUpdateLineupMutationVariables>(CreateOrUpdateLineupDocument, options);
      }
export type CreateOrUpdateLineupMutationHookResult = ReturnType<typeof useCreateOrUpdateLineupMutation>;
export type CreateOrUpdateLineupMutationResult = Apollo.MutationResult<CreateOrUpdateLineupMutation>;
export type CreateOrUpdateLineupMutationOptions = Apollo.BaseMutationOptions<CreateOrUpdateLineupMutation, CreateOrUpdateLineupMutationVariables>;
export const PublishLineupDocument = gql`
    mutation PublishLineup($lineupId: ID!, $visibility: LineupVisibility!) {
  publishLineup(lineupId: $lineupId, visibility: $visibility) {
    id
    teamMatchId
    teamId
    visibility
    publishedAt
    slots {
      id
      order
      type
      player1Id
      player2Id
      player1 {
        id
        username
        firstName
        lastName
        email
      }
      player2 {
        id
        username
        firstName
        lastName
        email
      }
    }
    createdAt
    updatedAt
  }
}
    `;
export type PublishLineupMutationFn = Apollo.MutationFunction<PublishLineupMutation, PublishLineupMutationVariables>;

/**
 * __usePublishLineupMutation__
 *
 * To run a mutation, you first call `usePublishLineupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePublishLineupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [publishLineupMutation, { data, loading, error }] = usePublishLineupMutation({
 *   variables: {
 *      lineupId: // value for 'lineupId'
 *      visibility: // value for 'visibility'
 *   },
 * });
 */
export function usePublishLineupMutation(baseOptions?: Apollo.MutationHookOptions<PublishLineupMutation, PublishLineupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<PublishLineupMutation, PublishLineupMutationVariables>(PublishLineupDocument, options);
      }
export type PublishLineupMutationHookResult = ReturnType<typeof usePublishLineupMutation>;
export type PublishLineupMutationResult = Apollo.MutationResult<PublishLineupMutation>;
export type PublishLineupMutationOptions = Apollo.BaseMutationOptions<PublishLineupMutation, PublishLineupMutationVariables>;
export const GetEventsDocument = gql`
    query GetEvents($groupId: ID!) {
  events(groupId: $groupId) {
    id
    date
    description
    createdBy {
      id
      username
    }
    rsvps {
      id
      status
      note
      createdAt
      user {
        id
        username
        email
      }
    }
  }
}
    `;

/**
 * __useGetEventsQuery__
 *
 * To run a query within a React component, call `useGetEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEventsQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetEventsQuery(baseOptions: Apollo.QueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
      }
export function useGetEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEventsQuery, GetEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEventsQuery, GetEventsQueryVariables>(GetEventsDocument, options);
        }
export type GetEventsQueryHookResult = ReturnType<typeof useGetEventsQuery>;
export type GetEventsLazyQueryHookResult = ReturnType<typeof useGetEventsLazyQuery>;
export type GetEventsQueryResult = Apollo.QueryResult<GetEventsQuery, GetEventsQueryVariables>;
export const CreateEventDocument = gql`
    mutation CreateEvent($input: CreateEventInput!) {
  createEvent(input: $input) {
    id
    date
    description
    createdBy {
      id
      username
    }
  }
}
    `;
export type CreateEventMutationFn = Apollo.MutationFunction<CreateEventMutation, CreateEventMutationVariables>;

/**
 * __useCreateEventMutation__
 *
 * To run a mutation, you first call `useCreateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventMutation, { data, loading, error }] = useCreateEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateEventMutation(baseOptions?: Apollo.MutationHookOptions<CreateEventMutation, CreateEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument, options);
      }
export type CreateEventMutationHookResult = ReturnType<typeof useCreateEventMutation>;
export type CreateEventMutationResult = Apollo.MutationResult<CreateEventMutation>;
export type CreateEventMutationOptions = Apollo.BaseMutationOptions<CreateEventMutation, CreateEventMutationVariables>;
export const CreateRsvpDocument = gql`
    mutation CreateRSVP($input: CreateRSVPInput!) {
  createRSVP(input: $input) {
    id
    status
    note
    createdAt
    event {
      id
    }
  }
}
    `;
export type CreateRsvpMutationFn = Apollo.MutationFunction<CreateRsvpMutation, CreateRsvpMutationVariables>;

/**
 * __useCreateRsvpMutation__
 *
 * To run a mutation, you first call `useCreateRsvpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRsvpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRsvpMutation, { data, loading, error }] = useCreateRsvpMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRsvpMutation(baseOptions?: Apollo.MutationHookOptions<CreateRsvpMutation, CreateRsvpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRsvpMutation, CreateRsvpMutationVariables>(CreateRsvpDocument, options);
      }
export type CreateRsvpMutationHookResult = ReturnType<typeof useCreateRsvpMutation>;
export type CreateRsvpMutationResult = Apollo.MutationResult<CreateRsvpMutation>;
export type CreateRsvpMutationOptions = Apollo.BaseMutationOptions<CreateRsvpMutation, CreateRsvpMutationVariables>;
export const UpdateRsvpDocument = gql`
    mutation UpdateRSVP($id: ID!, $status: RSVPStatus!, $note: String) {
  updateRSVP(id: $id, status: $status, note: $note) {
    id
    status
    note
    createdAt
    event {
      id
    }
  }
}
    `;
export type UpdateRsvpMutationFn = Apollo.MutationFunction<UpdateRsvpMutation, UpdateRsvpMutationVariables>;

/**
 * __useUpdateRsvpMutation__
 *
 * To run a mutation, you first call `useUpdateRsvpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRsvpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRsvpMutation, { data, loading, error }] = useUpdateRsvpMutation({
 *   variables: {
 *      id: // value for 'id'
 *      status: // value for 'status'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useUpdateRsvpMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRsvpMutation, UpdateRsvpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRsvpMutation, UpdateRsvpMutationVariables>(UpdateRsvpDocument, options);
      }
export type UpdateRsvpMutationHookResult = ReturnType<typeof useUpdateRsvpMutation>;
export type UpdateRsvpMutationResult = Apollo.MutationResult<UpdateRsvpMutation>;
export type UpdateRsvpMutationOptions = Apollo.BaseMutationOptions<UpdateRsvpMutation, UpdateRsvpMutationVariables>;
export const DeleteEventDocument = gql`
    mutation DeleteEvent($id: ID!) {
  deleteEvent(id: $id)
}
    `;
export type DeleteEventMutationFn = Apollo.MutationFunction<DeleteEventMutation, DeleteEventMutationVariables>;

/**
 * __useDeleteEventMutation__
 *
 * To run a mutation, you first call `useDeleteEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEventMutation, { data, loading, error }] = useDeleteEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteEventMutation(baseOptions?: Apollo.MutationHookOptions<DeleteEventMutation, DeleteEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteEventMutation, DeleteEventMutationVariables>(DeleteEventDocument, options);
      }
export type DeleteEventMutationHookResult = ReturnType<typeof useDeleteEventMutation>;
export type DeleteEventMutationResult = Apollo.MutationResult<DeleteEventMutation>;
export type DeleteEventMutationOptions = Apollo.BaseMutationOptions<DeleteEventMutation, DeleteEventMutationVariables>;
export const UpdateEventDocument = gql`
    mutation UpdateEvent($id: ID!, $input: CreateEventInput!) {
  updateEvent(id: $id, input: $input) {
    id
    date
    description
    createdBy {
      id
      username
    }
  }
}
    `;
export type UpdateEventMutationFn = Apollo.MutationFunction<UpdateEventMutation, UpdateEventMutationVariables>;

/**
 * __useUpdateEventMutation__
 *
 * To run a mutation, you first call `useUpdateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEventMutation, { data, loading, error }] = useUpdateEventMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateEventMutation(baseOptions?: Apollo.MutationHookOptions<UpdateEventMutation, UpdateEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateEventMutation, UpdateEventMutationVariables>(UpdateEventDocument, options);
      }
export type UpdateEventMutationHookResult = ReturnType<typeof useUpdateEventMutation>;
export type UpdateEventMutationResult = Apollo.MutationResult<UpdateEventMutation>;
export type UpdateEventMutationOptions = Apollo.BaseMutationOptions<UpdateEventMutation, UpdateEventMutationVariables>;
export const GetUserPendingEventsDocument = gql`
    query GetUserPendingEvents {
  userPendingEvents {
    id
    date
    description
    group {
      id
      name
    }
    createdBy {
      id
      username
    }
    rsvps {
      id
      status
      note
      user {
        id
        username
      }
    }
  }
}
    `;

/**
 * __useGetUserPendingEventsQuery__
 *
 * To run a query within a React component, call `useGetUserPendingEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserPendingEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserPendingEventsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserPendingEventsQuery(baseOptions?: Apollo.QueryHookOptions<GetUserPendingEventsQuery, GetUserPendingEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserPendingEventsQuery, GetUserPendingEventsQueryVariables>(GetUserPendingEventsDocument, options);
      }
export function useGetUserPendingEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserPendingEventsQuery, GetUserPendingEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserPendingEventsQuery, GetUserPendingEventsQueryVariables>(GetUserPendingEventsDocument, options);
        }
export type GetUserPendingEventsQueryHookResult = ReturnType<typeof useGetUserPendingEventsQuery>;
export type GetUserPendingEventsLazyQueryHookResult = ReturnType<typeof useGetUserPendingEventsLazyQuery>;
export type GetUserPendingEventsQueryResult = Apollo.QueryResult<GetUserPendingEventsQuery, GetUserPendingEventsQueryVariables>;
export const GetGroupExpensesDocument = gql`
    query GetGroupExpenses($groupId: ID!, $limit: Int) {
  groupExpenses(groupId: $groupId, limit: $limit) {
    id
    description
    amount
    currency
    category
    date
    receiptUrl
    splitType
    createdAt
    updatedAt
    paidBy {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
    splits {
      id
      amount
      percentage
      shares
      createdAt
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
}
    `;

/**
 * __useGetGroupExpensesQuery__
 *
 * To run a query within a React component, call `useGetGroupExpensesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupExpensesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupExpensesQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetGroupExpensesQuery(baseOptions: Apollo.QueryHookOptions<GetGroupExpensesQuery, GetGroupExpensesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupExpensesQuery, GetGroupExpensesQueryVariables>(GetGroupExpensesDocument, options);
      }
export function useGetGroupExpensesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupExpensesQuery, GetGroupExpensesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupExpensesQuery, GetGroupExpensesQueryVariables>(GetGroupExpensesDocument, options);
        }
export type GetGroupExpensesQueryHookResult = ReturnType<typeof useGetGroupExpensesQuery>;
export type GetGroupExpensesLazyQueryHookResult = ReturnType<typeof useGetGroupExpensesLazyQuery>;
export type GetGroupExpensesQueryResult = Apollo.QueryResult<GetGroupExpensesQuery, GetGroupExpensesQueryVariables>;
export const GetExpenseDocument = gql`
    query GetExpense($id: ID!) {
  expense(id: $id) {
    id
    description
    amount
    currency
    category
    date
    receiptUrl
    splitType
    createdAt
    updatedAt
    paidBy {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
    splits {
      id
      amount
      percentage
      shares
      createdAt
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
}
    `;

/**
 * __useGetExpenseQuery__
 *
 * To run a query within a React component, call `useGetExpenseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExpenseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExpenseQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetExpenseQuery(baseOptions: Apollo.QueryHookOptions<GetExpenseQuery, GetExpenseQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExpenseQuery, GetExpenseQueryVariables>(GetExpenseDocument, options);
      }
export function useGetExpenseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExpenseQuery, GetExpenseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExpenseQuery, GetExpenseQueryVariables>(GetExpenseDocument, options);
        }
export type GetExpenseQueryHookResult = ReturnType<typeof useGetExpenseQuery>;
export type GetExpenseLazyQueryHookResult = ReturnType<typeof useGetExpenseLazyQuery>;
export type GetExpenseQueryResult = Apollo.QueryResult<GetExpenseQuery, GetExpenseQueryVariables>;
export const GetUserExpensesDocument = gql`
    query GetUserExpenses($userId: ID!) {
  userExpenses(userId: $userId) {
    id
    description
    amount
    currency
    category
    date
    receiptUrl
    splitType
    createdAt
    updatedAt
    paidBy {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
    splits {
      id
      amount
      percentage
      shares
      createdAt
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
}
    `;

/**
 * __useGetUserExpensesQuery__
 *
 * To run a query within a React component, call `useGetUserExpensesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserExpensesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserExpensesQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserExpensesQuery(baseOptions: Apollo.QueryHookOptions<GetUserExpensesQuery, GetUserExpensesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserExpensesQuery, GetUserExpensesQueryVariables>(GetUserExpensesDocument, options);
      }
export function useGetUserExpensesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserExpensesQuery, GetUserExpensesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserExpensesQuery, GetUserExpensesQueryVariables>(GetUserExpensesDocument, options);
        }
export type GetUserExpensesQueryHookResult = ReturnType<typeof useGetUserExpensesQuery>;
export type GetUserExpensesLazyQueryHookResult = ReturnType<typeof useGetUserExpensesLazyQuery>;
export type GetUserExpensesQueryResult = Apollo.QueryResult<GetUserExpensesQuery, GetUserExpensesQueryVariables>;
export const GetGroupSettlementsDocument = gql`
    query GetGroupSettlements($groupId: ID!) {
  groupSettlements(groupId: $groupId) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;

/**
 * __useGetGroupSettlementsQuery__
 *
 * To run a query within a React component, call `useGetGroupSettlementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupSettlementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupSettlementsQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetGroupSettlementsQuery(baseOptions: Apollo.QueryHookOptions<GetGroupSettlementsQuery, GetGroupSettlementsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupSettlementsQuery, GetGroupSettlementsQueryVariables>(GetGroupSettlementsDocument, options);
      }
export function useGetGroupSettlementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupSettlementsQuery, GetGroupSettlementsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupSettlementsQuery, GetGroupSettlementsQueryVariables>(GetGroupSettlementsDocument, options);
        }
export type GetGroupSettlementsQueryHookResult = ReturnType<typeof useGetGroupSettlementsQuery>;
export type GetGroupSettlementsLazyQueryHookResult = ReturnType<typeof useGetGroupSettlementsLazyQuery>;
export type GetGroupSettlementsQueryResult = Apollo.QueryResult<GetGroupSettlementsQuery, GetGroupSettlementsQueryVariables>;
export const GetUserSettlementsDocument = gql`
    query GetUserSettlements($userId: ID!) {
  userSettlements(userId: $userId) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;

/**
 * __useGetUserSettlementsQuery__
 *
 * To run a query within a React component, call `useGetUserSettlementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserSettlementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserSettlementsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserSettlementsQuery(baseOptions: Apollo.QueryHookOptions<GetUserSettlementsQuery, GetUserSettlementsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserSettlementsQuery, GetUserSettlementsQueryVariables>(GetUserSettlementsDocument, options);
      }
export function useGetUserSettlementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserSettlementsQuery, GetUserSettlementsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserSettlementsQuery, GetUserSettlementsQueryVariables>(GetUserSettlementsDocument, options);
        }
export type GetUserSettlementsQueryHookResult = ReturnType<typeof useGetUserSettlementsQuery>;
export type GetUserSettlementsLazyQueryHookResult = ReturnType<typeof useGetUserSettlementsLazyQuery>;
export type GetUserSettlementsQueryResult = Apollo.QueryResult<GetUserSettlementsQuery, GetUserSettlementsQueryVariables>;
export const GetGroupDebtSummaryDocument = gql`
    query GetGroupDebtSummary($groupId: ID!) {
  groupDebtSummary(groupId: $groupId) {
    user {
      id
      username
      firstName
      lastName
    }
    totalOwed
    totalOwedTo
    netAmount
    debts {
      toUser {
        id
        username
        firstName
        lastName
      }
      amount
      currency
    }
  }
}
    `;

/**
 * __useGetGroupDebtSummaryQuery__
 *
 * To run a query within a React component, call `useGetGroupDebtSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupDebtSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupDebtSummaryQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetGroupDebtSummaryQuery(baseOptions: Apollo.QueryHookOptions<GetGroupDebtSummaryQuery, GetGroupDebtSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupDebtSummaryQuery, GetGroupDebtSummaryQueryVariables>(GetGroupDebtSummaryDocument, options);
      }
export function useGetGroupDebtSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupDebtSummaryQuery, GetGroupDebtSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupDebtSummaryQuery, GetGroupDebtSummaryQueryVariables>(GetGroupDebtSummaryDocument, options);
        }
export type GetGroupDebtSummaryQueryHookResult = ReturnType<typeof useGetGroupDebtSummaryQuery>;
export type GetGroupDebtSummaryLazyQueryHookResult = ReturnType<typeof useGetGroupDebtSummaryLazyQuery>;
export type GetGroupDebtSummaryQueryResult = Apollo.QueryResult<GetGroupDebtSummaryQuery, GetGroupDebtSummaryQueryVariables>;
export const GetUserDebtSummaryDocument = gql`
    query GetUserDebtSummary($userId: ID!, $groupId: ID!) {
  userDebtSummary(userId: $userId, groupId: $groupId) {
    user {
      id
      username
      firstName
      lastName
    }
    totalOwed
    totalOwedTo
    netAmount
    debts {
      toUser {
        id
        username
        firstName
        lastName
      }
      amount
      currency
    }
  }
}
    `;

/**
 * __useGetUserDebtSummaryQuery__
 *
 * To run a query within a React component, call `useGetUserDebtSummaryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDebtSummaryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDebtSummaryQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetUserDebtSummaryQuery(baseOptions: Apollo.QueryHookOptions<GetUserDebtSummaryQuery, GetUserDebtSummaryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserDebtSummaryQuery, GetUserDebtSummaryQueryVariables>(GetUserDebtSummaryDocument, options);
      }
export function useGetUserDebtSummaryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserDebtSummaryQuery, GetUserDebtSummaryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserDebtSummaryQuery, GetUserDebtSummaryQueryVariables>(GetUserDebtSummaryDocument, options);
        }
export type GetUserDebtSummaryQueryHookResult = ReturnType<typeof useGetUserDebtSummaryQuery>;
export type GetUserDebtSummaryLazyQueryHookResult = ReturnType<typeof useGetUserDebtSummaryLazyQuery>;
export type GetUserDebtSummaryQueryResult = Apollo.QueryResult<GetUserDebtSummaryQuery, GetUserDebtSummaryQueryVariables>;
export const GetOptimalSettlementsDocument = gql`
    query GetOptimalSettlements($groupId: ID!) {
  optimalSettlements(groupId: $groupId) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;

/**
 * __useGetOptimalSettlementsQuery__
 *
 * To run a query within a React component, call `useGetOptimalSettlementsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOptimalSettlementsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOptimalSettlementsQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetOptimalSettlementsQuery(baseOptions: Apollo.QueryHookOptions<GetOptimalSettlementsQuery, GetOptimalSettlementsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOptimalSettlementsQuery, GetOptimalSettlementsQueryVariables>(GetOptimalSettlementsDocument, options);
      }
export function useGetOptimalSettlementsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOptimalSettlementsQuery, GetOptimalSettlementsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOptimalSettlementsQuery, GetOptimalSettlementsQueryVariables>(GetOptimalSettlementsDocument, options);
        }
export type GetOptimalSettlementsQueryHookResult = ReturnType<typeof useGetOptimalSettlementsQuery>;
export type GetOptimalSettlementsLazyQueryHookResult = ReturnType<typeof useGetOptimalSettlementsLazyQuery>;
export type GetOptimalSettlementsQueryResult = Apollo.QueryResult<GetOptimalSettlementsQuery, GetOptimalSettlementsQueryVariables>;
export const GetGroupSettingsDocument = gql`
    query GetGroupSettings($groupId: ID!) {
  groupSettings(groupId: $groupId) {
    id
    defaultCurrency
    allowExpenses
    expenseLimit
    requireApproval
    autoSettle
    createdAt
    updatedAt
    group {
      id
      name
    }
  }
}
    `;

/**
 * __useGetGroupSettingsQuery__
 *
 * To run a query within a React component, call `useGetGroupSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupSettingsQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetGroupSettingsQuery(baseOptions: Apollo.QueryHookOptions<GetGroupSettingsQuery, GetGroupSettingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupSettingsQuery, GetGroupSettingsQueryVariables>(GetGroupSettingsDocument, options);
      }
export function useGetGroupSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupSettingsQuery, GetGroupSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupSettingsQuery, GetGroupSettingsQueryVariables>(GetGroupSettingsDocument, options);
        }
export type GetGroupSettingsQueryHookResult = ReturnType<typeof useGetGroupSettingsQuery>;
export type GetGroupSettingsLazyQueryHookResult = ReturnType<typeof useGetGroupSettingsLazyQuery>;
export type GetGroupSettingsQueryResult = Apollo.QueryResult<GetGroupSettingsQuery, GetGroupSettingsQueryVariables>;
export const CreateExpenseDocument = gql`
    mutation CreateExpense($input: CreateExpenseInput!) {
  createExpense(input: $input) {
    id
    description
    amount
    currency
    category
    date
    receiptUrl
    splitType
    createdAt
    updatedAt
    paidBy {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
    splits {
      id
      amount
      percentage
      shares
      createdAt
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
}
    `;
export type CreateExpenseMutationFn = Apollo.MutationFunction<CreateExpenseMutation, CreateExpenseMutationVariables>;

/**
 * __useCreateExpenseMutation__
 *
 * To run a mutation, you first call `useCreateExpenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateExpenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createExpenseMutation, { data, loading, error }] = useCreateExpenseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateExpenseMutation(baseOptions?: Apollo.MutationHookOptions<CreateExpenseMutation, CreateExpenseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateExpenseMutation, CreateExpenseMutationVariables>(CreateExpenseDocument, options);
      }
export type CreateExpenseMutationHookResult = ReturnType<typeof useCreateExpenseMutation>;
export type CreateExpenseMutationResult = Apollo.MutationResult<CreateExpenseMutation>;
export type CreateExpenseMutationOptions = Apollo.BaseMutationOptions<CreateExpenseMutation, CreateExpenseMutationVariables>;
export const UpdateExpenseDocument = gql`
    mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
  updateExpense(id: $id, input: $input) {
    id
    description
    amount
    currency
    category
    date
    receiptUrl
    splitType
    createdAt
    updatedAt
    paidBy {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
    splits {
      id
      amount
      percentage
      shares
      createdAt
      user {
        id
        username
        firstName
        lastName
      }
    }
  }
}
    `;
export type UpdateExpenseMutationFn = Apollo.MutationFunction<UpdateExpenseMutation, UpdateExpenseMutationVariables>;

/**
 * __useUpdateExpenseMutation__
 *
 * To run a mutation, you first call `useUpdateExpenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateExpenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateExpenseMutation, { data, loading, error }] = useUpdateExpenseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateExpenseMutation(baseOptions?: Apollo.MutationHookOptions<UpdateExpenseMutation, UpdateExpenseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateExpenseMutation, UpdateExpenseMutationVariables>(UpdateExpenseDocument, options);
      }
export type UpdateExpenseMutationHookResult = ReturnType<typeof useUpdateExpenseMutation>;
export type UpdateExpenseMutationResult = Apollo.MutationResult<UpdateExpenseMutation>;
export type UpdateExpenseMutationOptions = Apollo.BaseMutationOptions<UpdateExpenseMutation, UpdateExpenseMutationVariables>;
export const DeleteExpenseDocument = gql`
    mutation DeleteExpense($id: ID!) {
  deleteExpense(id: $id)
}
    `;
export type DeleteExpenseMutationFn = Apollo.MutationFunction<DeleteExpenseMutation, DeleteExpenseMutationVariables>;

/**
 * __useDeleteExpenseMutation__
 *
 * To run a mutation, you first call `useDeleteExpenseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteExpenseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteExpenseMutation, { data, loading, error }] = useDeleteExpenseMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteExpenseMutation(baseOptions?: Apollo.MutationHookOptions<DeleteExpenseMutation, DeleteExpenseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteExpenseMutation, DeleteExpenseMutationVariables>(DeleteExpenseDocument, options);
      }
export type DeleteExpenseMutationHookResult = ReturnType<typeof useDeleteExpenseMutation>;
export type DeleteExpenseMutationResult = Apollo.MutationResult<DeleteExpenseMutation>;
export type DeleteExpenseMutationOptions = Apollo.BaseMutationOptions<DeleteExpenseMutation, DeleteExpenseMutationVariables>;
export const CreateSettlementDocument = gql`
    mutation CreateSettlement($input: CreateSettlementInput!) {
  createSettlement(input: $input) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;
export type CreateSettlementMutationFn = Apollo.MutationFunction<CreateSettlementMutation, CreateSettlementMutationVariables>;

/**
 * __useCreateSettlementMutation__
 *
 * To run a mutation, you first call `useCreateSettlementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateSettlementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createSettlementMutation, { data, loading, error }] = useCreateSettlementMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateSettlementMutation(baseOptions?: Apollo.MutationHookOptions<CreateSettlementMutation, CreateSettlementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateSettlementMutation, CreateSettlementMutationVariables>(CreateSettlementDocument, options);
      }
export type CreateSettlementMutationHookResult = ReturnType<typeof useCreateSettlementMutation>;
export type CreateSettlementMutationResult = Apollo.MutationResult<CreateSettlementMutation>;
export type CreateSettlementMutationOptions = Apollo.BaseMutationOptions<CreateSettlementMutation, CreateSettlementMutationVariables>;
export const UpdateSettlementDocument = gql`
    mutation UpdateSettlement($id: ID!, $input: UpdateSettlementInput!) {
  updateSettlement(id: $id, input: $input) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;
export type UpdateSettlementMutationFn = Apollo.MutationFunction<UpdateSettlementMutation, UpdateSettlementMutationVariables>;

/**
 * __useUpdateSettlementMutation__
 *
 * To run a mutation, you first call `useUpdateSettlementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSettlementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSettlementMutation, { data, loading, error }] = useUpdateSettlementMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateSettlementMutation(baseOptions?: Apollo.MutationHookOptions<UpdateSettlementMutation, UpdateSettlementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateSettlementMutation, UpdateSettlementMutationVariables>(UpdateSettlementDocument, options);
      }
export type UpdateSettlementMutationHookResult = ReturnType<typeof useUpdateSettlementMutation>;
export type UpdateSettlementMutationResult = Apollo.MutationResult<UpdateSettlementMutation>;
export type UpdateSettlementMutationOptions = Apollo.BaseMutationOptions<UpdateSettlementMutation, UpdateSettlementMutationVariables>;
export const MarkSettlementPaidDocument = gql`
    mutation MarkSettlementPaid($id: ID!, $input: MarkSettlementPaidInput!) {
  markSettlementPaid(id: $id, input: $input) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;
export type MarkSettlementPaidMutationFn = Apollo.MutationFunction<MarkSettlementPaidMutation, MarkSettlementPaidMutationVariables>;

/**
 * __useMarkSettlementPaidMutation__
 *
 * To run a mutation, you first call `useMarkSettlementPaidMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkSettlementPaidMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markSettlementPaidMutation, { data, loading, error }] = useMarkSettlementPaidMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMarkSettlementPaidMutation(baseOptions?: Apollo.MutationHookOptions<MarkSettlementPaidMutation, MarkSettlementPaidMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkSettlementPaidMutation, MarkSettlementPaidMutationVariables>(MarkSettlementPaidDocument, options);
      }
export type MarkSettlementPaidMutationHookResult = ReturnType<typeof useMarkSettlementPaidMutation>;
export type MarkSettlementPaidMutationResult = Apollo.MutationResult<MarkSettlementPaidMutation>;
export type MarkSettlementPaidMutationOptions = Apollo.BaseMutationOptions<MarkSettlementPaidMutation, MarkSettlementPaidMutationVariables>;
export const DeleteSettlementDocument = gql`
    mutation DeleteSettlement($id: ID!) {
  deleteSettlement(id: $id)
}
    `;
export type DeleteSettlementMutationFn = Apollo.MutationFunction<DeleteSettlementMutation, DeleteSettlementMutationVariables>;

/**
 * __useDeleteSettlementMutation__
 *
 * To run a mutation, you first call `useDeleteSettlementMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSettlementMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSettlementMutation, { data, loading, error }] = useDeleteSettlementMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteSettlementMutation(baseOptions?: Apollo.MutationHookOptions<DeleteSettlementMutation, DeleteSettlementMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteSettlementMutation, DeleteSettlementMutationVariables>(DeleteSettlementDocument, options);
      }
export type DeleteSettlementMutationHookResult = ReturnType<typeof useDeleteSettlementMutation>;
export type DeleteSettlementMutationResult = Apollo.MutationResult<DeleteSettlementMutation>;
export type DeleteSettlementMutationOptions = Apollo.BaseMutationOptions<DeleteSettlementMutation, DeleteSettlementMutationVariables>;
export const UpdateGroupSettingsDocument = gql`
    mutation UpdateGroupSettings($groupId: ID!, $input: UpdateGroupSettingsInput!) {
  updateGroupSettings(groupId: $groupId, input: $input) {
    id
    defaultCurrency
    allowExpenses
    expenseLimit
    requireApproval
    autoSettle
    createdAt
    updatedAt
    group {
      id
      name
    }
  }
}
    `;
export type UpdateGroupSettingsMutationFn = Apollo.MutationFunction<UpdateGroupSettingsMutation, UpdateGroupSettingsMutationVariables>;

/**
 * __useUpdateGroupSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateGroupSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupSettingsMutation, { data, loading, error }] = useUpdateGroupSettingsMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateGroupSettingsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGroupSettingsMutation, UpdateGroupSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGroupSettingsMutation, UpdateGroupSettingsMutationVariables>(UpdateGroupSettingsDocument, options);
      }
export type UpdateGroupSettingsMutationHookResult = ReturnType<typeof useUpdateGroupSettingsMutation>;
export type UpdateGroupSettingsMutationResult = Apollo.MutationResult<UpdateGroupSettingsMutation>;
export type UpdateGroupSettingsMutationOptions = Apollo.BaseMutationOptions<UpdateGroupSettingsMutation, UpdateGroupSettingsMutationVariables>;
export const GenerateOptimalSettlementsDocument = gql`
    mutation GenerateOptimalSettlements($groupId: ID!) {
  generateOptimalSettlements(groupId: $groupId) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;
export type GenerateOptimalSettlementsMutationFn = Apollo.MutationFunction<GenerateOptimalSettlementsMutation, GenerateOptimalSettlementsMutationVariables>;

/**
 * __useGenerateOptimalSettlementsMutation__
 *
 * To run a mutation, you first call `useGenerateOptimalSettlementsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateOptimalSettlementsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateOptimalSettlementsMutation, { data, loading, error }] = useGenerateOptimalSettlementsMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGenerateOptimalSettlementsMutation(baseOptions?: Apollo.MutationHookOptions<GenerateOptimalSettlementsMutation, GenerateOptimalSettlementsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateOptimalSettlementsMutation, GenerateOptimalSettlementsMutationVariables>(GenerateOptimalSettlementsDocument, options);
      }
export type GenerateOptimalSettlementsMutationHookResult = ReturnType<typeof useGenerateOptimalSettlementsMutation>;
export type GenerateOptimalSettlementsMutationResult = Apollo.MutationResult<GenerateOptimalSettlementsMutation>;
export type GenerateOptimalSettlementsMutationOptions = Apollo.BaseMutationOptions<GenerateOptimalSettlementsMutation, GenerateOptimalSettlementsMutationVariables>;
export const BulkCreateSettlementsDocument = gql`
    mutation BulkCreateSettlements($input: BulkCreateSettlementsInput!) {
  bulkCreateSettlements(input: $input) {
    id
    amount
    currency
    status
    paymentMethod
    notes
    paidAt
    createdAt
    updatedAt
    fromUser {
      id
      username
      firstName
      lastName
    }
    toUser {
      id
      username
      firstName
      lastName
    }
    group {
      id
      name
    }
  }
}
    `;
export type BulkCreateSettlementsMutationFn = Apollo.MutationFunction<BulkCreateSettlementsMutation, BulkCreateSettlementsMutationVariables>;

/**
 * __useBulkCreateSettlementsMutation__
 *
 * To run a mutation, you first call `useBulkCreateSettlementsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkCreateSettlementsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkCreateSettlementsMutation, { data, loading, error }] = useBulkCreateSettlementsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBulkCreateSettlementsMutation(baseOptions?: Apollo.MutationHookOptions<BulkCreateSettlementsMutation, BulkCreateSettlementsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BulkCreateSettlementsMutation, BulkCreateSettlementsMutationVariables>(BulkCreateSettlementsDocument, options);
      }
export type BulkCreateSettlementsMutationHookResult = ReturnType<typeof useBulkCreateSettlementsMutation>;
export type BulkCreateSettlementsMutationResult = Apollo.MutationResult<BulkCreateSettlementsMutation>;
export type BulkCreateSettlementsMutationOptions = Apollo.BaseMutationOptions<BulkCreateSettlementsMutation, BulkCreateSettlementsMutationVariables>;
export const GetGroupMembersDocument = gql`
    query GetGroupMembers($groupId: ID!) {
  group(id: $groupId) {
    id
    name
    description
    isPublic
    memberships {
      id
      isAdmin
      memberId
      joinedAt
      user {
        id
        username
        email
        firstName
        lastName
      }
    }
    blockedUsers {
      id
      blockedAt
      reason
      user {
        id
        username
        email
      }
      blockedBy {
        id
        username
      }
    }
  }
}
    `;

/**
 * __useGetGroupMembersQuery__
 *
 * To run a query within a React component, call `useGetGroupMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupMembersQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetGroupMembersQuery(baseOptions: Apollo.QueryHookOptions<GetGroupMembersQuery, GetGroupMembersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupMembersQuery, GetGroupMembersQueryVariables>(GetGroupMembersDocument, options);
      }
export function useGetGroupMembersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupMembersQuery, GetGroupMembersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupMembersQuery, GetGroupMembersQueryVariables>(GetGroupMembersDocument, options);
        }
export type GetGroupMembersQueryHookResult = ReturnType<typeof useGetGroupMembersQuery>;
export type GetGroupMembersLazyQueryHookResult = ReturnType<typeof useGetGroupMembersLazyQuery>;
export type GetGroupMembersQueryResult = Apollo.QueryResult<GetGroupMembersQuery, GetGroupMembersQueryVariables>;
export const MakeAdminDocument = gql`
    mutation MakeAdmin($groupId: ID!, $userId: ID!) {
  makeAdmin(groupId: $groupId, userId: $userId) {
    id
    isAdmin
    user {
      id
      username
      email
    }
  }
}
    `;
export type MakeAdminMutationFn = Apollo.MutationFunction<MakeAdminMutation, MakeAdminMutationVariables>;

/**
 * __useMakeAdminMutation__
 *
 * To run a mutation, you first call `useMakeAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMakeAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [makeAdminMutation, { data, loading, error }] = useMakeAdminMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useMakeAdminMutation(baseOptions?: Apollo.MutationHookOptions<MakeAdminMutation, MakeAdminMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MakeAdminMutation, MakeAdminMutationVariables>(MakeAdminDocument, options);
      }
export type MakeAdminMutationHookResult = ReturnType<typeof useMakeAdminMutation>;
export type MakeAdminMutationResult = Apollo.MutationResult<MakeAdminMutation>;
export type MakeAdminMutationOptions = Apollo.BaseMutationOptions<MakeAdminMutation, MakeAdminMutationVariables>;
export const RemoveAdminDocument = gql`
    mutation RemoveAdmin($groupId: ID!, $userId: ID!) {
  removeAdmin(groupId: $groupId, userId: $userId) {
    id
    isAdmin
    user {
      id
      username
      email
    }
  }
}
    `;
export type RemoveAdminMutationFn = Apollo.MutationFunction<RemoveAdminMutation, RemoveAdminMutationVariables>;

/**
 * __useRemoveAdminMutation__
 *
 * To run a mutation, you first call `useRemoveAdminMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveAdminMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeAdminMutation, { data, loading, error }] = useRemoveAdminMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRemoveAdminMutation(baseOptions?: Apollo.MutationHookOptions<RemoveAdminMutation, RemoveAdminMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveAdminMutation, RemoveAdminMutationVariables>(RemoveAdminDocument, options);
      }
export type RemoveAdminMutationHookResult = ReturnType<typeof useRemoveAdminMutation>;
export type RemoveAdminMutationResult = Apollo.MutationResult<RemoveAdminMutation>;
export type RemoveAdminMutationOptions = Apollo.BaseMutationOptions<RemoveAdminMutation, RemoveAdminMutationVariables>;
export const RemoveMemberDocument = gql`
    mutation RemoveMember($groupId: ID!, $userId: ID!) {
  removeMember(groupId: $groupId, userId: $userId)
}
    `;
export type RemoveMemberMutationFn = Apollo.MutationFunction<RemoveMemberMutation, RemoveMemberMutationVariables>;

/**
 * __useRemoveMemberMutation__
 *
 * To run a mutation, you first call `useRemoveMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMemberMutation, { data, loading, error }] = useRemoveMemberMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useRemoveMemberMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMemberMutation, RemoveMemberMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMemberMutation, RemoveMemberMutationVariables>(RemoveMemberDocument, options);
      }
export type RemoveMemberMutationHookResult = ReturnType<typeof useRemoveMemberMutation>;
export type RemoveMemberMutationResult = Apollo.MutationResult<RemoveMemberMutation>;
export type RemoveMemberMutationOptions = Apollo.BaseMutationOptions<RemoveMemberMutation, RemoveMemberMutationVariables>;
export const BlockUserDocument = gql`
    mutation BlockUser($input: BlockUserInput!) {
  blockUser(input: $input)
}
    `;
export type BlockUserMutationFn = Apollo.MutationFunction<BlockUserMutation, BlockUserMutationVariables>;

/**
 * __useBlockUserMutation__
 *
 * To run a mutation, you first call `useBlockUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBlockUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [blockUserMutation, { data, loading, error }] = useBlockUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBlockUserMutation(baseOptions?: Apollo.MutationHookOptions<BlockUserMutation, BlockUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BlockUserMutation, BlockUserMutationVariables>(BlockUserDocument, options);
      }
export type BlockUserMutationHookResult = ReturnType<typeof useBlockUserMutation>;
export type BlockUserMutationResult = Apollo.MutationResult<BlockUserMutation>;
export type BlockUserMutationOptions = Apollo.BaseMutationOptions<BlockUserMutation, BlockUserMutationVariables>;
export const UnblockUserDocument = gql`
    mutation UnblockUser($groupId: ID!, $userId: ID!) {
  unblockUser(groupId: $groupId, userId: $userId)
}
    `;
export type UnblockUserMutationFn = Apollo.MutationFunction<UnblockUserMutation, UnblockUserMutationVariables>;

/**
 * __useUnblockUserMutation__
 *
 * To run a mutation, you first call `useUnblockUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnblockUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unblockUserMutation, { data, loading, error }] = useUnblockUserMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useUnblockUserMutation(baseOptions?: Apollo.MutationHookOptions<UnblockUserMutation, UnblockUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnblockUserMutation, UnblockUserMutationVariables>(UnblockUserDocument, options);
      }
export type UnblockUserMutationHookResult = ReturnType<typeof useUnblockUserMutation>;
export type UnblockUserMutationResult = Apollo.MutationResult<UnblockUserMutation>;
export type UnblockUserMutationOptions = Apollo.BaseMutationOptions<UnblockUserMutation, UnblockUserMutationVariables>;
export const UpdateGroupDocument = gql`
    mutation UpdateGroup($id: ID!, $input: UpdateGroupInput!) {
  updateGroup(id: $id, input: $input) {
    id
    name
    description
    isPublic
  }
}
    `;
export type UpdateGroupMutationFn = Apollo.MutationFunction<UpdateGroupMutation, UpdateGroupMutationVariables>;

/**
 * __useUpdateGroupMutation__
 *
 * To run a mutation, you first call `useUpdateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupMutation, { data, loading, error }] = useUpdateGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateGroupMutation(baseOptions?: Apollo.MutationHookOptions<UpdateGroupMutation, UpdateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateGroupMutation, UpdateGroupMutationVariables>(UpdateGroupDocument, options);
      }
export type UpdateGroupMutationHookResult = ReturnType<typeof useUpdateGroupMutation>;
export type UpdateGroupMutationResult = Apollo.MutationResult<UpdateGroupMutation>;
export type UpdateGroupMutationOptions = Apollo.BaseMutationOptions<UpdateGroupMutation, UpdateGroupMutationVariables>;
export const AddMemberByUsernameDocument = gql`
    mutation AddMemberByUsername($groupId: ID!, $username: String!) {
  addMemberByUsername(groupId: $groupId, username: $username) {
    id
    role
    user {
      id
      username
      email
      firstName
      lastName
    }
  }
}
    `;
export type AddMemberByUsernameMutationFn = Apollo.MutationFunction<AddMemberByUsernameMutation, AddMemberByUsernameMutationVariables>;

/**
 * __useAddMemberByUsernameMutation__
 *
 * To run a mutation, you first call `useAddMemberByUsernameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMemberByUsernameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMemberByUsernameMutation, { data, loading, error }] = useAddMemberByUsernameMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      username: // value for 'username'
 *   },
 * });
 */
export function useAddMemberByUsernameMutation(baseOptions?: Apollo.MutationHookOptions<AddMemberByUsernameMutation, AddMemberByUsernameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddMemberByUsernameMutation, AddMemberByUsernameMutationVariables>(AddMemberByUsernameDocument, options);
      }
export type AddMemberByUsernameMutationHookResult = ReturnType<typeof useAddMemberByUsernameMutation>;
export type AddMemberByUsernameMutationResult = Apollo.MutationResult<AddMemberByUsernameMutation>;
export type AddMemberByUsernameMutationOptions = Apollo.BaseMutationOptions<AddMemberByUsernameMutation, AddMemberByUsernameMutationVariables>;
export const AddMemberByEmailDocument = gql`
    mutation AddMemberByEmail($groupId: ID!, $email: String!) {
  addMemberByEmail(groupId: $groupId, email: $email) {
    id
    user {
      id
      username
      email
      firstName
      lastName
    }
  }
}
    `;
export type AddMemberByEmailMutationFn = Apollo.MutationFunction<AddMemberByEmailMutation, AddMemberByEmailMutationVariables>;

/**
 * __useAddMemberByEmailMutation__
 *
 * To run a mutation, you first call `useAddMemberByEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMemberByEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMemberByEmailMutation, { data, loading, error }] = useAddMemberByEmailMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useAddMemberByEmailMutation(baseOptions?: Apollo.MutationHookOptions<AddMemberByEmailMutation, AddMemberByEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddMemberByEmailMutation, AddMemberByEmailMutationVariables>(AddMemberByEmailDocument, options);
      }
export type AddMemberByEmailMutationHookResult = ReturnType<typeof useAddMemberByEmailMutation>;
export type AddMemberByEmailMutationResult = Apollo.MutationResult<AddMemberByEmailMutation>;
export type AddMemberByEmailMutationOptions = Apollo.BaseMutationOptions<AddMemberByEmailMutation, AddMemberByEmailMutationVariables>;
export const DeleteGroupDocument = gql`
    mutation DeleteGroup($id: ID!) {
  deleteGroup(id: $id)
}
    `;
export type DeleteGroupMutationFn = Apollo.MutationFunction<DeleteGroupMutation, DeleteGroupMutationVariables>;

/**
 * __useDeleteGroupMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMutation, { data, loading, error }] = useDeleteGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGroupMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGroupMutation, DeleteGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGroupMutation, DeleteGroupMutationVariables>(DeleteGroupDocument, options);
      }
export type DeleteGroupMutationHookResult = ReturnType<typeof useDeleteGroupMutation>;
export type DeleteGroupMutationResult = Apollo.MutationResult<DeleteGroupMutation>;
export type DeleteGroupMutationOptions = Apollo.BaseMutationOptions<DeleteGroupMutation, DeleteGroupMutationVariables>;
export const GetMyGroupsDocument = gql`
    query GetMyGroups {
  myGroups {
    id
    name
    description
    isPublic
    createdAt
    memberships {
      id
      isAdmin
      memberId
      user {
        id
        username
        email
      }
    }
  }
}
    `;

/**
 * __useGetMyGroupsQuery__
 *
 * To run a query within a React component, call `useGetMyGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyGroupsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMyGroupsQuery(baseOptions?: Apollo.QueryHookOptions<GetMyGroupsQuery, GetMyGroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMyGroupsQuery, GetMyGroupsQueryVariables>(GetMyGroupsDocument, options);
      }
export function useGetMyGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMyGroupsQuery, GetMyGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMyGroupsQuery, GetMyGroupsQueryVariables>(GetMyGroupsDocument, options);
        }
export type GetMyGroupsQueryHookResult = ReturnType<typeof useGetMyGroupsQuery>;
export type GetMyGroupsLazyQueryHookResult = ReturnType<typeof useGetMyGroupsLazyQuery>;
export type GetMyGroupsQueryResult = Apollo.QueryResult<GetMyGroupsQuery, GetMyGroupsQueryVariables>;
export const GetPublicGroupsDocument = gql`
    query GetPublicGroups {
  publicGroups {
    id
    name
    description
    isPublic
    createdAt
    memberships {
      id
      isAdmin
      memberId
      user {
        id
        username
        email
      }
    }
  }
}
    `;

/**
 * __useGetPublicGroupsQuery__
 *
 * To run a query within a React component, call `useGetPublicGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicGroupsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPublicGroupsQuery(baseOptions?: Apollo.QueryHookOptions<GetPublicGroupsQuery, GetPublicGroupsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPublicGroupsQuery, GetPublicGroupsQueryVariables>(GetPublicGroupsDocument, options);
      }
export function useGetPublicGroupsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPublicGroupsQuery, GetPublicGroupsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPublicGroupsQuery, GetPublicGroupsQueryVariables>(GetPublicGroupsDocument, options);
        }
export type GetPublicGroupsQueryHookResult = ReturnType<typeof useGetPublicGroupsQuery>;
export type GetPublicGroupsLazyQueryHookResult = ReturnType<typeof useGetPublicGroupsLazyQuery>;
export type GetPublicGroupsQueryResult = Apollo.QueryResult<GetPublicGroupsQuery, GetPublicGroupsQueryVariables>;
export const CreateGroupDocument = gql`
    mutation CreateGroup($input: CreateGroupInput!) {
  createGroup(input: $input) {
    id
    name
    description
    isPublic
    createdAt
  }
}
    `;
export type CreateGroupMutationFn = Apollo.MutationFunction<CreateGroupMutation, CreateGroupMutationVariables>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMutation, CreateGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, options);
      }
export type CreateGroupMutationHookResult = ReturnType<typeof useCreateGroupMutation>;
export type CreateGroupMutationResult = Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<CreateGroupMutation, CreateGroupMutationVariables>;
export const JoinGroupDocument = gql`
    mutation JoinGroup($groupId: ID!) {
  joinGroup(groupId: $groupId) {
    id
    name
    description
    isPublic
    createdAt
  }
}
    `;
export type JoinGroupMutationFn = Apollo.MutationFunction<JoinGroupMutation, JoinGroupMutationVariables>;

/**
 * __useJoinGroupMutation__
 *
 * To run a mutation, you first call `useJoinGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useJoinGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [joinGroupMutation, { data, loading, error }] = useJoinGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useJoinGroupMutation(baseOptions?: Apollo.MutationHookOptions<JoinGroupMutation, JoinGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<JoinGroupMutation, JoinGroupMutationVariables>(JoinGroupDocument, options);
      }
export type JoinGroupMutationHookResult = ReturnType<typeof useJoinGroupMutation>;
export type JoinGroupMutationResult = Apollo.MutationResult<JoinGroupMutation>;
export type JoinGroupMutationOptions = Apollo.BaseMutationOptions<JoinGroupMutation, JoinGroupMutationVariables>;
export const LeaveGroupDocument = gql`
    mutation LeaveGroup($groupId: ID!) {
  leaveGroup(groupId: $groupId)
}
    `;
export type LeaveGroupMutationFn = Apollo.MutationFunction<LeaveGroupMutation, LeaveGroupMutationVariables>;

/**
 * __useLeaveGroupMutation__
 *
 * To run a mutation, you first call `useLeaveGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveGroupMutation, { data, loading, error }] = useLeaveGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useLeaveGroupMutation(baseOptions?: Apollo.MutationHookOptions<LeaveGroupMutation, LeaveGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LeaveGroupMutation, LeaveGroupMutationVariables>(LeaveGroupDocument, options);
      }
export type LeaveGroupMutationHookResult = ReturnType<typeof useLeaveGroupMutation>;
export type LeaveGroupMutationResult = Apollo.MutationResult<LeaveGroupMutation>;
export type LeaveGroupMutationOptions = Apollo.BaseMutationOptions<LeaveGroupMutation, LeaveGroupMutationVariables>;
export const GetGroupDocument = gql`
    query GetGroup($id: ID!) {
  group(id: $id) {
    id
    name
    description
    createdAt
    memberships {
      id
      isAdmin
      memberId
      user {
        id
        username
        email
      }
    }
  }
}
    `;

/**
 * __useGetGroupQuery__
 *
 * To run a query within a React component, call `useGetGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGroupQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetGroupQuery(baseOptions: Apollo.QueryHookOptions<GetGroupQuery, GetGroupQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGroupQuery, GetGroupQueryVariables>(GetGroupDocument, options);
      }
export function useGetGroupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGroupQuery, GetGroupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGroupQuery, GetGroupQueryVariables>(GetGroupDocument, options);
        }
export type GetGroupQueryHookResult = ReturnType<typeof useGetGroupQuery>;
export type GetGroupLazyQueryHookResult = ReturnType<typeof useGetGroupLazyQuery>;
export type GetGroupQueryResult = Apollo.QueryResult<GetGroupQuery, GetGroupQueryVariables>;
export const GetMessagesDocument = gql`
    query GetMessages($groupId: ID!) {
  messages(groupId: $groupId) {
    id
    content
    createdAt
    user {
      id
      username
      email
    }
  }
}
    `;

/**
 * __useGetMessagesQuery__
 *
 * To run a query within a React component, call `useGetMessagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMessagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMessagesQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGetMessagesQuery(baseOptions: Apollo.QueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMessagesQuery, GetMessagesQueryVariables>(GetMessagesDocument, options);
      }
export function useGetMessagesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMessagesQuery, GetMessagesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMessagesQuery, GetMessagesQueryVariables>(GetMessagesDocument, options);
        }
export type GetMessagesQueryHookResult = ReturnType<typeof useGetMessagesQuery>;
export type GetMessagesLazyQueryHookResult = ReturnType<typeof useGetMessagesLazyQuery>;
export type GetMessagesQueryResult = Apollo.QueryResult<GetMessagesQuery, GetMessagesQueryVariables>;
export const SendMessageDocument = gql`
    mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    content
    createdAt
    user {
      id
      username
      email
    }
  }
}
    `;
export type SendMessageMutationFn = Apollo.MutationFunction<SendMessageMutation, SendMessageMutationVariables>;

/**
 * __useSendMessageMutation__
 *
 * To run a mutation, you first call `useSendMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendMessageMutation, { data, loading, error }] = useSendMessageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSendMessageMutation(baseOptions?: Apollo.MutationHookOptions<SendMessageMutation, SendMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendMessageMutation, SendMessageMutationVariables>(SendMessageDocument, options);
      }
export type SendMessageMutationHookResult = ReturnType<typeof useSendMessageMutation>;
export type SendMessageMutationResult = Apollo.MutationResult<SendMessageMutation>;
export type SendMessageMutationOptions = Apollo.BaseMutationOptions<SendMessageMutation, SendMessageMutationVariables>;
export const OnMessageAddedDocument = gql`
    subscription OnMessageAdded($groupId: ID!) {
  messageAdded(groupId: $groupId) {
    id
    content
    createdAt
    user {
      id
      username
      email
    }
  }
}
    `;

/**
 * __useOnMessageAddedSubscription__
 *
 * To run a query within a React component, call `useOnMessageAddedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnMessageAddedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnMessageAddedSubscription({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useOnMessageAddedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnMessageAddedSubscription, OnMessageAddedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnMessageAddedSubscription, OnMessageAddedSubscriptionVariables>(OnMessageAddedDocument, options);
      }
export type OnMessageAddedSubscriptionHookResult = ReturnType<typeof useOnMessageAddedSubscription>;
export type OnMessageAddedSubscriptionResult = Apollo.SubscriptionResult<OnMessageAddedSubscription>;
export const GetUserTennisLeaguesDocument = gql`
    query GetUserTennisLeagues {
  userTennisLeagues {
    id
    name
    description
    isActive
  }
}
    `;

/**
 * __useGetUserTennisLeaguesQuery__
 *
 * To run a query within a React component, call `useGetUserTennisLeaguesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserTennisLeaguesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserTennisLeaguesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserTennisLeaguesQuery(baseOptions?: Apollo.QueryHookOptions<GetUserTennisLeaguesQuery, GetUserTennisLeaguesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserTennisLeaguesQuery, GetUserTennisLeaguesQueryVariables>(GetUserTennisLeaguesDocument, options);
      }
export function useGetUserTennisLeaguesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserTennisLeaguesQuery, GetUserTennisLeaguesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserTennisLeaguesQuery, GetUserTennisLeaguesQueryVariables>(GetUserTennisLeaguesDocument, options);
        }
export type GetUserTennisLeaguesQueryHookResult = ReturnType<typeof useGetUserTennisLeaguesQuery>;
export type GetUserTennisLeaguesLazyQueryHookResult = ReturnType<typeof useGetUserTennisLeaguesLazyQuery>;
export type GetUserTennisLeaguesQueryResult = Apollo.QueryResult<GetUserTennisLeaguesQuery, GetUserTennisLeaguesQueryVariables>;
export const GetUserProfileDocument = gql`
    query GetUserProfile {
  me {
    id
    username
    email
    firstName
    lastName
    bio
    avatar
    createdAt
    emailVerified
  }
}
    `;

/**
 * __useGetUserProfileQuery__
 *
 * To run a query within a React component, call `useGetUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserProfileQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserProfileQuery(baseOptions?: Apollo.QueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
      }
export function useGetUserProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
        }
export type GetUserProfileQueryHookResult = ReturnType<typeof useGetUserProfileQuery>;
export type GetUserProfileLazyQueryHookResult = ReturnType<typeof useGetUserProfileLazyQuery>;
export type GetUserProfileQueryResult = Apollo.QueryResult<GetUserProfileQuery, GetUserProfileQueryVariables>;
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($input: UpdateUserInput!) {
  updateProfile(input: $input) {
    id
    username
    email
    firstName
    lastName
    bio
    avatar
  }
}
    `;
export type UpdateProfileMutationFn = Apollo.MutationFunction<UpdateProfileMutation, UpdateProfileMutationVariables>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, options);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    success
    message
  }
}
    `;
export type ChangePasswordMutationFn = Apollo.MutationFunction<ChangePasswordMutation, ChangePasswordMutationVariables>;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChangePasswordMutation(baseOptions?: Apollo.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, options);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = Apollo.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = Apollo.BaseMutationOptions<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const DeleteUserDocument = gql`
    mutation DeleteUser($userId: ID!) {
  deleteUser(userId: $userId)
}
    `;
export type DeleteUserMutationFn = Apollo.MutationFunction<DeleteUserMutation, DeleteUserMutationVariables>;

/**
 * __useDeleteUserMutation__
 *
 * To run a mutation, you first call `useDeleteUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserMutation, { data, loading, error }] = useDeleteUserMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDeleteUserMutation(baseOptions?: Apollo.MutationHookOptions<DeleteUserMutation, DeleteUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteUserMutation, DeleteUserMutationVariables>(DeleteUserDocument, options);
      }
export type DeleteUserMutationHookResult = ReturnType<typeof useDeleteUserMutation>;
export type DeleteUserMutationResult = Apollo.MutationResult<DeleteUserMutation>;
export type DeleteUserMutationOptions = Apollo.BaseMutationOptions<DeleteUserMutation, DeleteUserMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    username
    email
    emailVerified
    phone
    photoUrl
    firstName
    lastName
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;