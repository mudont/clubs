import { gql } from '@apollo/client';

// Fragments for reusable field selections
export const TEAM_LEAGUE_FRAGMENT = gql`
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
        player1 { id username firstName lastName email }
        player2 { id username firstName lastName email }
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
        team1Player1 { id username firstName lastName email }
        team1Player2 { id username firstName lastName email }
        team2Player1 { id username firstName lastName email }
        team2Player2 { id username firstName lastName email }
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

export const TEAM_FRAGMENT = gql`
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

export const MATCH_FRAGMENT = gql`
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
      player1 { id username firstName lastName email }
      player2 { id username firstName lastName email }
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
      team1Player1 { id username firstName lastName email }
      team1Player2 { id username firstName lastName email }
      team2Player1 { id username firstName lastName email }
      team2Player2 { id username firstName lastName email }
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

// Queries
export const GET_TENNIS_LEAGUES = gql`
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

export const GET_TENNIS_LEAGUE = gql`
  query GetTennisLeague($id: ID!) {
    tennisLeague(id: $id) {
      ...TeamLeagueFragment
    }
  }
  ${TEAM_LEAGUE_FRAGMENT}
`;

export const GET_TENNIS_LEAGUE_STANDINGS = gql`
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

export const GET_LEAGUE_POINT_SYSTEMS = gql`
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

export const GET_LINEUP = gql`
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
        player1 { id username firstName lastName email }
        player2 { id username firstName lastName email }
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_GROUP_RSVPS = gql`
  query GetGroupRsvps($groupId: ID!) {
    group(id: $groupId) {
      id
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
`;

// Mutations
export const CREATE_TENNIS_LEAGUE = gql`
  mutation CreateTennisLeague($input: CreateTennisLeagueInput!) {
    createTennisLeague(input: $input) {
      ...TeamLeagueFragment
    }
  }
  ${TEAM_LEAGUE_FRAGMENT}
`;

export const UPDATE_TENNIS_LEAGUE = gql`
  mutation UpdateTennisLeague($id: ID!, $input: UpdateTennisLeagueInput!) {
    updateTennisLeague(id: $id, input: $input) {
      ...TeamLeagueFragment
    }
  }
  ${TEAM_LEAGUE_FRAGMENT}
`;

export const DELETE_TENNIS_LEAGUE = gql`
  mutation DeleteTennisLeague($id: ID!) {
    deleteTennisLeague(id: $id)
  }
`;

export const CREATE_TENNIS_TEAM = gql`
  mutation CreateTennisTeam($leagueId: ID!, $input: CreateTennisTeamInput!) {
    createTennisTeam(leagueId: $leagueId, input: $input) {
      ...TeamFragment
    }
  }
  ${TEAM_FRAGMENT}
`;

export const UPDATE_TENNIS_TEAM = gql`
  mutation UpdateTennisTeam($id: ID!, $input: UpdateTennisTeamInput!) {
    updateTennisTeam(id: $id, input: $input) {
      ...TeamFragment
    }
  }
  ${TEAM_FRAGMENT}
`;

export const DELETE_TENNIS_TEAM = gql`
  mutation DeleteTennisTeam($id: ID!) {
    deleteTennisTeam(id: $id)
  }
`;

export const CREATE_TEAM_MATCH = gql`
  mutation CreateTeamMatch($leagueId: ID!, $input: CreateTeamMatchInput!) {
    createTeamMatch(leagueId: $leagueId, input: $input) {
      ...MatchFragment
    }
  }
  ${MATCH_FRAGMENT}
`;

export const UPDATE_TEAM_MATCH = gql`
  mutation UpdateTeamMatch($id: ID!, $input: UpdateTeamMatchInput!) {
    updateTeamMatch(id: $id, input: $input) {
      ...MatchFragment
    }
  }
  ${MATCH_FRAGMENT}
`;

export const DELETE_TEAM_MATCH = gql`
  mutation DeleteTeamMatch($id: ID!) {
    deleteTeamMatch(id: $id)
  }
`;

export const CREATE_INDIVIDUAL_SINGLES_MATCH = gql`
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

export const UPDATE_INDIVIDUAL_SINGLES_MATCH = gql`
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

export const DELETE_INDIVIDUAL_SINGLES_MATCH = gql`
  mutation DeleteIndividualSinglesMatch($id: ID!) {
    deleteIndividualSinglesMatch(id: $id)
  }
`;

export const CREATE_INDIVIDUAL_DOUBLES_MATCH = gql`
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

export const UPDATE_INDIVIDUAL_DOUBLES_MATCH = gql`
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

export const DELETE_INDIVIDUAL_DOUBLES_MATCH = gql`
  mutation DeleteIndividualDoublesMatch($id: ID!) {
    deleteIndividualDoublesMatch(id: $id)
  }
`;

export const CREATE_LEAGUE_POINT_SYSTEM = gql`
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

export const UPDATE_LEAGUE_POINT_SYSTEM = gql`
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

export const DELETE_LEAGUE_POINT_SYSTEM = gql`
  mutation DeleteLeaguePointSystem($id: ID!) {
    deleteTeamLeaguePointSystem(id: $id)
  }
`;

export const UPDATE_POINT_SYSTEM = gql`
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

export const CREATE_OR_UPDATE_LINEUP = gql`
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
        player1 { id username firstName lastName email }
        player2 { id username firstName lastName email }
      }
      createdAt
      updatedAt
    }
  }
`;

export const PUBLISH_LINEUP = gql`
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
        player1 { id username firstName lastName email }
        player2 { id username firstName lastName email }
      }
      createdAt
      updatedAt
    }
  }
`;
