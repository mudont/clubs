import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { GET_MESSAGES, MESSAGE_SUBSCRIPTION, SEND_MESSAGE } from 'graphql/Message';

import { renderWithProviders } from '../../../__tests__/utils/test-utils';
import ChatRoom from '../ChatRoom';

// Mock scrollIntoView
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

const mockMessages = [
  {
    id: '1',
    content: 'Hello everyone!',
    createdAt: new Date().toISOString(),
    user: {
      id: '1',
      username: 'testuser',
    },
  },
  {
    id: '2',
    content: 'How is everyone doing?',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    user: {
      id: '2',
      username: 'otheruser',
    },
  },
];

const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
};

const mocks = [
  {
    request: {
      query: GET_MESSAGES,
      variables: { groupId: 'group1' },
    },
    result: {
      data: {
        messages: mockMessages,
      },
    },
  },
  {
    request: {
      query: SEND_MESSAGE,
      variables: {
        input: {
          groupId: 'group1',
          content: 'Test message',
        },
      },
    },
    result: {
      data: {
        sendMessage: {
          id: '3',
          content: 'Test message',
          createdAt: new Date().toISOString(),
          user: mockUser,
        },
      },
    },
  },
];

const subscriptionMocks = [
  {
    request: {
      query: MESSAGE_SUBSCRIPTION,
      variables: { groupId: 'group1' },
    },
    result: {
      data: {
        messageAdded: {
          id: '4',
          content: 'New subscription message',
          createdAt: new Date().toISOString(),
          user: {
            id: '3',
            username: 'newuser',
          },
        },
      },
    },
  },
];

describe('ChatRoom', () => {
  const defaultProps = {
    groupId: 'group1',
  };

  it('renders chat room with header', async () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    expect(screen.getByRole('heading', { name: 'Group Chat' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '🔄 Refresh' })).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    expect(screen.getByText('Loading messages...')).toBeInTheDocument();
  });

  it('displays messages after loading', async () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
      expect(screen.getByText('How is everyone doing?')).toBeInTheDocument();
    });

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('otheruser')).toBeInTheDocument();
  });

  it('shows empty state when no messages', async () => {
    const emptyMocks = [
      {
        request: {
          query: GET_MESSAGES,
          variables: { groupId: 'group1' },
        },
        result: {
          data: {
            messages: [],
          },
        },
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={emptyMocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByText('Start the conversation!')).toBeInTheDocument();
    });
  });

  it('renders message form when user is authenticated', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    expect(screen.getByText('0/500')).toBeInTheDocument();
  });

  it('shows login prompt when user is not authenticated', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: null, isAuthenticated: false },
        },
      }
    );

    expect(screen.getByText('Please log in to participate in the chat')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Type your message...')).not.toBeInTheDocument();
  });

  it('updates character counter when typing', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(screen.getByText('5/500')).toBeInTheDocument();
  });

  it('disables send button when message is empty', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const sendButton = screen.getByRole('button', { name: 'Send' });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when message has content', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(sendButton).not.toBeDisabled();
  });

  it('sends message when form is submitted', async () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });

  it('prevents sending empty or whitespace-only messages', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: '   ' } });
    expect(sendButton).toBeDisabled();
  });

  it('distinguishes between own and other messages', async () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const messages = document.querySelectorAll('.message');
      expect(messages[0]).toHaveClass('own'); // testuser's message
      expect(messages[1]).toHaveClass('other'); // otheruser's message
    });
  });

  it('formats timestamps correctly', async () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    await waitFor(() => {
      const timestamps = document.querySelectorAll('.timestamp');
      expect(timestamps).toHaveLength(2);
      // Should show time format for recent messages
      expect(timestamps[0].textContent).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  it('handles refresh button click', async () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const refreshButton = screen.getByRole('button', { name: '🔄 Refresh' });
    fireEvent.click(refreshButton);

    // Should trigger a refetch (tested by ensuring no errors)
    expect(refreshButton).toBeInTheDocument();
  });

  it('enforces maximum message length', () => {
    renderWithProviders(
      <MockedProvider mocks={mocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const input = screen.getByPlaceholderText('Type your message...');
    expect(input).toHaveAttribute('maxLength', '500');
  });

  it('displays error message when send fails', async () => {
    const errorMocks = [
      {
        request: {
          query: GET_MESSAGES,
          variables: { groupId: 'group1' },
        },
        result: {
          data: {
            messages: [],
          },
        },
      },
      {
        request: {
          query: SEND_MESSAGE,
          variables: {
            input: {
              groupId: 'group1',
              content: 'Test message',
            },
          },
        },
        error: new Error('Network error'),
      },
    ];

    renderWithProviders(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <ChatRoom {...defaultProps} />
      </MockedProvider>,
      {
        preloadedState: {
          auth: { user: mockUser, isAuthenticated: true },
        },
      }
    );

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});
