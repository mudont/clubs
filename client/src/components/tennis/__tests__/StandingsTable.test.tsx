import { screen } from '@testing-library/react';

import { expectAccessible } from '../../../__tests__/utils/accessibility-helpers';
import { BaseComponentTestSuite } from '../../../__tests__/utils/base-component-tests';
import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import StandingsTable from '../StandingsTable';

// Test data
const mockStandings = [
  {
    teamId: 'team-1',
    teamName: 'Eagles',
    matchesPlayed: 10,
    wins: 8,
    losses: 1,
    draws: 1,
    points: 25,
    gamesWon: 45,
    gamesLost: 20,
  },
  {
    teamId: 'team-2',
    teamName: 'Hawks',
    matchesPlayed: 10,
    wins: 6,
    losses: 3,
    draws: 1,
    points: 19,
    gamesWon: 38,
    gamesLost: 25,
  },
  {
    teamId: 'team-3',
    teamName: 'Lions',
    matchesPlayed: 10,
    wins: 5,
    losses: 4,
    draws: 1,
    points: 16,
    gamesWon: 32,
    gamesLost: 28,
  },
  {
    teamId: 'team-4',
    teamName: 'Tigers',
    matchesPlayed: 10,
    wins: 3,
    losses: 6,
    draws: 1,
    points: 10,
    gamesWon: 25,
    gamesLost: 35,
  },
  {
    teamId: 'team-5',
    teamName: 'Bears',
    matchesPlayed: 10,
    wins: 1,
    losses: 8,
    draws: 1,
    points: 4,
    gamesWon: 15,
    gamesLost: 45,
  },
];

const mockTeams = [
  { teamId: 'team-1', teamName: 'Eagles' },
  { teamId: 'team-2', teamName: 'Hawks' },
  { teamId: 'team-3', teamName: 'Lions' },
];

