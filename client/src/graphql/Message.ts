import { gql } from '@apollo/client';

export const GET_MESSAGES = gql`
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

export const SEND_MESSAGE = gql`
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

export const MESSAGE_SUBSCRIPTION = gql`
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
