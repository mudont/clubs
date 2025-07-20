import { gql } from '@apollo/client';

export const GET_USER_TENNIS_LEAGUES = gql`
  query GetUserTennisLeagues {
    userTennisLeagues {
      id
      name
      description
      isActive
    }
  }
`;
// ...copy all tennis/graphql.ts exports here...
// ...add GET_TEAM_MATCH from LineupPage.tsx...
