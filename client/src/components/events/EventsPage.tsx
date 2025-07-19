import { gql, useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../common/Header';
import './EventsPage.css';

interface RSVP {
  id: string;
  status: string;
  note?: string;
  user: {
    id: string;
    username: string;
  };
}

interface Event {
  id: string;
  date: string;
  description: string;
  group: {
    id: string;
    name: string;
  };
  rsvps: RSVP[];
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
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

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
    // Find the RSVP for the current user (assume only one per user)
    // This assumes the backend returns the current user's RSVP first, or you can identify the user from context
    // For now, fallback to the first RSVP if only one exists
    return event.rsvps[0]?.status || 'NOT_RSVPED';
  };

  const handleRSVP = async (event: Event) => {
    try {
      const currentRSVP = event.rsvps.find(r => r.user.id === window.localStorage.getItem('userId')) || event.rsvps[0];

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

  const countRSVPs = (event: Event, status: string) =>
    event.rsvps.filter(rsvp => rsvp.status === status).length;

  // Helper to extract home/away teams from event description
  function parseTeamsFromDescription(description: string): { home: string; away: string } | null {
    // Try to match: 'Tennis Match: HomeTeam vs AwayTeam'
    const match = description.match(/Tennis Match: ([^\n]+) vs ([^\n]+)/);
    if (match) {
      return { home: match[1].trim(), away: match[2].trim() };
    }
    return null;
  }

  // Helper to check if event is within 7 days of today
  function isWithinAWeek(dateString: string): boolean {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }

  const visibleEvents = events.filter(e => isWithinAWeek(e.date));
  const futureEvents = events.filter(e => !isWithinAWeek(e.date));
  const [showFuture, setShowFuture] = useState(false);

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
          <>
            <div className="events-grid">
              {(events.length === 1 ? events : visibleEvents).map((event) => {
                const currentStatus = getCurrentRSVPStatus(event);
                const isSelected = selectedEvent?.id === event.id;
                const isAccordionOpen = openAccordion === event.id;
                const teams = parseTeamsFromDescription(event.description);

                return (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <h3 className="event-title">{teams ? `${teams.home} vs ${teams.away}` : event.group.name}</h3>
                      <span className={`event-status ${getStatusColor(currentStatus)}`}>
                        {getStatusText(currentStatus)}
                      </span>
                    </div>
                    <div className="event-rsvp-counts">
                      <span className="rsvp-count available">Available: {countRSVPs(event, 'AVAILABLE')}</span>
                      <span className="rsvp-count not-available">Not Available: {countRSVPs(event, 'NOT_AVAILABLE')}</span>
                      <span className="rsvp-count maybe">Maybe: {countRSVPs(event, 'MAYBE')}</span>
                      <span className="rsvp-count only-if-needed">Only if Needed: {countRSVPs(event, 'ONLY_IF_NEEDED')}</span>
                    </div>
                    <div className="event-details">
                      {teams && (
                        <div className="event-teams mb-1 text-sm text-gray-700">
                          <span className="font-semibold">Home:</span> {teams.home} &nbsp; <span className="font-semibold">Away:</span> {teams.away}
                        </div>
                      )}
                      <p className="event-date font-semibold">📅 {formatDate(event.date)}</p>
                      <p className="event-description">{event.description}</p>
                    </div>
                    <button
                      className="accordion-btn"
                      onClick={() => setOpenAccordion(isAccordionOpen ? null : event.id)}
                      aria-expanded={isAccordionOpen}
                      aria-controls={`accordion-panel-${event.id}`}
                    >
                      {isAccordionOpen ? 'Hide RSVPs' : 'Show RSVPs'}
                    </button>
                    {isAccordionOpen && (
                      <div className="accordion-panel" id={`accordion-panel-${event.id}`}>
                        <table className="rsvp-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Status</th>
                              <th>Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.rsvps.map((rsvp) => (
                              <tr key={rsvp.id}>
                                <td>{rsvp.user.username}</td>
                                <td><span className={`rsvp-status-badge ${getStatusColor(rsvp.status)}`}>{getStatusText(rsvp.status)}</span></td>
                                <td>{rsvp.note || ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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
            {futureEvents.length > 0 && events.length > 1 && (
              <div className="mt-4">
                <button
                  className="accordion-btn"
                  onClick={() => setShowFuture(v => !v)}
                  aria-expanded={showFuture}
                >
                  {showFuture ? 'Hide future events' : `Show ${futureEvents.length} future event${futureEvents.length > 1 ? 's' : ''}`}
                </button>
                {showFuture && (
                  <div className="events-grid mt-2">
                    {futureEvents.map((event) => {
                      const currentStatus = getCurrentRSVPStatus(event);
                      const isSelected = selectedEvent?.id === event.id;
                      const isAccordionOpen = openAccordion === event.id;
                      const teams = parseTeamsFromDescription(event.description);
                      return (
                        <div key={event.id} className="event-card">
                          <div className="event-header">
                            <h3 className="event-title">{teams ? `${teams.home} vs ${teams.away}` : event.group.name}</h3>
                            <span className={`event-status ${getStatusColor(currentStatus)}`}>
                              {getStatusText(currentStatus)}
                            </span>
                          </div>
                          <div className="event-rsvp-counts">
                            <span className="rsvp-count available">Available: {countRSVPs(event, 'AVAILABLE')}</span>
                            <span className="rsvp-count not-available">Not Available: {countRSVPs(event, 'NOT_AVAILABLE')}</span>
                            <span className="rsvp-count maybe">Maybe: {countRSVPs(event, 'MAYBE')}</span>
                            <span className="rsvp-count only-if-needed">Only if Needed: {countRSVPs(event, 'ONLY_IF_NEEDED')}</span>
                          </div>
                          <div className="event-details">
                            {teams && (
                              <div className="event-teams mb-1 text-sm text-gray-700">
                                <span className="font-semibold">Home:</span> {teams.home} &nbsp; <span className="font-semibold">Away:</span> {teams.away}
                              </div>
                            )}
                            <p className="event-date font-semibold">📅 {formatDate(event.date)}</p>
                            <p className="event-description">{event.description}</p>
                          </div>
                          <button
                            className="accordion-btn"
                            onClick={() => setOpenAccordion(isAccordionOpen ? null : event.id)}
                            aria-expanded={isAccordionOpen}
                            aria-controls={`accordion-panel-${event.id}`}
                          >
                            {isAccordionOpen ? 'Hide RSVPs' : 'Show RSVPs'}
                          </button>
                          {isAccordionOpen && (
                            <div className="accordion-panel" id={`accordion-panel-${event.id}`}>
                              <table className="rsvp-table">
                                <thead>
                                  <tr>
                                    <th>User</th>
                                    <th>Status</th>
                                    <th>Note</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {event.rsvps.map((rsvp) => (
                                    <tr key={rsvp.id}>
                                      <td>{rsvp.user.username}</td>
                                      <td><span className={`rsvp-status-badge ${getStatusColor(rsvp.status)}`}>{getStatusText(rsvp.status)}</span></td>
                                      <td>{rsvp.note || ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
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
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default EventsPage;
