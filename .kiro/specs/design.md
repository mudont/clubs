# Groups Platform - Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Apollo Server  │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (GraphQL)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │     Redis       │              │
         └──────────────►│   (Sessions)    │◄─────────────┘
                        │                 │
                        └─────────────────┘
```

### 1.2 Technology Stack

#### Frontend Layer

- **React 19**: Component-based UI with concurrent features
- **TypeScript**: Type safety and developer experience
- **Apollo Client**: GraphQL client with intelligent caching
- **Redux Toolkit**: State management for complex UI state
- **Tailwind CSS**: Utility-first styling framework
- **PWA**: Service worker for offline capabilities

#### Backend Layer

- **Node.js + Express 5**: Server runtime and web framework
- **Apollo Server**: GraphQL API with subscriptions
- **Prisma ORM**: Type-safe database operations
- **Passport.js**: Multi-provider authentication
- **JWT**: Stateless authentication tokens

#### Data Layer

- **PostgreSQL**: Primary relational database
- **Redis**: Session storage and caching
- **Prisma Schema**: Database modeling and migrations

#### Infrastructure

- **Docker**: Containerization for deployment
- **Nginx**: Reverse proxy and static file serving
- **GitHub Actions**: CI/CD pipeline automation

## 2. Database Design

### 2.1 Entity Relationship Diagram

```
Users ──┐
        │
        ├── AuthAccounts (OAuth providers)
        │
        ├── Memberships ──── Groups ──┐
        │                            │
        ├── Messages ────────────────┘
        │
        ├── Events ──── RSVPs
        │
        └── Tennis Relations:
            ├── TeamLeagueTeam (as captain)
            ├── SinglesMatches (as player1/player2)
            └── DoublesMatches (as team players)

Groups ──┐
         ├── TeamLeagueTeam
         ├── BlockedUsers
         └── Events

TeamLeague ──┐
             ├── TeamLeagueTeam
             ├── TeamLeagueTeamMatch
             └── TeamLeaguePointSystem
