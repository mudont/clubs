import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
    uri: 'http://localhost:4010/graphql',
    credentials: 'include',
});

// Auth link to inject JWT token
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
    createClient({
        url: 'ws://localhost:4010/graphql',
        connectionParams: () => ({
            authorization: `Bearer ${localStorage.getItem('token')}`,
        }),
    })
);

// Split links based on operation type
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    authLink.concat(httpLink)
);

// Create Apollo Client
export const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
        },
        query: {
            errorPolicy: 'all',
        },
    },
});

// Function to update auth token
export const updateAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }

    // Recreate the wsLink with new token
    const newWsLink = new GraphQLWsLink(
        createClient({
            url: 'ws://localhost:4010/graphql',
            connectionParams: () => ({
                authorization: token ? `Bearer ${token}` : '',
            }),
        })
    );

    const newSplitLink = split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
            );
        },
        newWsLink,
        authLink.concat(httpLink)
    );

    client.setLink(newSplitLink);
}; 