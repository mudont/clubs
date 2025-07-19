import { ApolloClient, InMemoryCache, createHttpLink, from, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// Get the server URL - point directly to backend
const SERVER_URL = 'http://localhost:4010';
const GRAPHQL_ENDPOINT = `${SERVER_URL}/graphql`;
const WS_ENDPOINT = SERVER_URL.replace(/^http/, 'ws') + '/graphql';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
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
    url: WS_ENDPOINT,
    connectionParams: () => ({
      authorization: `Bearer ${localStorage.getItem('token')}`,
    }),
  })
);

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward: _forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error('GraphQL error occurred:', {
        message,
        locations,
        path,
        extensions,
        operationName: operation.operationName,
      });

      // Handle specific error types
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (extensions?.code === 'FORBIDDEN') {
        console.warn('Access denied:', message);
      }
    });
  }

  if (networkError) {
    console.error('Network error:', networkError);

    // Handle different types of network errors
    if (networkError.name === 'ServerError') {
      console.error('Server error:', networkError);
    } else if (networkError.name === 'NetworkError') {
      console.error('Connection failed:', networkError);
      // Could show toast notification here
    }

    // For 401 errors, clear token and redirect
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
});

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

// Combine all links with error handling
const link = from([
  errorLink,
  splitLink,
]);

// Create Apollo Client
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      // Add cache policies for better performance
      Query: {
        fields: {
          myGroups: {
            merge: false, // Replace instead of merging
          },
          messages: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Enable development tools in development
  connectToDevTools: process.env.NODE_ENV === 'development',
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
      url: WS_ENDPOINT,
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
