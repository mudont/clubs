import { gql } from '@apollo/client';

export const GET_GROUP_MEMBERS = gql`
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

export const MAKE_ADMIN = gql`
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


export const REMOVE_ADMIN = gql`
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

export const REMOVE_MEMBER = gql`
  mutation RemoveMember($groupId: ID!, $userId: ID!) {
    removeMember(groupId: $groupId, userId: $userId)
  }
`;

export const BLOCK_USER = gql`
  mutation BlockUser($input: BlockUserInput!) {
    blockUser(input: $input)
  }
`;

export const UNBLOCK_USER = gql`
  mutation UnblockUser($groupId: ID!, $userId: ID!) {
    unblockUser(groupId: $groupId, userId: $userId)
  }
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($id: ID!, $input: UpdateGroupInput!) {
    updateGroup(id: $id, input: $input) {
      id
      name
      description
      isPublic
    }
  }
`;

export const ADD_MEMBER_BY_USERNAME = gql`
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

export const ADD_MEMBER_BY_EMAIL = gql`
  mutation AddMemberByEmail($groupId: ID!, $email: String!) {
    addMemberByEmail(groupId: $groupId, email: $email) {
      id
      username
      email
      firstName
      lastName
    }
  }
`;

export const USER_SEARCH = gql`
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

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    deleteGroup(id: $id)
  }
`;

export const GET_MY_GROUPS = gql`
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

export const GET_PUBLIC_GROUPS = gql`
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

export const CREATE_GROUP = gql`
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

export const JOIN_GROUP = gql`
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

export const LEAVE_GROUP = gql`
  mutation LeaveGroup($groupId: ID!) {
    leaveGroup(groupId: $groupId)
  }
`;

export const GET_GROUP = gql`
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

export const GROUP_SEARCH = gql`
  query GroupSearch($query: String!) {
    publicGroups(query: $query) {
      id
      name
      description
    }
  }
`;