```

### 2.2 Core Tables

#### Users Table

```sql
users (
  id UUID PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  bio TEXT,
  avatar VARCHAR,
  phone VARCHAR,
  photo_url VARCHAR,
  reset_password_token VARCHAR,
  reset_password_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### Groups Table

```sql
groups (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

#### Tennis League Tables

```sql
team_leagues (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

team_league_teams (
  id UUID PRIMARY KEY,
  team_league_id UUID REFERENCES team_leagues(id),
  group_id UUID REFERENCES groups(id),
  captain_id UUID REFERENCES users(id)
)

team_league_team_matches (
  id UUID PRIMARY KEY,
  team_league_id UUID REFERENCES team_leagues(id),
  home_team_id UUID REFERENCES team_league_teams(id),
  away_team_id UUID REFERENCES team_league_teams(id),
  match_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 2.3 Naming Conventions

- **Database**: snake_case for all table and column names
- **Prisma Schema**: camelCase with @map() directives
- **TypeScript**: camelCase for all interfaces and types
- **GraphQL**: camelCase for all fields and types

## 3. API Design

### 3.1 GraphQL Schema Structure

#### Core Types

```graphql
type User {
  id: ID!
  username: String!
  email: String!
  emailVerified: Boolean!
  firstName: String
  lastName: String
  bio: String
  avatar: String
  memberships: [Membership!]!
}

type Group {
  id: ID!
  name: String!
  description: String
  isPublic: Boolean!
  members: [Membership!]!
  events: [Event!]!
  messages: [Message!]!
}

type Event {
  id: ID!
  group: Group!
  createdBy: User!
  date: DateTime!
  description: String!
  rsvps: [RSVP!]!
}
```

#### Tennis Types

```graphql
type TeamLeague {
  id: ID!
  name: String!
  description: String
  startDate: DateTime!
  endDate: DateTime!
  teams: [TeamLeagueTeam!]!
  pointSystems: [TeamLeaguePointSystem!]!
}

type TeamLeagueTeam {
  id: ID!
  group: Group!
  captain: User!
  members: [User!]!
}
```

### 3.2 Mutation Design

```graphql
type Mutation {
  # Group Management
  createGroup(input: CreateGroupInput!): Group!
  joinGroup(groupId: ID!): Membership!
  addMemberByEmail(groupId: ID!, email: String!): Membership!

  # Event Management
  createEvent(input: CreateEventInput!): Event!
  createRSVP(input: CreateRSVPInput!): RSVP!

  # Tennis Management
  createTennisLeague(input: CreateTennisLeagueInput!): TeamLeague!
  createTeamMatch(
    leagueId: ID!
    input: CreateTeamMatchInput!
  ): TeamLeagueTeamMatch!
}
```

### 3.3 Subscription Design

```graphql
type Subscription {
  messageAdded(groupId: ID!): Message!
  eventCreated(groupId: ID!): Event!
  rsvpUpdated(eventId: ID!): RSVP!
  memberJoined(groupId: ID!): Membership!
}
```

## 4. Authentication & Authorization

### 4.1 Authentication Flow

```
1. User Login Request
   ├── Local: email/password → bcrypt verification
   └── OAuth: provider redirect → token exchange

2. JWT Token Generation
   ├── Payload: { userId, email, iat, exp }
   ├── Secret: Environment variable
   └── Expiry: 24 hours

3. Session Storage
   ├── Redis: session data with TTL
   ├── HTTP-only cookies for web
   └── localStorage for mobile PWA
```

### 4.2 Authorization Patterns

```typescript
// Group-based authorization
const isGroupMember = (userId: string, groupId: string) => boolean;
const isGroupAdmin = (userId: string, groupId: string) => boolean;

// Resource ownership
const isEventCreator = (userId: string, eventId: string) => boolean;
const isTeamCaptain = (userId: string, teamId: string) => boolean;

// Permission matrix
const permissions = {
  'group:read': ['member', 'admin'],
  'group:write': ['admin'],
  'event:create': ['admin'],
  'message:send': ['member', 'admin'],
};
```

## 5. Real-Time Architecture

### 5.1 WebSocket Implementation

```typescript
// GraphQL Subscriptions over WebSocket
const subscriptionServer = new SubscriptionServer({
  schema,
  execute,
  subscribe,
  onConnect: (connectionParams) => {
    // JWT authentication
    return { user: authenticatedUser };
  },
});

// Redis Pub/Sub for scaling
const pubsub = new RedisPubSub({
  connection: redisConfig,
});
```

### 5.2 Real-Time Events

- **Message Broadcasting**: New chat messages to group members
- **Event Notifications**: New events to group members
- **RSVP Updates**: Real-time RSVP changes to event creators
- **Member Updates**: Join/leave notifications to group admins

## 6. Frontend Architecture

### 6.1 Component Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── groups/          # Group management
│   ├── events/          # Event management
│   ├── chat/            # Real-time messaging
│   └── tennis/          # Tennis league components
├── store/               # Redux store and slices
├── apollo/              # GraphQL client configuration
├── hooks/               # Custom React hooks
└── utils/               # Utility functions
```

### 6.2 State Management Strategy

```typescript
// Apollo Client for server state
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Group: {
        fields: {
          messages: {
            merge: (existing = [], incoming) => [...existing, ...incoming],
          },
        },
      },
    },
  }),
});

// Redux for UI state
const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
    notifications: notificationsSlice.reducer,
  },
});
```

### 6.3 Functional Programming Patterns

```typescript
// Immutable state updates
const updateUser = (state: UserState, action: UpdateUserAction) => ({
  ...state,
  user: { ...state.user, ...action.payload }
})

// Pure component functions
const UserProfile = React.memo(({ user }: { readonly user: User }) => (
  <div>{user.username}</div>
))

// Functional error handling
const handleApiCall = (apiCall: () => Promise<T>) =>
  apiCall()
    .then(Result.ok)
    .catch(Result.error)
```

## 7. Security Design

### 7.1 Input Validation

```typescript
// Joi schemas for validation
const createGroupSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  isPublic: Joi.boolean().default(false),
});

// GraphQL input validation
const validateInput = (schema: Joi.Schema) => (input: unknown) =>
  schema.validate(input, { abortEarly: false });
