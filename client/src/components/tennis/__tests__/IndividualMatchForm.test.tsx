import { MockedProvider } from '@apollo/client/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectAccessible } from '../../../__tests__/utils/accessibility-helpers';
import { FormComponentTestSuite } from '../../../__tests__/utils/base-component-tests';
import { createTestUser } from '../../../__tests__/utils/mock-factories';
import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import {
  CREATE_INDIVIDUAL_DOUBLES_MATCH,
  CREATE_INDIVIDUAL_SINGLES_MATCH,
  UPDATE_INDIVIDUAL_DOUBLES_MATCH,
  UPDATE_INDIVIDUAL_SINGLES_MATCH,
} from '../graphql';

import IndividualMatchForm from '../IndividualMatchForm';

// Test data
const mockUsers = [
  createTestUser({
    id: 'user-1',
    username: 'player1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  }),
  createTestUser({
    id: 'user-2',
    username: 'player2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
  }),
  createTestUser({
    id: 'user-3',
    username: 'player3',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@example.com',
  }),
  createTestUser({
    id: 'user-4',
    username: 'player4',
    firstName: 'Alice',
    lastName: 'Wilson',
    email: 'alice@example.com',
  }),
];

const mockTeamMatch = {
  id: 'team-match-1',
  matchDate: '2024-01-15T00:00:00.000Z',
  homeTeam: {
    group: {
      name: 'Home Team',
      members: [{ user: mockUsers[0] }, { user: mockUsers[1] }],
    },
  },
  awayTeam: {
    group: {
      name: 'Away Team',
      members: [{ user: mockUsers[2] }, { user: mockUsers[3] }],
    },
  },
};

const mockSinglesMatch = {
  id: 'singles-1',
  player1Id: 'user-1',
  player2Id: 'user-3',
  matchDate: '2024-01-15T00:00:00.000Z',
  order: 1,
  score: '6-4, 6-2',
  winner: 'HOME',
  teamMatchId: 'team-match-1',
};

const mockDoublesMatch = {
  id: 'doubles-1',
  team1Player1Id: 'user-1',
  team1Player2Id: 'user-2',
  team2Player1Id: 'user-3',
  team2Player2Id: 'user-4',
  matchDate: '2024-01-15T00:00:00.000Z',
  order: 1,
  score: '6-3, 7-5',
  winner: 'HOME',
  teamMatchId: 'team-match-1',
};

// GraphQL mocks
const createMocks = (matchType: 'singles' | 'doubles', isEdit = false) => [
  {
    request: {
      query:
        matchType === 'singles' ? CREATE_INDIVIDUAL_SINGLES_MATCH : CREATE_INDIVIDUAL_DOUBLES_MATCH,
      variables: {
        leagueId: 'league-1',
        input: expect.any(Object),
      },
    },
    result: {
      data: {
        [matchType === 'singles' ? 'createIndividualSinglesMatch' : 'createIndividualDoublesMatch']:
          {
            id: `new-${matchType}-1`,
            order: 1,
          },
      },
    },
  },
  {
    request: {
      query:
        matchType === 'singles' ? UPDATE_INDIVIDUAL_SINGLES_MATCH : UPDATE_INDIVIDUAL_DOUBLES_MATCH,
      variables: {
        id: matchType === 'singles' ? 'singles-1' : 'doubles-1',
        input: expect.any(Object),
      },
    },
    result: {
      data: {
        [matchType === 'singles' ? 'updateIndividualSinglesMatch' : 'updateIndividualDoublesMatch']:
          {
            id: matchType === 'singles' ? 'singles-1' : 'doubles-1',
            order: 1,
          },
      },
    },
  },
];

// Test suite for singles matches
class SinglesMatchFormTestSuite extends FormComponentTestSuite<{
  matchType: 'singles' | 'doubles';
  teamMatch: any;
  leagueId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialOrder?: number;
  editingMatch?: any;
}> {
  component = IndividualMatchForm;
  defaultProps = {
    matchType: 'singles' as const,
    teamMatch: mockTeamMatch,
    leagueId: 'league-1',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
    initialOrder: 1,
  };
  displayName = 'IndividualMatchForm (Singles)';

  async testValidation(): Promise<void> {
    describe('Singles Form Validation', () => {
      it('shows validation errors for required fields', async () => {
        this.render();

        // Try to submit without filling required fields
        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
        });
      });

      it('validates that players cannot be the same', async () => {
        this.render();

        // Select same player for both positions
        const homePlayerSelect = screen.getByLabelText(/home player/i);
        const awayPlayerSelect = screen.getByLabelText(/away player/i);

        await this.user.selectOptions(homePlayerSelect, 'user-1');
        await this.user.selectOptions(awayPlayerSelect, 'user-1');

        // Fill other required fields
        await this.helpers.form.fillField('Match Date', '2024-01-15');

        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(screen.getByText(/home and away players cannot be the same/i)).toBeInTheDocument();
        });
      });
    });
  }

  async testSubmission(): Promise<void> {
    describe('Singles Form Submission', () => {
      it('creates new singles match successfully', async () => {
        const onSuccess = jest.fn();
        this.render({ onSuccess });

        // Fill form
        const homePlayerSelect = screen.getByLabelText(/home player/i);
        const awayPlayerSelect = screen.getByLabelText(/away player/i);

        await this.user.selectOptions(homePlayerSelect, 'user-1');
        await this.user.selectOptions(awayPlayerSelect, 'user-3');
        await this.helpers.form.fillField('Match Date', '2024-01-15');
        await this.helpers.form.fillField('Match Order', '1');

        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalled();
        });
      });

      it('updates existing singles match successfully', async () => {
        const onSuccess = jest.fn();
        this.render({ editingMatch: mockSinglesMatch, onSuccess });

        // Update score
        await this.helpers.form.fillField('Score', '6-0, 6-1');

        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalled();
        });
      });
    });
  }

  async testFieldInteractions(): Promise<void> {
    describe('Singles Field Interactions', () => {
      it('pre-fills form when editing existing match', async () => {
        this.render({ editingMatch: mockSinglesMatch });

        // Check that form is pre-filled
        expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('6-4, 6-2')).toBeInTheDocument();
      });

      it('allows winner selection', async () => {
        this.render();

        const winnerSelect = screen.getByLabelText(/match winner/i);
        await this.user.selectOptions(winnerSelect, 'HOME');

        expect(winnerSelect).toHaveValue('HOME');
      });

      it('calls onCancel when cancel button is clicked', async () => {
        const onCancel = jest.fn();
        this.render({ onCancel });

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await this.user.click(cancelButton);

        expect(onCancel).toHaveBeenCalled();
      });
    });
  }

  async testAccessibility(): Promise<void> {
    describe('Singles Form Accessibility', () => {
      it('passes accessibility audit', async () => {
        this.render();
        await expectAccessible(this.container, this.user);
      });

      it('has proper form labels and ARIA attributes', async () => {
        this.render();

        // Check for proper labels
        expect(screen.getByLabelText(/home player/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/away player/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/match date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/match order/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/match score/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/match winner/i)).toBeInTheDocument();

        // Check for proper ARIA labels on buttons
        expect(screen.getByLabelText(/create singles match/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cancel match creation/i)).toBeInTheDocument();
      });

      it('announces validation errors to screen readers', async () => {
        this.render();

        await this.helpers.form.submitForm();

        await waitFor(() => {
          const errorMessage = screen.getByText(/please fill in all required fields/i);
          expect(errorMessage).toBeInTheDocument();
          expect(errorMessage.closest('[role="alert"]')).toBeInTheDocument();
        });
      });
    });
  }

  protected render(props?: Partial<typeof this.defaultProps>, options?: any) {
    const finalProps = { ...this.defaultProps, ...props };
    const mocks = options?.mocks || createMocks('singles', !!finalProps.editingMatch);

    this.renderResult = renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <IndividualMatchForm {...finalProps} />
      </MockedProvider>,
      options
    );
    return this.renderResult;
  }
}

