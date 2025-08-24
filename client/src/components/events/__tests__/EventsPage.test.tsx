import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { CREATE_RSVP, GET_USER_PENDING_EVENTS, UPDATE_RSVP } from 'graphql/Event';
import { BrowserRouter } from 'react-router-dom';

import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import EventsPage from '../EventsPage';

const mockUser = {
  id: 'user1',
  username: 'testuser',
  email: 'test@example.com',
};

const mockEvents = [
  {
    id: 'event1',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    description: 'Tennis Match: Team A vs Team B',
    group: {
      id: 'group1',
      name: 'Tennis Club',
    },
    rsvps: [
      {
        id: 'rsvp1',
        status: 'AVAILABLE',
        note: 'Looking forward to it!',
        user: {
          id: 'user1',
          username: 'testuser',
        },
      },
      {
        id: 'rsvp2',
        status: 'NOT_AVAILABLE',
        note: null,
        user: {
          id: 'user2',
          username: 'otheruser',
        },
      },
    ],
  },
  {
    id: 'event2',
    date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    description: 'Group Meeting',
    group: {
      id: 'group2',
      name: 'Book Club',
    },
    rsvps: [],
  },
];

const mocks = [
  {
    request: {
      query: GET_USER_PENDING_EVENTS,
    },
    result: {
      data: {
        userPendingEvents: mockEvents,
      },
    },
  },
  {
    request: {
      query: CREATE_RSVP,
      variables: {
        input: {
          eventId: 'event2',
          status: 'AVAILABLE',
          note: undefined,
        },
      },
    },
    result: {
      data: {
        createRSVP: {
          id: 'rsvp3',
          status: 'AVAILABLE',
          note: null,
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_RSVP,
      variables: {
        id: 'rsvp1',
        status: 'MAYBE',
        note: 'Not sure yet',
      },
    },
    result: {
      data: {
        updateRSVP: {
          id: 'rsvp1',
          status: 'MAYBE',
          note: 'Not sure yet',
        },
      },
    },
  },
];

const emptyMocks = [
  {
    request: {
      query: GET_USER_PENDING_EVENTS,
    },
    result: {
      data: {
        userPendingEvents: [],
      },
    },
  },
];

describe('EventsPage', () => {
  it('renders loading state initially', () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });

  it('renders empty state when no events', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={emptyMocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('No Upcoming Events')).toBeInTheDocument();
      expect(
        screen.getByText("You don't have any upcoming events in your groups.")
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Dashboard' })).toBeInTheDocument();
    });
  });

  it('renders events list when events exist', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      expect(screen.getByText('Book Club')).toBeInTheDocument();
    });
  });

  it('displays correct RSVP status for user', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      // First event should show "Available" status for the user
      const statusElements = screen.getAllByText('Available');
      expect(statusElements.length).toBeGreaterThan(0);

      // Second event should show "Not RSVPed" status
      expect(screen.getByText('Not RSVPed')).toBeInTheDocument();
    });
  });

  it('displays RSVP counts correctly', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Available: 1')).toBeInTheDocument();
      expect(screen.getByText('Not Available: 1')).toBeInTheDocument();
      expect(screen.getByText('Maybe: 0')).toBeInTheDocument();
      expect(screen.getByText('Only if Needed: 0')).toBeInTheDocument();
    });
  });

  it('parses tennis match teams correctly', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      expect(screen.getByText('Home:')).toBeInTheDocument();
      expect(screen.getByText('Team A')).toBeInTheDocument();
      expect(screen.getByText('Away:')).toBeInTheDocument();
      expect(screen.getByText('Team B')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      // Should show formatted date with emoji
      const dateElements = screen.getAllByText(/📅/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  it('shows and hides RSVP accordion', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const showButton = screen.getAllByText('Show RSVPs')[0];
      fireEvent.click(showButton);
    });

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('otheruser')).toBeInTheDocument();
      expect(screen.getByText('Looking forward to it!')).toBeInTheDocument();
    });

    const hideButton = screen.getByText('Hide RSVPs');
    fireEvent.click(hideButton);

    await waitFor(() => {
      expect(screen.queryByText('Looking forward to it!')).not.toBeInTheDocument();
    });
  });

  it('opens RSVP form when RSVP Now is clicked', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const rsvpButton = screen.getByText('RSVP Now');
      fireEvent.click(rsvpButton);
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Add a note (optional)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit RSVP' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });
  });

  it('creates new RSVP when submitted', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const rsvpButton = screen.getByText('RSVP Now');
      fireEvent.click(rsvpButton);
    });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Submit RSVP' });
      fireEvent.click(submitButton);
    });

    // Should close the form after submission
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Add a note (optional)')).not.toBeInTheDocument();
    });
  });

  it('updates existing RSVP when submitted', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const updateButton = screen.getByText('Update RSVP');
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      // Change status to Maybe
      const maybeRadio = screen.getByLabelText('Maybe');
      fireEvent.click(maybeRadio);

      // Add a note
      const noteTextarea = screen.getByPlaceholderText('Add a note (optional)');
      fireEvent.change(noteTextarea, { target: { value: 'Not sure yet' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: 'Submit RSVP' });
      fireEvent.click(submitButton);
    });

    // Should close the form after submission
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Add a note (optional)')).not.toBeInTheDocument();
    });
  });

  it('cancels RSVP form when cancel is clicked', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const rsvpButton = screen.getByText('RSVP Now');
      fireEvent.click(rsvpButton);
    });

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Add a note (optional)')).not.toBeInTheDocument();
    });
  });

  it('handles radio button selection correctly', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const rsvpButton = screen.getByText('RSVP Now');
      fireEvent.click(rsvpButton);
    });

    await waitFor(() => {
      const availableRadio = screen.getByLabelText('Available');
      const notAvailableRadio = screen.getByLabelText('Not Available');
      const maybeRadio = screen.getByLabelText('Maybe');
      const onlyIfNeededRadio = screen.getByLabelText('Only if Needed');

      // Available should be selected by default
      expect(availableRadio).toBeChecked();

      // Select different options
      fireEvent.click(notAvailableRadio);
      expect(notAvailableRadio).toBeChecked();
      expect(availableRadio).not.toBeChecked();

      fireEvent.click(maybeRadio);
      expect(maybeRadio).toBeChecked();
      expect(notAvailableRadio).not.toBeChecked();

      fireEvent.click(onlyIfNeededRadio);
      expect(onlyIfNeededRadio).toBeChecked();
      expect(maybeRadio).not.toBeChecked();
    });
  });

  it('handles note input correctly', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const rsvpButton = screen.getByText('RSVP Now');
      fireEvent.click(rsvpButton);
    });

    await waitFor(() => {
      const noteTextarea = screen.getByPlaceholderText('Add a note (optional)');
      fireEvent.change(noteTextarea, { target: { value: 'Test note' } });
      expect(noteTextarea).toHaveValue('Test note');
    });
  });

  it('has proper accessibility attributes', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const accordionButtons = screen.getAllByText('Show RSVPs');
      const firstButton = accordionButtons[0];

      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
      expect(firstButton).toHaveAttribute('aria-controls');

      fireEvent.click(firstButton);
    });

    await waitFor(() => {
      const hideButton = screen.getByText('Hide RSVPs');
      expect(hideButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  it('displays correct status colors', async () => {
    renderWithProviders(
      <BrowserRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <EventsPage />
        </MockedProvider>
      </BrowserRouter>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const statusElements = document.querySelectorAll('.event-status');
      expect(statusElements[0]).toHaveClass('status-available');
      expect(statusElements[1]).toHaveClass('status-pending');
    });
  });
});
