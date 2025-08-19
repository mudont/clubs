import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';

import IndividualMatchForm from '../IndividualMatchForm';
import { TeamLeagueTeamMatch } from '../types';

const mockTeamMatch: TeamLeagueTeamMatch = {
  id: 'team-match-1',
  homeTeamId: 'home-team-1',
  awayTeamId: 'away-team-1',
  matchDate: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-01T00:00:00Z',
  homeTeam: {
    id: 'home-team-1',
    group: {
      id: 'home-group-1',
      name: 'Home Team',
      members: [
        {
          id: 'member-1',
          user: {
            id: 'user-1',
            username: 'player1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        },
      ],
    },
    captainId: 'user-1',
    captain: {
      id: 'user-1',
      username: 'player1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  },
  awayTeam: {
    id: 'away-team-1',
    group: {
      id: 'away-group-1',
      name: 'Away Team',
      members: [
        {
          id: 'member-2',
          user: {
            id: 'user-2',
            username: 'player2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
          },
        },
      ],
    },
    captainId: 'user-2',
    captain: {
      id: 'user-2',
      username: 'player2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    },
  },
  individualSinglesMatches: [],
  individualDoublesMatches: [],
};

describe('IndividualMatchForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders singles form', () => {
    render(
      <MockedProvider mocks={[]}>
        <IndividualMatchForm
          matchType="singles"
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Create New Singles Match')).toBeInTheDocument();
    expect(screen.getByText('Home Player *')).toBeInTheDocument();
    expect(screen.getByText('Away Player *')).toBeInTheDocument();
  });

  it('renders doubles form', () => {
    render(
      <MockedProvider mocks={[]}>
        <IndividualMatchForm
          matchType="doubles"
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Create New Doubles Match')).toBeInTheDocument();
    expect(screen.getByText('Home Player 1 *')).toBeInTheDocument();
    expect(screen.getByText('Home Player 2 *')).toBeInTheDocument();
  });

  it('pre-populates form with team match data', () => {
    render(
      <MockedProvider mocks={[]}>
        <IndividualMatchForm
          matchType="singles"
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
          initialOrder={2}
        />
      </MockedProvider>
    );

    const dateInput = screen.getByDisplayValue('2024-01-15');
    const orderInput = screen.getByDisplayValue('2');

    expect(dateInput).toBeInTheDocument();
    expect(orderInput).toBeInTheDocument();
  });

  it('shows players from correct teams', () => {
    render(
      <MockedProvider mocks={[]}>
        <IndividualMatchForm
          matchType="singles"
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />
      </MockedProvider>
    );

    // Check that players are shown in the dropdowns
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});
