import { useMutation, useQuery } from '@apollo/client';
import { CREATE_EVENT, CREATE_RSVP, DELETE_EVENT, GET_EVENTS, UPDATE_EVENT, UPDATE_RSVP } from 'graphql/Event';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';
import './EventList.css';

interface EventListProps {
  groupId: string;
  isAdmin?: boolean;
}

const EventList: React.FC<EventListProps> = ({ groupId, isAdmin = false }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [rsvpNotes, setRsvpNotes] = useState<Record<string, string>>({});
  const [showRsvpForm, setShowRsvpForm] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { data, loading: eventsLoading, refetch } = useQuery(GET_EVENTS, {
    variables: { groupId },
  });

  const [createEvent] = useMutation(CREATE_EVENT);
  const [createRSVP] = useMutation(CREATE_RSVP);
  const [updateRSVP] = useMutation(UPDATE_RSVP);
  const [deleteEventMutation] = useMutation(DELETE_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createEvent({
        variables: {
          input: {
            groupId,
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
      const note = rsvpNotes[eventId] || '';
      await createRSVP({
        variables: {
          input: {
            eventId,
            status,
            note,
          },
        },
      });
      // Clear the note for this event
      setRsvpNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[eventId];
        return newNotes;
      });
      setShowRsvpForm(null);
      refetch();
    } catch (err: any) {
      console.error('Failed to RSVP:', err.message);
    }
  };

  const handleUpdateRSVP = async (rsvpId: string, status: string) => {
    try {
      const note = rsvpNotes[rsvpId] || '';
      await updateRSVP({
        variables: {
          id: rsvpId,
          status,
          note,
        },
      });
      // Clear the note for this RSVP
      setRsvpNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[rsvpId];
        return newNotes;
      });
      setShowRsvpForm(null);
      refetch();
    } catch (err: any) {
      console.error('Failed to update RSVP:', err.message);
    }
  };

  const handleNoteChange = (id: string, note: string) => {
    setRsvpNotes(prev => ({
      ...prev,
      [id]: note
    }));
  };

  const toggleRsvpForm = (id: string) => {
    if (showRsvpForm === id) {
      setShowRsvpForm(null);
    } else {
      setShowRsvpForm(id);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This will permanently delete the event and ALL RSVPs for it. This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    setDeletingEventId(eventId);
    setError('');
    try {
      await deleteEventMutation({ variables: { id: eventId } });
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
      setDeletingEventId(null);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEventId(event.id);
    setEditEventDate(event.date.slice(0, 16)); // ISO string to yyyy-MM-ddTHH:mm
    setEditEventDescription(event.description);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateEvent({
        variables: {
          id: editingEventId,
          input: {
            groupId,
            date: new Date(editEventDate).toISOString(),
            description: editEventDescription,
          },
        },
      });
      setEditingEventId(null);
      setEditEventDate('');
      setEditEventDescription('');
      refetch();
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const getRSVPStatus = (event: any) => {
    const userRSVP = event.rsvps?.find((rsvp: any) => rsvp.user.id === user?.id);
    return userRSVP || null;
  };

  const getRSVPCounts = (event: any) => {
    const counts = { available: 0, notAvailable: 0, maybe: 0, onlyIfNeeded: 0 };
    event.rsvps?.forEach((rsvp: any) => {
      let statusKey: keyof typeof counts;
      switch (rsvp.status) {
        case 'AVAILABLE':
          statusKey = 'available';
          break;
        case 'NOT_AVAILABLE':
          statusKey = 'notAvailable';
          break;
        case 'MAYBE':
          statusKey = 'maybe';
          break;
        case 'ONLY_IF_NEEDED':
          statusKey = 'onlyIfNeeded';
          break;
        default:
          return; // Skip unknown statuses
      }
      counts[statusKey]++;
    });
    return counts;
  };

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const getSortedRSVPs = (rsvps: any[]) => {
    if (!rsvps) return [];

    // Define priority order for RSVP statuses
    const statusPriority = {
      'AVAILABLE': 1,
      'MAYBE': 2,
      'ONLY_IF_NEEDED': 3,
      'NOT_AVAILABLE': 4,
    };

    return [...rsvps].sort((a, b) => {
      // First sort by status priority
      const statusDiff = statusPriority[a.status as keyof typeof statusPriority] -
                        statusPriority[b.status as keyof typeof statusPriority];
      if (statusDiff !== 0) return statusDiff;

      // Then sort by creation time (earliest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const formatRSVPTime = (createdAt: string) => {
    return new Date(createdAt).toLocaleString();
  };

  const getStatusDisplayName = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="event-list">
      <div className="event-header">
        <h2>Events</h2>
        {isAdmin && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-create-event"
          >
            {showCreateForm ? 'Cancel' : 'Create Event'}
          </button>
        )}
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
          {data?.events
            ?.filter((event: any) => {
              // Only show events whose date is today or in the future
              const eventDate = new Date(event.date);
              const now = new Date();
              // Remove time from both for comparison
              eventDate.setHours(0,0,0,0);
              now.setHours(0,0,0,0);
              return eventDate >= now;
            })
            .map((event: any) => {
              const userRSVP = getRSVPStatus(event);
              const rsvpCounts = getRSVPCounts(event);
              const sortedRSVPs = getSortedRSVPs(event.rsvps);
              const isExpanded = expandedEvents.has(event.id);
              const isRsvpFormOpen = showRsvpForm === event.id;
              const isUpdateFormOpen = userRSVP && showRsvpForm === userRSVP.id;
              const canEdit = isAdmin || event.createdBy.id === user?.id;

              return (
                <div key={event.id} className="event-card">
                  {editingEventId === event.id ? (
                    <div className="edit-event-form">
                      <h3>Edit Event</h3>
                      {error && <div className="error-message">{error}</div>}
                      <form onSubmit={handleUpdateEvent}>
                        <div className="form-group">
                          <label htmlFor="editEventDate">Date & Time</label>
                          <input
                            type="datetime-local"
                            id="editEventDate"
                            value={editEventDate}
                            onChange={(e) => setEditEventDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="editEventDescription">Description</label>
                          <textarea
                            id="editEventDescription"
                            value={editEventDescription}
                            onChange={(e) => setEditEventDescription(e.target.value)}
                            required
                            rows={3}
                          />
                        </div>
                        <div className="form-actions">
                          <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" className="btn-cancel" onClick={() => setEditingEventId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <>
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
                      {/* RSVP List Toggle */}
                      {event.rsvps && event.rsvps.length > 0 && (
                        <div className="rsvp-list-toggle">
                          <button
                            onClick={() => toggleEventExpansion(event.id)}
                            className="btn-toggle-rsvps"
                          >
                            {isExpanded ? '▼' : '▶'} View RSVPs ({event.rsvps.length})
                          </button>
                        </div>
                      )}

                      {/* Collapsible RSVP List */}
                      {isExpanded && event.rsvps && event.rsvps.length > 0 && (
                        <div className="rsvp-list">
                          <h4>RSVPs</h4>
                          <div className="rsvp-items">
                            {sortedRSVPs.map((rsvp: any) => (
                              <div key={rsvp.id} className="rsvp-item">
                                <div className="rsvp-user-info">
                                  <span className="rsvp-user-name">
                                    {rsvp.user.username || rsvp.user.email}
                                  </span>
                                  <span className="rsvp-time">
                                    {formatRSVPTime(rsvp.createdAt)}
                                  </span>
                                </div>
                                <div className="rsvp-status-display">
                                  <span className={`rsvp-status-badge ${rsvp.status.toLowerCase()}`}>
                                    {getStatusDisplayName(rsvp.status)}
                                  </span>
                                  {rsvp.note && (
                                    <span className="rsvp-note">{rsvp.note}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* RSVP Actions */}
                      {!userRSVP && (
                        <div className="rsvp-actions">
                          {!isRsvpFormOpen ? (
                            <>
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
                              <button
                                onClick={() => toggleRsvpForm(event.id)}
                                className="btn-rsvp-with-note"
                              >
                                RSVP with Note
                              </button>
                            </>
                          ) : (
                            <div className="rsvp-form">
                              <div className="form-group">
                                <label htmlFor={`rsvp-note-${event.id}`}>Add a note (optional)</label>
                                <textarea
                                  id={`rsvp-note-${event.id}`}
                                  value={rsvpNotes[event.id] || ''}
                                  onChange={(e) => handleNoteChange(event.id, e.target.value)}
                                  placeholder="Add any additional information..."
                                  rows={2}
                                />
                              </div>
                              <div className="rsvp-form-actions">
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
                                <button
                                  onClick={() => toggleRsvpForm(event.id)}
                                  className="btn-cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {userRSVP && (
                        <div className="user-rsvp">
                          <div className="current-rsvp">
                            <span className={`rsvp-status ${userRSVP.status.toLowerCase()}`}>
                              Your RSVP: {getStatusDisplayName(userRSVP.status)}
                            </span>
                            <span className="rsvp-time">
                              {formatRSVPTime(userRSVP.createdAt)}
                            </span>
                            {userRSVP.note && (
                              <span className="rsvp-note-display">"{userRSVP.note}"</span>
                            )}
                          </div>
                          {!isUpdateFormOpen ? (
                            <div className="change-rsvp-actions">
                              <button
                                onClick={() => handleUpdateRSVP(userRSVP.id, 'AVAILABLE')}
                                className={`btn-rsvp-change available ${userRSVP.status === 'AVAILABLE' ? 'active' : ''}`}
                              >
                                Available
                              </button>
                              <button
                                onClick={() => handleUpdateRSVP(userRSVP.id, 'NOT_AVAILABLE')}
                                className={`btn-rsvp-change not-available ${userRSVP.status === 'NOT_AVAILABLE' ? 'active' : ''}`}
                              >
                                Not Available
                              </button>
                              <button
                                onClick={() => handleUpdateRSVP(userRSVP.id, 'MAYBE')}
                                className={`btn-rsvp-change maybe ${userRSVP.status === 'MAYBE' ? 'active' : ''}`}
                              >
                                Maybe
                              </button>
                              <button
                                onClick={() => handleUpdateRSVP(userRSVP.id, 'ONLY_IF_NEEDED')}
                                className={`btn-rsvp-change only-if-needed ${userRSVP.status === 'ONLY_IF_NEEDED' ? 'active' : ''}`}
                              >
                                Only if Needed
                              </button>
                              <button
                                onClick={() => toggleRsvpForm(userRSVP.id)}
                                className="btn-rsvp-change-with-note"
                              >
                                Update with Note
                              </button>
                            </div>
                          ) : (
                            <div className="rsvp-form">
                              <div className="form-group">
                                <label htmlFor={`rsvp-note-${userRSVP.id}`}>Update note (optional)</label>
                                <textarea
                                  id={`rsvp-note-${userRSVP.id}`}
                                  value={rsvpNotes[userRSVP.id] || userRSVP.note || ''}
                                  onChange={(e) => handleNoteChange(userRSVP.id, e.target.value)}
                                  placeholder="Update your note..."
                                  rows={2}
                                />
                              </div>
                              <div className="rsvp-form-actions">
                                <button
                                  onClick={() => handleUpdateRSVP(userRSVP.id, 'AVAILABLE')}
                                  className={`btn-rsvp-change available ${userRSVP.status === 'AVAILABLE' ? 'active' : ''}`}
                                >
                                  Available
                                </button>
                                <button
                                  onClick={() => handleUpdateRSVP(userRSVP.id, 'NOT_AVAILABLE')}
                                  className={`btn-rsvp-change not-available ${userRSVP.status === 'NOT_AVAILABLE' ? 'active' : ''}`}
                                >
                                  Not Available
                                </button>
                                <button
                                  onClick={() => handleUpdateRSVP(userRSVP.id, 'MAYBE')}
                                  className={`btn-rsvp-change maybe ${userRSVP.status === 'MAYBE' ? 'active' : ''}`}
                                >
                                  Maybe
                                </button>
                                <button
                                  onClick={() => handleUpdateRSVP(userRSVP.id, 'ONLY_IF_NEEDED')}
                                  className={`btn-rsvp-change only-if-needed ${userRSVP.status === 'ONLY_IF_NEEDED' ? 'active' : ''}`}
                                >
                                  Only if Needed
                                </button>
                                <button
                                  onClick={() => toggleRsvpForm(userRSVP.id)}
                                  className="btn-cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Edit/Delete Buttons Row */}
                      {(canEdit || isAdmin) && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          {canEdit && (
                            <button
                              className="btn-primary"
                              onClick={() => handleEditEvent(event)}
                            >
                              Edit
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              className="btn-remove"
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={loading && deletingEventId === event.id}
                            >
                              {loading && deletingEventId === event.id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default EventList;
