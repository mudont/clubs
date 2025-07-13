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
    publicGroups: [Group!]!

    # Event queries
    events(groupId: ID!): [Event!]!
    event(id: ID!): Event

    # Message queries
    messages(groupId: ID!, limit: Int = 50): [Message!]!
  }

  type Mutation {
    # Group mutations
    createGroup(input: CreateGroupInput!): Group!
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
    messageAdded(groupId: ID!): Message!
    eventCreated(groupId: ID!): Event!
    rsvpUpdated(eventId: ID!): RSVP!
    memberJoined(groupId: ID!): Membership!
  }

  scalar DateTime
`;