// Test suite implementation
class StandingsTableTestSuite extends BaseComponentTestSuite<{
  standings: any[];
  loading?: boolean;
  teams?: { teamId: string; teamName: string }[];
}> {
  component = StandingsTable;
  defaultProps = {
    standings: mockStandings,
    loading: false,
    teams: [],
  };
  displayName = 'StandingsTable';

  async testUserInteractions(): Promise<void> {
    describe('User Interactions', () => {
      it('displays standings data correctly', async () => {
        this.render();

        // Check that all teams are displayed
        expect(screen.getByText('Eagles')).toBeInTheDocument();
        expect(screen.getByText('Hawks')).toBeInTheDocument();
        expect(screen.getByText('Lions')).toBeInTheDocument();
        expect(screen.getByText('Tigers')).toBeInTheDocument();
        expect(screen.getByText('Bears')).toBeInTheDocument();

        // Check that statistics are displayed
        expect(screen.getByText('25')).toBeInTheDocument(); // Eagles points
        expect(screen.getByText('19')).toBeInTheDocument(); // Hawks points
        expect(screen.getByText('16')).toBeInTheDocument(); // Lions points
      });

      it('sorts teams by points correctly', async () => {
        this.render();

        const rows = screen.getAllByRole('row');
        const dataRows = rows.slice(1); // Skip header row

        // Check that teams are in correct order (by points descending)
        expect(dataRows[0]).toHaveTextContent('Eagles');
        expect(dataRows[1]).toHaveTextContent('Hawks');
        expect(dataRows[2]).toHaveTextContent('Lions');
        expect(dataRows[3]).toHaveTextContent('Tigers');
        expect(dataRows[4]).toHaveTextContent('Bears');
      });

      it('displays position numbers and medals for top 3', async () => {
        this.render();

        // Check position numbers
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();

        // Check medals for top 3
        expect(screen.getByText('🥇')).toBeInTheDocument(); // Gold
        expect(screen.getByText('🥈')).toBeInTheDocument(); // Silver
        expect(screen.getByText('🥉')).toBeInTheDocument(); // Bronze
      });

      it('shows empty state with teams when no standings data', async () => {
        this.render({ standings: [], teams: mockTeams });

        // Should show teams with 0 stats
        expect(screen.getByText('Eagles')).toBeInTheDocument();
        expect(screen.getByText('Hawks')).toBeInTheDocument();
        expect(screen.getByText('Lions')).toBeInTheDocument();

        // All stats should be 0
        const zeroValues = screen.getAllByText('0');
        expect(zeroValues.length).toBeGreaterThan(0);
      });
    });
  }

  async testLoadingStates(): Promise<void> {
    describe('Loading States', () => {
      it('shows loading spinner when loading is true', async () => {
        this.render({ loading: true });

        expect(screen.getByText(/loading standings/i)).toBeInTheDocument();
        expect(this.container.querySelector('.animate-spin')).toBeInTheDocument();
      });

      it('hides loading state when data loads', async () => {
        this.render({ loading: false });

        expect(screen.queryByText(/loading standings/i)).not.toBeInTheDocument();
        expect(this.container.querySelector('.animate-spin')).not.toBeInTheDocument();
      });
    });
  }

  async testAccessibility(): Promise<void> {
    describe('Accessibility', () => {
      it('passes accessibility audit', async () => {
        this.render();
        await expectAccessible(this.container, this.user);
      });

      it('has proper table structure and headers', async () => {
        this.render();

        // Check for table structure
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();

        // Check for column headers
        expect(screen.getByRole('columnheader', { name: /#/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /team/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /points/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /mp/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /w/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /l/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /d/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /gw/i })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: /gl/i })).toBeInTheDocument();
      });

      it('has proper heading hierarchy', async () => {
        this.render();

        // Check main heading
        expect(
          screen.getByRole('heading', { name: /league standings/i, level: 2 })
        ).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /legend/i, level: 4 })).toBeInTheDocument();
      });

      it('provides accessible legend for abbreviations', async () => {
        this.render();

        // Check that legend explains abbreviations
        expect(screen.getByText(/p = matches played/i)).toBeInTheDocument();
        expect(screen.getByText(/w = wins/i)).toBeInTheDocument();
        expect(screen.getByText(/l = losses/i)).toBeInTheDocument();
        expect(screen.getByText(/d = draws/i)).toBeInTheDocument();
        expect(screen.getByText(/pts = points/i)).toBeInTheDocument();
      });

      it('uses appropriate color coding for different statistics', async () => {
        this.render();

        // Check that wins are highlighted in green
        const winsElements = this.container.querySelectorAll('.text-green-600');
        expect(winsElements.length).toBeGreaterThan(0);

        // Check that top teams have special styling
        const topTeamElements = this.container.querySelectorAll(
          '.bg-gradient-to-r.from-yellow-50.to-orange-50'
        );
        expect(topTeamElements.length).toBe(3); // Top 3 teams
      });
    });
  }

  async testErrorStates(): Promise<void> {
    describe('Error States', () => {
      it('handles empty standings gracefully', async () => {
        this.render({ standings: [], teams: [] });

        // Should still render table structure
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();

        // Should show headers
        expect(screen.getByRole('columnheader', { name: /team/i })).toBeInTheDocument();
      });

      it('handles missing team data gracefully', async () => {
        const incompleteStandings = [
          {
            teamId: 'team-1',
            teamName: 'Eagles',
            matchesPlayed: 5,
            wins: 3,
            losses: 2,
            draws: 0,
            points: 9,
            gamesWon: 20,
            gamesLost: 15,
          },
        ];

        this.render({ standings: incompleteStandings });

        expect(screen.getByText('Eagles')).toBeInTheDocument();
        expect(screen.getByText('9')).toBeInTheDocument(); // Points
      });
    });
  }

  protected render(props?: Partial<typeof this.defaultProps>, options?: any) {
    const finalProps = { ...this.defaultProps, ...props };

    this.renderResult = renderWithProviders(<StandingsTable {...finalProps} />, options);
    return this.renderResult;
  }
}

