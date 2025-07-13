import { gql, useMutation, useQuery, useSubscription } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import './ChatRoom.css';

const GET_MESSAGES = gql`
  query GetMessages($groupId: ID!) {
    messages(groupId: $groupId) {
      id
      content
      createdAt
      user {
        id
        username
        email
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      createdAt
      user {
        id
        username
        email
      }
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded($groupId: ID!) {
    messageAdded(groupId: $groupId) {
      id
      content
      createdAt
      user {
        id
        username
        email
      }
    }
  }
`;

interface ChatRoomProps {
  groupId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ groupId }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const { data, loading: messagesLoading, refetch } = useQuery(GET_MESSAGES, {
    variables: { groupId },
    fetchPolicy: 'cache-and-network',
  });

  const [messages, setMessages] = useState<any[]>([]);

  const [sendMessage] = useMutation(SEND_MESSAGE);

  // Subscribe to new messages
  const { data: subscriptionData } = useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { groupId },
    skip: !user,
  });

  // Update messages when query loads
  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages.slice().reverse());
    }
  }, [data]);

  // Append new message from subscription
  useEffect(() => {
    if (subscriptionData?.messageAdded) {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === subscriptionData.messageAdded.id)) return prev;
        return [...prev, subscriptionData.messageAdded];
      });
    }
  }, [subscriptionData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setLoading(true);
    setError('');

    try {
      await sendMessage({
        variables: {
          input: {
            groupId,
            content: message.trim(),
          },
        },
      });

      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isOwnMessage = (messageUserId: string) => {
    return messageUserId === user?.id;
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <h2>Group Chat</h2>
        <button onClick={() => refetch()} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {messagesLoading ? (
          <div className="loading">Loading messages...</div>
        ) : (
          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <h3>No messages yet</h3>
                <p>Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`message ${isOwnMessage(msg.user.id) ? 'own' : 'other'}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <span className="username">{msg.user.username}</span>
                      <span className="timestamp">{formatTime(msg.createdAt)}</span>
                    </div>
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {user && (
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="input-group">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="btn-send"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div className="message-counter">
            {message.length}/500
          </div>
        </form>
      )}

      {!user && (
        <div className="login-prompt">
          <p>Please log in to participate in the chat</p>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
