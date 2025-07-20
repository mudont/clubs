import { gql } from '@apollo/client';

export const GET_USER_PROFILE = gql`
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

export const UPDATE_PROFILE = gql`
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

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
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

export const ME_QUERY = gql`
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