// Additional specific tests
describe('StandingsTable - Sorting Logic', () => {
  it('sorts by points first, then goal difference, then goals scored', async () => {
    const tiedStandings = [
      {
        teamId: 'team-1',
        teamName: 'Team A',
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        draws: 0,
        points: 9,
        gamesWon: 20,
        gamesLost: 10, // Goal difference: +10
      },
      {
        teamId: 'team-2',
        teamName: 'Team B',
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        draws: 0,
        points: 9,
        gamesWon: 18,
        gamesLost: 12, // Goal difference: +6
      },
      {
        teamId: 'team-3',
        teamName: 'Team C',
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        draws: 0,
        points: 9,
        gamesWon: 15,
        gamesLost: 5, // Goal difference: +10, but fewer goals scored
      },
    ];

    renderWithProviders(<StandingsTable standings={tiedStandings} />);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1); // Skip header row

    // Team A should be first (better goal difference and more goals scored)
    expect(dataRows[0]).toHaveTextContent('Team A');
    // Team C should be second (same goal difference as A, but fewer goals scored)
    expect(dataRows[1]).toHaveTextContent('Team C');
    // Team B should be third (lower goal difference)
    expect(dataRows[2]).toHaveTextContent('Team B');
  });

  it('sorts alphabetically by team name when all stats are equal', async () => {
    const equalStandings = [
      {
        teamId: 'team-1',
        teamName: 'Zebras',
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        draws: 0,
        points: 9,
        gamesWon: 15,
        gamesLost: 10,
      },
      {
        teamId: 'team-2',
        teamName: 'Alphas',
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        draws: 0,
        points: 9,
        gamesWon: 15,
        gamesLost: 10,
      },
    ];

    renderWithProviders(<StandingsTable standings={equalStandings} />);

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1); // Skip header row

    // Alphas should come before Zebras alphabetically
    expect(dataRows[0]).toHaveTextContent('Alphas');
    expect(dataRows[1]).toHaveTextContent('Zebras');
  });
});

describe('StandingsTable - Visual Design', () => {
  it('applies special styling to top 3 teams', async () => {
    renderWithProviders(<StandingsTable standings={mockStandings} />);

    // Check that top 3 teams have gradient background
    const topTeamRows = screen.getAllByRole('row').slice(1, 4); // First 3 data rows

    topTeamRows.forEach(row => {
      expect(row).toHaveClass('bg-gradient-to-r', 'from-yellow-50', 'to-orange-50');
    });

    // Check that 4th and 5th teams don't have special styling
    const regularRows = screen.getAllByRole('row').slice(4, 6);
    regularRows.forEach(row => {
      expect(row).not.toHaveClass('bg-gradient-to-r');
    });
  });

  it('uses different colors for position numbers', async () => {
    renderWithProviders(<StandingsTable standings={mockStandings} />);

    // Check position number colors
    const positionElements = screen.getAllByText(/^[1-5]$/);

    // First position should be yellow (gold)
    expect(positionElements[0]).toHaveClass('text-yellow-600');
    // Second position should be gray (silver)
    expect(positionElements[1]).toHaveClass('text-gray-600');
    // Third position should be orange (bronze)
    expect(positionElements[2]).toHaveClass('text-orange-600');
    // Fourth and fifth should be regular gray
    expect(positionElements[3]).toHaveClass('text-gray-900');
    expect(positionElements[4]).toHaveClass('text-gray-900');
  });

  it('highlights wins in green', async () => {
    renderWithProviders(<StandingsTable standings={mockStandings} />);

    // All win numbers should be green
    const winElements = this.container.querySelectorAll('td .text-green-600');
    expect(winElements.length).toBe(mockStandings.length);
  });

  it('shows responsive table with horizontal scroll', async () => {
    renderWithProviders(<StandingsTable standings={mockStandings} />);

    // Check for overflow container
    const overflowContainer = this.container.querySelector('.overflow-x-auto');
    expect(overflowContainer).toBeInTheDocument();

    // Check for minimum width table
    const table = screen.getByRole('table');
    expect(table).toHaveClass('min-w-full');
  });
});

// Run the test suite
const standingsTableTestSuite = new StandingsTableTestSuite();
standingsTableTestSuite.runAllTests();
