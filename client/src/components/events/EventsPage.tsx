import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../common/Header';
import './EventsPage.css';

interface Event {
  id: string;
  date: string;
  description: string;
  group: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    username: string;
  };
  rsvps: {
    id: string;
    status: string;
    note?: string;
  }[];
}

interface UserPendingEventsData {
  userPendingEvents: Event[];
}

interface CreateRSVPData {
  createRSVP: {
    id: string;
    status: string;
    note?: string;
  };
}

interface UpdateRSVPData {
  updateRSVP: {
    id: string;
    status: string;
    note?: string;
  };
}

const GET_USER_PENDING_EVENTS = gql`
  query GetUserPendingEvents {
    userPendingEvents {
      id
      date
      description
      group {
        id
        name
      }
      createdBy {
        id
        username
      }
      rsvps {
        id
        status
        note
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
    }
  }
`;

const UPDATE_RSVP = gql`
  mutation UpdateRSVP($id: ID!, $status: RSVPStatus!, $note: String) {
    updateRSVP(id: $id, status: $status, note: $note) {
      id
      status
      note
    }
  }
`;

const EventsPage: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<string>('AVAILABLE');
  const [rsvpNote, setRsvpNote] = useState<string>('');

  const { data, loading, refetch } = useQuery<UserPendingEventsData>(GET_USER_PENDING_EVENTS);
  const [createRSVP] = useMutation<CreateRSVPData>(CREATE_RSVP);
  const [updateRSVP] = useMutation<UpdateRSVPData>(UPDATE_RSVP);

  const events = data?.userPendingEvents || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentRSVPStatus = (event: Event) => {
    return event.rsvps[0]?.status || 'NOT_RSVPED';
  };

  const handleRSVP = async (event: Event) => {
    try {
      const currentRSVP = event.rsvps[0];

      if (currentRSVP) {
        // Update existing RSVP
        await updateRSVP({
          variables: {
            id: currentRSVP.id,
            status: rsvpStatus,
            note: rsvpNote || undefined
          }
        });
      } else {
        // Create new RSVP
        await createRSVP({
          variables: {
            input: {
              eventId: event.id,
              status: rsvpStatus,
              note: rsvpNote || undefined
            }
          }
        });
      }

      // Reset form and refetch data
      setSelectedEvent(null);
      setRsvpStatus('AVAILABLE');
      setRsvpNote('');
      refetch();
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'status-available';
      case 'NOT_AVAILABLE':
        return 'status-unavailable';
      case 'MAYBE':
        return 'status-maybe';
      case 'ONLY_IF_NEEDED':
        return 'status-needed';
      default:
        return 'status-pending';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'NOT_AVAILABLE':
        return 'Not Available';
      case 'MAYBE':
        return 'Maybe';
      case 'ONLY_IF_NEEDED':
        return 'Only if Needed';
      default:
        return 'Not RSVPed';
    }
  };

    if (loading) {
    return (
      <div className="events-page">
        <Header title="My Events" showBackButton backTo="/dashboard" />
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <Header title="My Events" showBackButton backTo="/dashboard" />

      <main className="events-content">
        {events.length === 0 ? (
          <div className="empty-state">
            <h2>No Upcoming Events</h2>
            <p>You don't have any upcoming events in your groups.</p>
            <Link to="/dashboard" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => {
              const currentStatus = getCurrentRSVPStatus(event);
              const isSelected = selectedEvent?.id === event.id;

              return (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3 className="event-title">{event.group.name}</h3>
                    <span className={`event-status ${getStatusColor(currentStatus)}`}>
                      {getStatusText(currentStatus)}
                    </span>
                  </div>

                  <div className="event-details">
                    <p className="event-description">{event.description}</p>
                    <p className="event-date">📅 {formatDate(event.date)}</p>
                    <p className="event-creator">👤 Created by {event.createdBy.username}</p>
                  </div>

                  {isSelected ? (
                    <div className="rsvp-form">
                      <div className="rsvp-options">
                        <label>
                          <input
                            type="radio"
                            name={`rsvp-${event.id}`}
                            value="AVAILABLE"
                            checked={rsvpStatus === 'AVAILABLE'}
                            onChange={(e) => setRsvpStatus(e.target.value)}
                          />
                          Available
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`rsvp-${event.id}`}
                            value="NOT_AVAILABLE"
                            checked={rsvpStatus === 'NOT_AVAILABLE'}
                            onChange={(e) => setRsvpStatus(e.target.value)}
                          />
                          Not Available
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`rsvp-${event.id}`}
                            value="MAYBE"
                            checked={rsvpStatus === 'MAYBE'}
                            onChange={(e) => setRsvpStatus(e.target.value)}
                          />
                          Maybe
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`rsvp-${event.id}`}
                            value="ONLY_IF_NEEDED"
                            checked={rsvpStatus === 'ONLY_IF_NEEDED'}
                            onChange={(e) => setRsvpStatus(e.target.value)}
                          />
                          Only if Needed
                        </label>
                      </div>

                      <textarea
                        placeholder="Add a note (optional)"
                        value={rsvpNote}
                        onChange={(e) => setRsvpNote(e.target.value)}
                        className="rsvp-note"
                      />

                      <div className="rsvp-actions">
                        <button
                          onClick={() => handleRSVP(event)}
                          className="btn-primary"
                        >
                          Submit RSVP
                        </button>
                        <button
                          onClick={() => setSelectedEvent(null)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="event-actions">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setRsvpStatus(currentStatus === 'NOT_RSVPED' ? 'AVAILABLE' : currentStatus);
                          setRsvpNote(event.rsvps[0]?.note || '');
                        }}
                        className="btn-primary"
                      >
                        {currentStatus === 'NOT_RSVPED' ? 'RSVP Now' : 'Update RSVP'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default EventsPage;
