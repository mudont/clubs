import { gql } from '@apollo/client';

export const GET_EVENTS = gql`
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

export const CREATE_EVENT = gql`
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

export const CREATE_RSVP = gql`
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

export const UPDATE_RSVP = gql`
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

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

export const UPDATE_EVENT = gql`
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

export const GET_USER_PENDING_EVENTS = gql`
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
