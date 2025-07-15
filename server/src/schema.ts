import gql from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    emailVerified: Boolean!
    phone: String
    photoUrl: String
    firstName: String
    lastName: String
    bio: String
    avatar: String
    createdAt: DateTime!
    updatedAt: DateTime!
    memberships: [Membership!]!
    messages: [Message!]!
  }

  type Group {
    id: ID!
    name: String!
    description: String
    isPublic: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    memberships: [Membership!]!
    events: [Event!]!
    messages: [Message!]!
    members: [Membership!]!
    blockedUsers: [BlockedUser!]!
  }

  type Membership {
    id: ID!
    user: User!
    group: Group!
    isAdmin: Boolean!
    memberId: Int!
    joinedAt: DateTime!
    role: String!
  }

  type BlockedUser {
    id: ID!
    user: User!
    group: Group!
    blockedBy: User!
    blockedAt: DateTime!
    reason: String
  }

  type Event {
    id: ID!
    group: Group!
    createdBy: User!
    date: DateTime!
    description: String!
    rsvps: [RSVP!]!
  }

  type RSVP {
    id: ID!
    event: Event!
    user: User!
    status: RSVPStatus!
    note: String
    createdAt: DateTime!
  }

  enum RSVPStatus {
    AVAILABLE
    NOT_AVAILABLE
    MAYBE
    ONLY_IF_NEEDED
  }

  type Message {
    id: ID!
    group: Group!
    user: User!
    content: String!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateGroupInput {
    name: String!
    description: String
    isPublic: Boolean
  }

  input UpdateGroupInput {
    name: String
    description: String
    isPublic: Boolean
  }

  input CreateEventInput {
    groupId: ID!
    date: DateTime!
    description: String!
  }

  input CreateRSVPInput {
    eventId: ID!
    status: RSVPStatus!
    note: String
  }

  input SendMessageInput {
    groupId: ID!
    content: String!
  }

  input UpdateUserInput {
    username: String
    phone: String
    photoUrl: String
    firstName: String
    lastName: String
    bio: String
  }

  input BlockUserInput {
    groupId: ID!
    userId: ID!
    reason: String
  }

  type Query {
    health: String!

    # User queries
    me: User
    user(id: ID!): User
    userSearch(query: String!): [User!]!

    # Group queries
    groups: [Group!]!
    group(id: ID!): Group
    myGroups: [Group!]!
    publicGroups(query: String): [Group!]!

    # Event queries
    events(groupId: ID!): [Event!]!
    event(id: ID!): Event

    # Message queries
    messages(groupId: ID!, limit: Int = 50): [Message!]!

    # Tennis queries
    tennisLeagues: [TeamLeague!]!
    tennisLeague(id: ID!): TeamLeague
    tennisLeagueStandings(id: ID!): [TeamLeagueStandingsRow!]!
  }

  type Mutation {
    # Group mutations
    createGroup(input: CreateGroupInput!): Group!
    updateGroup(id: ID!, input: UpdateGroupInput!): Group!
    joinGroup(groupId: ID!): Membership!
    leaveGroup(groupId: ID!): Boolean!
    addMember(groupId: ID!, userId: ID!): Membership!
    addMemberByUsername(groupId: ID!, username: String!): Membership!
    addMemberByEmail(groupId: ID!, email: String!): Membership!
    removeMember(groupId: ID!, userId: ID!): Boolean!
    makeAdmin(groupId: ID!, userId: ID!): Membership!
    removeAdmin(groupId: ID!, userId: ID!): Membership!
    blockUser(input: BlockUserInput!): Boolean!
    unblockUser(groupId: ID!, userId: ID!): Boolean!
    deleteGroup(id: ID!): Boolean!

    # Event mutations
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: CreateEventInput!): Event!
    deleteEvent(id: ID!): Boolean!
    createRSVP(input: CreateRSVPInput!): RSVP!
    updateRSVP(id: ID!, status: RSVPStatus!, note: String): RSVP!
    deleteRSVP(id: ID!): Boolean!

    # Message mutations
    sendMessage(input: SendMessageInput!): Message!

    # User mutations
    updateProfile(input: UpdateUserInput!): User!
    deleteUser(userId: ID!): Boolean!

    # Tennis mutations
    createTennisLeague(input: CreateTennisLeagueInput!): TeamLeague!
    updateTennisLeague(id: ID!, input: UpdateTennisLeagueInput!): TeamLeague!
    deleteTennisLeague(id: ID!): Boolean!
    createTennisTeam(leagueId: ID!, input: CreateTennisTeamInput!): TeamLeagueTeam!
    updateTennisTeam(id: ID!, input: UpdateTennisTeamInput!): TeamLeagueTeam!
    deleteTennisTeam(id: ID!): Boolean!
    createTeamMatch(leagueId: ID!, input: CreateTeamMatchInput!): TeamLeagueTeamMatch!
    updateTeamMatch(id: ID!, input: UpdateTeamMatchInput!): TeamLeagueTeamMatch!
    deleteTeamMatch(id: ID!): Boolean!
    createIndividualSinglesMatch(leagueId: ID!, input: CreateIndividualSinglesMatchInput!): TeamLeagueIndividualSinglesMatch!
    updateIndividualSinglesMatch(id: ID!, input: UpdateIndividualSinglesMatchInput!): TeamLeagueIndividualSinglesMatch!
    deleteIndividualSinglesMatch(id: ID!): Boolean!
    createIndividualDoublesMatch(leagueId: ID!, input: CreateIndividualDoublesMatchInput!): TeamLeagueIndividualDoublesMatch!
    updateIndividualDoublesMatch(id: ID!, input: UpdateIndividualDoublesMatchInput!): TeamLeagueIndividualDoublesMatch!
    deleteIndividualDoublesMatch(id: ID!): Boolean!
    updatePointSystem(leagueId: ID!, input: UpdatePointSystemInput!): TeamLeaguePointSystem!
  }

  type Subscription {
    # Real-time updates
    messageAdded(groupId: ID!): Message!
    eventCreated(groupId: ID!): Event!
    rsvpUpdated(eventId: ID!): RSVP!
    memberJoined(groupId: ID!): Membership!
  }

  scalar DateTime

  type TeamLeague {
    id: ID!
    name: String!
    description: String
    startDate: DateTime!
    endDate: DateTime!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    pointSystem: TeamLeaguePointSystem!
    teams: [TeamLeagueTeam!]!
    teamMatches: [TeamLeagueTeamMatch!]!
  }

  type TeamLeaguePointSystem {
    id: ID!
    winPoints: Int!
    lossPoints: Int!
    drawPoints: Int!
    defaultWinPoints: Int!
    defaultLossPoints: Int!
    defaultDrawPoints: Int!
  }

  type TeamLeagueTeam {
    id: ID!
    group: Group!
    captainId: String!
    captain: User!
    # Members are derived from the group's memberships
    members: [User!]!
  }

  type TeamLeagueTeamMatch {
    id: ID!
    homeTeamId: String!
    awayTeamId: String!
    homeTeam: TeamLeagueTeam!
    awayTeam: TeamLeagueTeam!
    homeScore: Int
    awayScore: Int
    matchDate: DateTime!
    isCompleted: Boolean!
    createdAt: DateTime!
    individualSinglesMatches: [TeamLeagueIndividualSinglesMatch!]!
    individualDoublesMatches: [TeamLeagueIndividualDoublesMatch!]!
  }

  type TeamLeagueIndividualSinglesMatch {
    id: ID!
    player1Id: String!
    player2Id: String!
    player1: User!
    player2: User!
    player1Score: Int
    player2Score: Int
    matchDate: DateTime!
    isCompleted: Boolean!
    createdAt: DateTime!
    teamMatchId: String!
    teamMatch: TeamLeagueTeamMatch!
  }

  type TeamLeagueIndividualDoublesMatch {
    id: ID!
    team1Player1Id: String!
    team1Player2Id: String!
    team2Player1Id: String!
    team2Player2Id: String!
    team1Player1: User!
    team1Player2: User!
    team2Player1: User!
    team2Player2: User!
    team1Score: Int
    team2Score: Int
    matchDate: DateTime!
    isCompleted: Boolean!
    createdAt: DateTime!
    teamMatchId: String!
    teamMatch: TeamLeagueTeamMatch!
  }

  type TeamLeagueStandingsRow {
    teamId: String!
    teamName: String!
    matchesPlayed: Int!
    wins: Int!
    losses: Int!
    draws: Int!
    points: Int!
    gamesWon: Int!
    gamesLost: Int!
  }

  input CreateTennisLeagueInput {
    name: String!
    description: String
    startDate: DateTime!
    endDate: DateTime!
    isActive: Boolean
  }

  input UpdateTennisLeagueInput {
    name: String
    description: String
    startDate: DateTime
    endDate: DateTime
    isActive: Boolean
  }

  input CreateTennisTeamInput {
    groupId: String!
    captainId: String!
    # memberIds is deprecated; team members are now determined by the group's members
  }

  input UpdateTennisTeamInput {
    groupId: String
    captainId: String
    # memberIds is deprecated; team members are now determined by the group's members
  }

  input CreateTeamMatchInput {
    homeTeamId: String!
    awayTeamId: String!
    matchDate: DateTime!
    homeScore: Int
    awayScore: Int
    isCompleted: Boolean
  }

  input UpdateTeamMatchInput {
    homeTeamId: String
    awayTeamId: String
    matchDate: DateTime
    homeScore: Int
    awayScore: Int
    isCompleted: Boolean
  }

  input CreateIndividualSinglesMatchInput {
    player1Id: String!
    player2Id: String!
    matchDate: DateTime!
    player1Score: Int
    player2Score: Int
    isCompleted: Boolean
    teamMatchId: String!
  }

  input UpdateIndividualSinglesMatchInput {
    player1Id: String
    player2Id: String
    matchDate: DateTime
    player1Score: Int
    player2Score: Int
    isCompleted: Boolean
    teamMatchId: String
  }

  input CreateIndividualDoublesMatchInput {
    team1Player1Id: String!
    team1Player2Id: String!
    team2Player1Id: String!
    team2Player2Id: String!
    matchDate: DateTime!
    team1Score: Int
    team2Score: Int
    isCompleted: Boolean
    teamMatchId: String!
  }

  input UpdateIndividualDoublesMatchInput {
    team1Player1Id: String
    team1Player2Id: String
    team2Player1Id: String
    team2Player2Id: String
    matchDate: DateTime
    team1Score: Int
    team2Score: Int
    isCompleted: Boolean
    teamMatchId: String
  }

  input UpdatePointSystemInput {
    winPoints: Int
    lossPoints: Int
    drawPoints: Int
    defaultWinPoints: Int
    defaultLossPoints: Int
    defaultDrawPoints: Int
  }
`;
