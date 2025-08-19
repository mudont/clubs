import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import TeamMatchList from '../TeamMatchList';
import { GET_TENNIS_LEAGUE } from '../graphql';

const mockLeagueData = {
  tennisLeague: {
    id: '1',
    name: 'Test League',
    teams: [
      {
        id: '1',
        group: { id: '1', name: 'Zebra Team' },
      },
      {
        id: '2',
        group: { id: '2', name: 'Alpha Team' },
      },
      {
        id: '3',
        group: { id: '3', name: 'Beta Team' },
      },
    ],
  },
};

const mocks = [
  {
    request: {
      query: GET_TENNIS_LEAGUE,
      variables: { id: '1' },
    },
    result: {
      data: mockLeagueData,
    },
  },
];

describe('TeamMatchList Sorting', () => {
  it('should sort teams alphabetically in dropdowns', async () => {
    render(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <TeamMatchList leagueId="1" matches={[]} />
        </MockedProvider>
      </BrowserRouter>
    );

    // Click Add Match to show the form
    const addButton = screen.getByText('Add Match');
    addButton.click();

    // Wait for the form to appear and data to load
    await screen.findByText('Create New Match');

    // Check that teams are sorted alphabetically in both dropdowns
    const homeTeamOptions = screen.getAllByText('Alpha Team');
    const betaTeamOptions = screen.getAllByText('Beta Team');
    const zebraTeamOptions = screen.getAllByText('Zebra Team');

    // Should have Alpha Team, Beta Team, Zebra Team in that order
    expect(homeTeamOptions).toHaveLength(2); // One in each dropdown
    expect(betaTeamOptions).toHaveLength(2);
    expect(zebraTeamOptions).toHaveLength(2);
  });
});