```

### 7.2 Rate Limiting

```typescript
// Express rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts',
});

// GraphQL rate limiting
const rateLimitDirective = (limit: number, window: number) =>
  new RateLimiterDirective(limit, window);
```

### 7.3 Data Sanitization

```typescript
// HTML sanitization
const sanitizeMessage = (content: string) =>
  DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });

// SQL injection prevention (Prisma handles this)
const findUser = (email: string) =>
  prisma.user.findUnique({ where: { email } });
```

## 8. Performance Optimization

### 8.1 Database Optimization

```sql
-- Indexes for common queries
CREATE INDEX idx_memberships_user_group ON memberships(user_id, group_id);
CREATE INDEX idx_messages_group_created ON messages(group_id, created_at DESC);
CREATE INDEX idx_events_group_date ON events(group_id, date);

-- Connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"
```

### 8.2 Caching Strategy

```typescript
// Redis caching
const cacheKey = (type: string, id: string) => `${type}:${id}`;
const cache = {
  get: (key: string) => redis.get(key).then(JSON.parse),
  set: (key: string, value: unknown, ttl = 3600) =>
    redis.setex(key, ttl, JSON.stringify(value)),
};

// Apollo Client caching
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        groups: {
          merge: false, // Replace instead of merge
        },
      },
    },
  },
});
```

### 8.3 Frontend Optimization

```typescript
// Code splitting
const TennisModule = React.lazy(() => import('./tennis/TennisModule'))

// Memoization
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => processData(data), [data])
  return <div>{processedData}</div>
})

// Virtual scrolling for large lists
const MessageList = ({ messages }) => (
  <FixedSizeList
    height={400}
    itemCount={messages.length}
    itemSize={60}
  >
    {MessageItem}
  </FixedSizeList>
)
```

## 9. Error Handling

### 9.1 Functional Error Handling

```typescript
// Result type for error handling
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Error handling without try-catch
const safeApiCall = <T>(fn: () => Promise<T>): Promise<Result<T>> =>
  fn()
    .then((data) => ({ success: true, data }))
    .catch((error) => ({ success: false, error }));

// Error boundaries for React
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return fallback;
  }

  return children;
};
```

### 9.2 GraphQL Error Handling

```typescript
// Custom error types
class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Error formatting
const formatError = (error: GraphQLError) => ({
  message: error.message,
  code: error.extensions?.code,
  path: error.path,
});
```

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
E2E Tests (Playwright)
├── Critical user journeys
├── Authentication flows
└── Real-time features

Integration Tests (Jest + Supertest)
├── API endpoints
├── Database operations
└── Authentication middleware

Unit Tests (Jest + React Testing Library)
├── Pure functions
├── React components
├── Business logic
└── Utility functions
```

### 10.2 Test Patterns

```typescript
// Pure function testing
describe('calculateStandings', () => {
  it('should calculate correct points', () => {
    const matches = [/* test data */]
    const result = calculateStandings(matches)
    expect(result).toEqual(expectedStandings)
  })
})

// React component testing
describe('UserProfile', () => {
  it('should be accessible', async () => {
    render(<UserProfile user={mockUser} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// GraphQL resolver testing
describe('createGroup resolver', () => {
  it('should create group with valid input', async () => {
    const result = await createGroup(parent, args, context)
    expect(result).toMatchObject({ name: args.input.name })
  })
})
```

## 11. Deployment Architecture

### 11.1 Container Strategy

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
COPY --from=builder /app/node_modules ./node_modules
COPY dist ./dist
EXPOSE 4010
CMD ["node", "dist/index.js"]
```

### 11.2 Environment Configuration

```yaml
# docker-compose.yml
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
```

### 11.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Run lint
        run: npm run lint
      - name: Security scan
        run: npm audit

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build and push Docker image
        run: docker build -t app:latest .
      - name: Deploy to production
        run: docker-compose up -d
```

This design document provides a comprehensive blueprint for implementing the Groups platform with strict functional programming principles, modern architecture patterns, and production-ready deployment strategies.
