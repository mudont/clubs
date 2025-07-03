import { PubSub } from 'graphql-subscriptions';

// Define event payload types
type EventPayloads = {
    MESSAGE_ADDED: { messageAdded: any };
    EVENT_CREATED: { eventCreated: any };
    RSVP_UPDATED: { rsvpUpdated: any };
    MEMBER_JOINED: { memberJoined: any };
};

//export const pubsub = new PubSub<EventPayloads>();
export const pubsub = new PubSub();

// Event types for subscriptions
export const EVENTS = {
    MESSAGE_ADDED: 'MESSAGE_ADDED',
    EVENT_CREATED: 'EVENT_CREATED',
    RSVP_UPDATED: 'RSVP_UPDATED',
    MEMBER_JOINED: 'MEMBER_JOINED',
} as const;

// Helper functions to publish events
export const publishMessageAdded = (message: any) => {
    pubsub.publish(EVENTS.MESSAGE_ADDED, {
        messageAdded: message,
    });
};

export const publishEventCreated = (event: any) => {
    pubsub.publish(EVENTS.EVENT_CREATED, {
        eventCreated: event,
    });
};

export const publishRSVPUpdated = (rsvp: any) => {
    pubsub.publish(EVENTS.RSVP_UPDATED, {
        rsvpUpdated: rsvp,
    });
};

export const publishMemberJoined = (membership: any) => {
    pubsub.publish(EVENTS.MEMBER_JOINED, {
        memberJoined: membership,
    });
}; 