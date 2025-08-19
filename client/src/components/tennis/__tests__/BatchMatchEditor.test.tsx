import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';

import BatchMatchEditor from '../BatchMatchEditor';
import { IndividualDoublesMatch, IndividualSinglesMatch, TeamLeagueTeamMatch } from '../types';

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

const mockSinglesMatches: IndividualSinglesMatch[] = [];
const mockDoublesMatches: IndividualDoublesMatch[] = [];

describe('BatchMatchEditor', () => {
  const mockOnSave = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders singles and doubles tabs', () => {
    render(
      <MockedProvider mocks={[]}>
        <BatchMatchEditor
          singlesMatches={mockSinglesMatches}
          doublesMatches={mockDoublesMatches}
          onSave={mockOnSave}
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onRefresh={mockOnRefresh}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Singles')).toBeInTheDocument();
    expect(screen.getByText('Doubles')).toBeInTheDocument();
  });

  it('shows add singles match button', () => {
    render(
      <MockedProvider mocks={[]}>
        <BatchMatchEditor
          singlesMatches={mockSinglesMatches}
          doublesMatches={mockDoublesMatches}
          onSave={mockOnSave}
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onRefresh={mockOnRefresh}
        />
      </MockedProvider>
    );

    expect(screen.getByText('Add Singles Match')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <MockedProvider mocks={[]}>
        <BatchMatchEditor
          singlesMatches={mockSinglesMatches}
          doublesMatches={mockDoublesMatches}
          onSave={mockOnSave}
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onRefresh={mockOnRefresh}
        />
      </MockedProvider>
    );

    const addButton = screen.getByLabelText('Add new singles match');
    expect(addButton).toBeInTheDocument();
  });

  it('maintains Save All functionality', () => {
    render(
      <MockedProvider mocks={[]}>
        <BatchMatchEditor
          singlesMatches={mockSinglesMatches}
          doublesMatches={mockDoublesMatches}
          onSave={mockOnSave}
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onRefresh={mockOnRefresh}
        />
      </MockedProvider>
    );

    const saveAllButton = screen.getByText('Save All');
    expect(saveAllButton).toBeInTheDocument();
  });
});
