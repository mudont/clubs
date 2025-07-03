import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import './EventList.css';

const GET_EVENTS = gql`
  query GetEvents($clubId: ID!) {
    events(clubId: $clubId) {
      id
      date
      description
      createdBy {
        id
        username
      }
      rsvps {
        id
        status
        note
        user {
          id
          username
        }
      }
    }
  }
`;

const CREATE_EVENT = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      id
      date
      description
      createdBy {
        id
        username
      }
    }
  }
`;

const CREATE_RSVP = gql`
  mutation CreateRSVP($input: CreateRSVPInput!) {
    createRSVP(input: $input) {
      id
      status
      note
      event {
        id
      }
    }
  }
`;

interface EventListProps {
  clubId: string;
}

const EventList: React.FC<EventListProps> = ({ clubId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);
  const { data, loading: eventsLoading, refetch } = useQuery(GET_EVENTS, {
    variables: { clubId },
  });

  const [createEvent] = useMutation(CREATE_EVENT);
  const [createRSVP] = useMutation(CREATE_RSVP);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createEvent({
        variables: {
          input: {
            clubId,
            date: new Date(eventDate).toISOString(),
            description: eventDescription,
          },
        },
      });

      setEventDate('');
      setEventDescription('');
      setShowCreateForm(false);
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId: string, status: string) => {
    try {
      await createRSVP({
        variables: {
          input: {
            eventId,
            status,
          },
        },
      });
      refetch();
    } catch (err: any) {
      console.error('Failed to RSVP:', err.message);
    }
  };

  const getRSVPStatus = (event: any) => {
    const userRSVP = event.rsvps?.find((rsvp: any) => rsvp.user.id === user?.id);
    return userRSVP?.status || null;
  };

  const getRSVPCounts = (event: any) => {
    const counts = { available: 0, notAvailable: 0, maybe: 0, onlyIfNeeded: 0 };
    event.rsvps?.forEach((rsvp: any) => {
      counts[rsvp.status.toLowerCase().replace('_', '') as keyof typeof counts]++;
    });
    return counts;
  };

  return (
    <div className="event-list">
      <div className="event-header">
        <h2>Events</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-create-event"
        >
          {showCreateForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-event-form">
          <h3>Create New Event</h3>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleCreateEvent}>
            <div className="form-group">
              <label htmlFor="eventDate">Date & Time</label>
              <input
                type="datetime-local"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="eventDescription">Description</label>
              <textarea
                id="eventDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                required
                placeholder="Describe the event..."
                rows={3}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      {eventsLoading ? (
        <div className="loading">Loading events...</div>
      ) : (
        <div className="events-grid">
          {data?.events?.length === 0 ? (
            <div className="empty-state">
              <h3>No events yet</h3>
              <p>Create the first event for this club!</p>
            </div>
          ) : (
            data?.events?.map((event: any) => {
              const userRSVP = getRSVPStatus(event);
              const rsvpCounts = getRSVPCounts(event);
              
              return (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.description}</h3>
                    <span className="event-date">
                      {new Date(event.date).toLocaleDateString()} at{' '}
                      {new Date(event.date).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="event-creator">
                    Created by {event.createdBy.username}
                  </div>

                  <div className="rsvp-counts">
                    <span className="rsvp-count available">
                      ✅ {rsvpCounts.available}
                    </span>
                    <span className="rsvp-count not-available">
                      ❌ {rsvpCounts.notAvailable}
                    </span>
                    <span className="rsvp-count maybe">
                      🤔 {rsvpCounts.maybe}
                    </span>
                    <span className="rsvp-count only-if-needed">
                      ⚠️ {rsvpCounts.onlyIfNeeded}
                    </span>
                  </div>

                  {!userRSVP && (
                    <div className="rsvp-actions">
                      <button
                        onClick={() => handleRSVP(event.id, 'AVAILABLE')}
                        className="btn-rsvp available"
                      >
                        Available
                      </button>
                      <button
                        onClick={() => handleRSVP(event.id, 'NOT_AVAILABLE')}
                        className="btn-rsvp not-available"
                      >
                        Not Available
                      </button>
                      <button
                        onClick={() => handleRSVP(event.id, 'MAYBE')}
                        className="btn-rsvp maybe"
                      >
                        Maybe
                      </button>
                      <button
                        onClick={() => handleRSVP(event.id, 'ONLY_IF_NEEDED')}
                        className="btn-rsvp only-if-needed"
                      >
                        Only if Needed
                      </button>
                    </div>
                  )}

                  {userRSVP && (
                    <div className="user-rsvp">
                      <span className={`rsvp-status ${userRSVP.toLowerCase()}`}>
                        Your RSVP: {userRSVP.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default EventList; 