// Test suite for doubles matches
class DoublesMatchFormTestSuite extends FormComponentTestSuite<{
  matchType: 'singles' | 'doubles';
  teamMatch: any;
  leagueId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialOrder?: number;
  editingMatch?: any;
}> {
  component = IndividualMatchForm;
  defaultProps = {
    matchType: 'doubles' as const,
    teamMatch: mockTeamMatch,
    leagueId: 'league-1',
    onSuccess: jest.fn(),
    onCancel: jest.fn(),
    initialOrder: 1,
  };
  displayName = 'IndividualMatchForm (Doubles)';

  async testValidation(): Promise<void> {
    describe('Doubles Form Validation', () => {
      it('shows validation errors for required fields', async () => {
        this.render();

        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
        });
      });

      it('validates that all players must be different', async () => {
        this.render();

        // Select same player for multiple positions
        const homePlayer1Select = screen.getByLabelText(/home player 1/i);
        const homePlayer2Select = screen.getByLabelText(/home player 2/i);

        await this.user.selectOptions(homePlayer1Select, 'user-1');
        await this.user.selectOptions(homePlayer2Select, 'user-1');

        // Fill other required fields
        const awayPlayer1Select = screen.getByLabelText(/away player 1/i);
        const awayPlayer2Select = screen.getByLabelText(/away player 2/i);

        await this.user.selectOptions(awayPlayer1Select, 'user-3');
        await this.user.selectOptions(awayPlayer2Select, 'user-4');
        await this.helpers.form.fillField('Match Date', '2024-01-15');

        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(screen.getByText(/all players must be different/i)).toBeInTheDocument();
        });
      });
    });
  }

  async testSubmission(): Promise<void> {
    describe('Doubles Form Submission', () => {
      it('creates new doubles match successfully', async () => {
        const onSuccess = jest.fn();
        this.render({ onSuccess });

        // Fill form
        const homePlayer1Select = screen.getByLabelText(/home player 1/i);
        const homePlayer2Select = screen.getByLabelText(/home player 2/i);
        const awayPlayer1Select = screen.getByLabelText(/away player 1/i);
        const awayPlayer2Select = screen.getByLabelText(/away player 2/i);

        await this.user.selectOptions(homePlayer1Select, 'user-1');
        await this.user.selectOptions(homePlayer2Select, 'user-2');
        await this.user.selectOptions(awayPlayer1Select, 'user-3');
        await this.user.selectOptions(awayPlayer2Select, 'user-4');
        await this.helpers.form.fillField('Match Date', '2024-01-15');

        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalled();
        });
      });

      it('updates existing doubles match successfully', async () => {
        const onSuccess = jest.fn();
        this.render({ editingMatch: mockDoublesMatch, onSuccess });

        // Update score
        await this.helpers.form.fillField('Score', '7-6, 6-4');

        await this.helpers.form.submitForm();

        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalled();
        });
      });
    });
  }

  async testFieldInteractions(): Promise<void> {
    describe('Doubles Field Interactions', () => {
      it('pre-fills form when editing existing match', async () => {
        this.render({ editingMatch: mockDoublesMatch });

        // Check that form is pre-filled
        expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('6-3, 7-5')).toBeInTheDocument();
      });

      it('allows all four player selections', async () => {
        this.render();

        const homePlayer1Select = screen.getByLabelText(/home player 1/i);
        const homePlayer2Select = screen.getByLabelText(/home player 2/i);
        const awayPlayer1Select = screen.getByLabelText(/away player 1/i);
        const awayPlayer2Select = screen.getByLabelText(/away player 2/i);

        await this.user.selectOptions(homePlayer1Select, 'user-1');
        await this.user.selectOptions(homePlayer2Select, 'user-2');
        await this.user.selectOptions(awayPlayer1Select, 'user-3');
        await this.user.selectOptions(awayPlayer2Select, 'user-4');

        expect(homePlayer1Select).toHaveValue('user-1');
        expect(homePlayer2Select).toHaveValue('user-2');
        expect(awayPlayer1Select).toHaveValue('user-3');
        expect(awayPlayer2Select).toHaveValue('user-4');
      });
    });
  }

  async testAccessibility(): Promise<void> {
    describe('Doubles Form Accessibility', () => {
      it('passes accessibility audit', async () => {
        this.render();
        await expectAccessible(this.container, this.user);
      });

      it('has proper form labels for all four players', async () => {
        this.render();

        // Check for proper labels for all players
        expect(screen.getByLabelText(/home player 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/home player 2/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/away player 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/away player 2/i)).toBeInTheDocument();
      });
    });
  }

  protected render(props?: Partial<typeof this.defaultProps>, options?: any) {
    const finalProps = { ...this.defaultProps, ...props };
    const mocks = options?.mocks || createMocks('doubles', !!finalProps.editingMatch);

    this.renderResult = renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <IndividualMatchForm {...finalProps} />
      </MockedProvider>,
      options
    );
    return this.renderResult;
  }
}

