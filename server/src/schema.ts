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

  type Club {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    memberships: [Membership!]!
    events: [Event!]!
    messages: [Message!]!
    members: [Membership!]!
  }

  type Membership {
    id: ID!
    user: User!
    club: Club!
    isAdmin: Boolean!
    memberId: Int!
    joinedAt: DateTime!
    role: String!
  }

  type Event {
    id: ID!
    club: Club!
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
    club: Club!
    user: User!
    content: String!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input CreateClubInput {
    name: String!
    description: String
  }

  input CreateEventInput {
    clubId: ID!
    date: DateTime!
    description: String!
  }

  input CreateRSVPInput {
    eventId: ID!
    status: RSVPStatus!
    note: String
  }

  input SendMessageInput {
    clubId: ID!
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

  type Query {
    health: String!

    # User queries
    me: User
    user(id: ID!): User
    userSearch(query: String!): [User!]!

    # Club queries
    clubs: [Club!]!
    club(id: ID!): Club
    myClubs: [Club!]!

    # Event queries
    events(clubId: ID!): [Event!]!
    event(id: ID!): Event

    # Message queries
    messages(clubId: ID!, limit: Int = 50): [Message!]!
  }

  type Mutation {
    # Club mutations
    createClub(input: CreateClubInput!): Club!
    joinClub(clubId: ID!): Membership!
    leaveClub(clubId: ID!): Boolean!
    addMember(clubId: ID!, userId: ID!): Membership!
    addMemberByUsername(clubId: ID!, username: String!): Membership!
    addMemberByEmail(clubId: ID!, email: String!): Membership!
    removeMember(clubId: ID!, userId: ID!): Boolean!
    makeAdmin(clubId: ID!, userId: ID!): Membership!
    removeAdmin(clubId: ID!, userId: ID!): Membership!

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
  }

  type Subscription {
    # Real-time updates
    messageAdded(clubId: ID!): Message!
    eventCreated(clubId: ID!): Event!
    rsvpUpdated(eventId: ID!): RSVP!
    memberJoined(clubId: ID!): Membership!
  }

  scalar DateTime
`;