// Additional specific tests
describe('IndividualMatchForm - Match Type Switching', () => {
  it('shows different form fields for singles vs doubles', async () => {
    const mocks = createMocks('singles');

    // Test singles form
    const { rerender } = renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <IndividualMatchForm
          matchType="singles"
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </MockedProvider>
    );

    expect(screen.getByText(/create new singles match/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/home player/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/away player/i)).toBeInTheDocument();

    // Test doubles form
    const doublesMocks = createMocks('doubles');
    rerender(
      <MockedProvider mocks={doublesMocks} addTypename={false}>
        <IndividualMatchForm
          matchType="doubles"
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </MockedProvider>
    );

    expect(screen.getByText(/create new doubles match/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/home player 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/home player 2/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/away player 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/away player 2/i)).toBeInTheDocument();
  });

  it('handles loading states during submission', async () => {
    const mocks = [
      {
        request: {
          query: CREATE_INDIVIDUAL_SINGLES_MATCH,
          variables: {
            leagueId: 'league-1',
            input: expect.any(Object),
          },
        },
        result: {
          data: {
            createIndividualSinglesMatch: {
              id: 'new-singles-1',
              order: 1,
            },
          },
        },
        delay: 1000, // Simulate slow response
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <IndividualMatchForm
          matchType="singles"
          teamMatch={mockTeamMatch}
          leagueId="league-1"
          onSuccess={jest.fn()}
          onCancel={jest.fn()}
        />
      </MockedProvider>
    );

    // Fill and submit form
    const homePlayerSelect = screen.getByLabelText(/home player/i);
    const awayPlayerSelect = screen.getByLabelText(/away player/i);

    await userEvent.setup().selectOptions(homePlayerSelect, 'user-1');
    await userEvent.setup().selectOptions(awayPlayerSelect, 'user-3');
    await userEvent.setup().type(screen.getByLabelText(/match date/i), '2024-01-15');

    const submitButton = screen.getByRole('button', { name: /create singles match/i });
    await userEvent.setup().click(submitButton);

    // Check loading state
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});

// Run the test suites
const singlesTestSuite = new SinglesMatchFormTestSuite();
const doublesTestSuite = new DoublesMatchFormTestSuite();

singlesTestSuite.runAllTests();
doublesTestSuite.runAllTests();
