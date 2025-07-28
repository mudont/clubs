# Natural Language Query Interface - Design Document

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  NL Processor   │    │   Open Source   │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│      LLM        │
│                 │    │                 │    │   (Ollama/HF)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  GraphQL API    │              │
         └─────────────►│   (Existing)    │◄─────────────┘
                        │                 │
                        └─────────────────┘
```

### Component Architecture

```
Frontend Components:
├── NaturalLanguageInput     # Main input component
├── QuerySuggestions        # Auto-complete suggestions
├── ResultsDisplay          # Query results presentation
├── FormPrePopulator        # Pre-populated forms
└── ConversationHistory     # Chat-like interface

Backend Services:
├── NLProcessor             # Main natural language processing
├── IntentClassifier        # Classify user intents
├── ParameterExtractor      # Extract structured data
├── QueryBuilder            # Build GraphQL queries
├── FormPopulator           # Generate pre-populated forms
└── ContextManager          # Manage conversation context
```

## Natural Language Processing Pipeline

### 1. Input Processing

```typescript
interface NLInput {
  query: string;
  context: {
    currentPage: string;
    groupId?: string;
    leagueId?: string;
    userId: string;
    conversationHistory: ConversationTurn[];
  };
}

interface ConversationTurn {
  userInput: string;
  systemResponse: string;
  timestamp: Date;
  intent: Intent;
}
```

### 2. Intent Classification

```typescript
enum IntentType {
  QUERY = 'query', // "What events do I have?"
  CREATE = 'create', // "Create an event"
  UPDATE = 'update', // "Change the event time"
  DELETE = 'delete', // "Cancel the event"
  NAVIGATE = 'navigate', // "Go to my tennis league"
  HELP = 'help', // "How do I create a group?"
}

interface Intent {
  type: IntentType;
  confidence: number;
  entity: string; // 'event', 'group', 'match', etc.
  action?: string; // 'list', 'create', 'update', etc.
  parameters: Record<string, any>;
}
```

### 3. Parameter Extraction

```typescript
interface ExtractedParameters {
  entity: string; // 'event', 'group', 'user', 'match'
  filters: {
    dateRange?: DateRange;
    groupId?: string;
    userId?: string;
    status?: string;
  };
  data?: {
    // For create/update operations
    name?: string;
    description?: string;
    date?: Date;
    participants?: string[];
  };
}
```

## Open Source LLM Integration

### Supported LLM Providers

```typescript
interface LLMProvider {
  name: string;
  endpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

const LLM_PROVIDERS: LLMProvider[] = [
  {
    name: 'ollama',
    endpoint: 'http://localhost:11434/api/generate',
    model: 'llama2:7b',
    maxTokens: 2048,
    temperature: 0.1,
  },
  {
    name: 'huggingface',
    endpoint: 'https://api-inference.huggingface.co/models/',
    model: 'microsoft/DialoGPT-medium',
    maxTokens: 1024,
    temperature: 0.2,
  },
];
```

### LLM Prompt Engineering

```typescript
const SYSTEM_PROMPT = `
You are a helpful assistant for a social and sports club management platform.
The platform has the following entities:
- Users: members with profiles and authentication
- Groups: social groups with members and admins
- Events: scheduled activities with RSVP
- Messages: chat messages within groups
- Tennis Leagues: competitive tennis with teams and matches

Your task is to understand user queries and convert them to structured JSON.

Available operations:
1. QUERY: Search for information
2. CREATE: Create new entities
3. UPDATE: Modify existing entities
4. DELETE: Remove entities
5. NAVIGATE: Move to different pages

Respond with JSON in this format:
{
  "intent": "query|create|update|delete|navigate",
  "entity": "user|group|event|message|league|match",
  "action": "list|get|create|update|delete",
  "parameters": { ... },
  "confidence": 0.0-1.0
}
`;

const buildPrompt = (userQuery: string, context: NLContext): string => {
  return `${SYSTEM_PROMPT}

Current context:
- Page: ${context.currentPage}
- Group: ${context.groupId || 'none'}
- User: ${context.userId}

User query: "${userQuery}"

Respond with structured JSON:`;
};
```

## Query Processing Engine

### GraphQL Query Builder

```typescript
class QueryBuilder {
  buildQuery(intent: Intent, parameters: ExtractedParameters): DocumentNode {
    switch (intent.entity) {
      case 'event':
        return this.buildEventQuery(intent.action, parameters);
      case 'group':
        return this.buildGroupQuery(intent.action, parameters);
      case 'match':
        return this.buildMatchQuery(intent.action, parameters);
      default:
        throw new Error(`Unsupported entity: ${intent.entity}`);
    }
  }

  private buildEventQuery(
    action: string,
    params: ExtractedParameters
  ): DocumentNode {
    if (action === 'list') {
      return gql`
        query GetEvents($filters: EventFilters) {
          events(filters: $filters) {
            id
            description
            date
            group {
              name
            }
            rsvps {
              status
              user {
                username
              }
            }
          }
        }
      `;
    }
    // ... other actions
  }
}
```

### Form Pre-population

```typescript
interface FormTemplate {
  entity: string;
  fields: FormField[];
}

interface FormField {
  name: string;
  type: 'text' | 'date' | 'select' | 'textarea';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

class FormPopulator {
  populateForm(intent: Intent, parameters: ExtractedParameters): PopulatedForm {
    const template = this.getFormTemplate(intent.entity);

    return {
      entity: intent.entity,
      action: intent.action,
      fields: template.fields.map((field) => ({
        ...field,
        value: this.extractFieldValue(field.name, parameters),
      })),
      confidence: intent.confidence,
    };
  }

  private extractFieldValue(
    fieldName: string,
    params: ExtractedParameters
  ): any {
    // Map natural language parameters to form fields
    const mapping: Record<string, string> = {
      name: 'data.name',
      description: 'data.description',
      date: 'data.date',
      time: 'data.time',
    };

    const paramPath = mapping[fieldName];
    return paramPath ? this.getNestedValue(params, paramPath) : null;
  }
}
```

## Frontend Components

### Natural Language Input Component

```typescript
interface NLInputProps {
  onQuery: (query: string) => void;
  onCommand: (command: string) => void;
  suggestions?: string[];
  loading?: boolean;
}

const NaturalLanguageInput: React.FC<NLInputProps> = ({
  onQuery,
  onCommand,
  suggestions,
  loading
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Determine if it's a query or command based on keywords
      const isCommand = /^(create|add|make|update|change|delete|remove)/i.test(input);

      if (isCommand) {
        onCommand(input);
      } else {
        onQuery(input);
      }

      setInput('');
    }
  };

  return (
    <div className="nl-input-container">
      <form onSubmit={handleSubmit} className="nl-input-form">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or give a command..."
            className="nl-input"
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading}>
            {loading ? <Spinner /> : <SendIcon />}
          </button>
        </div>
      </form>

      {showSuggestions && suggestions && (
        <SuggestionsList
          suggestions={suggestions}
          onSelect={(suggestion) => setInput(suggestion)}
        />
      )}
    </div>
  );
};
```

### Results Display Component

```typescript
interface ResultsDisplayProps {
  results: QueryResult[];
  type: 'query' | 'command';
  onAction?: (action: string, item: any) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  type,
  onAction
}) => {
  if (type === 'query') {
    return (
      <div className="query-results">
        {results.map((result, index) => (
          <ResultCard
            key={index}
            data={result.data}
            entity={result.entity}
            onAction={onAction}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="command-results">
      <FormPreview
        form={results[0]?.form}
        onSubmit={(data) => onAction?.('submit', data)}
        onCancel={() => onAction?.('cancel', null)}
      />
    </div>
  );
};
```

## Backend API Design

### Natural Language Processing Endpoint

```typescript
// GraphQL Schema Extension
extend type Mutation {
  processNaturalLanguage(input: NLInput!): NLResponse!
}

input NLInput {
  query: String!
  context: NLContext!
}

input NLContext {
  currentPage: String!
  groupId: String
  leagueId: String
  conversationHistory: [ConversationTurn!]
}

type NLResponse {
  type: NLResponseType!
  data: JSON
  form: FormData
  suggestions: [String!]
  error: String
}

enum NLResponseType {
  QUERY_RESULT
  FORM_PREPOPULATED
  NAVIGATION
  ERROR
  CLARIFICATION_NEEDED
}
```

### Processing Service

```typescript
class NaturalLanguageProcessor {
  async processInput(
    input: NLInput,
    context: RequestContext
  ): Promise<NLResponse> {
    try {
      // 1. Classify intent using LLM
      const intent = await this.classifyIntent(input.query, input.context);

      // 2. Extract parameters
      const parameters = await this.extractParameters(input.query, intent);

      // 3. Validate permissions
      await this.validatePermissions(intent, parameters, context.user);

      // 4. Process based on intent type
      switch (intent.type) {
        case IntentType.QUERY:
          return await this.processQuery(intent, parameters, context);
        case IntentType.CREATE:
        case IntentType.UPDATE:
          return await this.processCommand(intent, parameters, context);
        case IntentType.DELETE:
          return await this.processDelete(intent, parameters, context);
        default:
          throw new Error(`Unsupported intent type: ${intent.type}`);
      }
    } catch (error) {
      return {
        type: NLResponseType.ERROR,
        error: error.message,
        suggestions: this.generateErrorSuggestions(input.query),
      };
    }
  }

  private async classifyIntent(
    query: string,
    context: NLContext
  ): Promise<Intent> {
    const prompt = this.buildPrompt(query, context);
    const llmResponse = await this.llmProvider.generate(prompt);

    try {
      const parsed = JSON.parse(llmResponse);
      return {
        type: parsed.intent,
        entity: parsed.entity,
        action: parsed.action,
        confidence: parsed.confidence,
        parameters: parsed.parameters,
      };
    } catch (error) {
      throw new Error('Failed to parse LLM response');
    }
  }
}
```

## Context Management

### Conversation Context

```typescript
class ContextManager {
  private contexts = new Map<string, ConversationContext>();

  getContext(userId: string): ConversationContext {
    return this.contexts.get(userId) || this.createNewContext(userId);
  }

  updateContext(userId: string, turn: ConversationTurn): void {
    const context = this.getContext(userId);
    context.history.push(turn);

    // Keep only last 10 turns for performance
    if (context.history.length > 10) {
      context.history = context.history.slice(-10);
    }

    // Update current context based on the turn
    this.updateCurrentContext(context, turn);
  }

  private updateCurrentContext(
    context: ConversationContext,
    turn: ConversationTurn
  ): void {
    // Extract context from the turn
    if (turn.intent.entity === 'group' && turn.intent.parameters.groupId) {
      context.currentGroupId = turn.intent.parameters.groupId;
    }

    if (turn.intent.entity === 'league' && turn.intent.parameters.leagueId) {
      context.currentLeagueId = turn.intent.parameters.leagueId;
    }
  }
}
```

## Error Handling and Fallbacks

### Graceful Degradation

```typescript
class NLErrorHandler {
  async handleLLMFailure(
    query: string,
    context: NLContext
  ): Promise<NLResponse> {
    // Fallback to keyword-based processing
    const keywordIntent = this.keywordBasedClassification(query);

    if (keywordIntent) {
      return await this.processWithKeywords(keywordIntent, context);
    }

    // Ultimate fallback - suggest manual navigation
    return {
      type: NLResponseType.ERROR,
      error: 'Natural language processing is temporarily unavailable',
      suggestions: this.generateManualNavigationSuggestions(context),
    };
  }

  private keywordBasedClassification(query: string): Intent | null {
    const keywords = {
      events: ['event', 'meeting', 'practice', 'game'],
      groups: ['group', 'team', 'club'],
      matches: ['match', 'game', 'tournament'],
      create: ['create', 'add', 'make', 'new'],
      list: ['list', 'show', 'what', 'find'],
    };

    // Simple keyword matching as fallback
    for (const [entity, words] of Object.entries(keywords)) {
      if (words.some((word) => query.toLowerCase().includes(word))) {
        return {
          type: IntentType.QUERY,
          entity,
          action: 'list',
          confidence: 0.5,
          parameters: {},
        };
      }
    }

    return null;
  }
}
```

## Security and Privacy

### Data Filtering

```typescript
class DataFilter {
  filterForLLM(data: any, userPermissions: Permission[]): any {
    // Remove sensitive information before sending to LLM
    const filtered = { ...data };

    // Remove PII
    delete filtered.email;
    delete filtered.phone;
    delete filtered.passwordHash;

    // Filter based on permissions
    if (!userPermissions.includes(Permission.VIEW_PRIVATE_GROUPS)) {
      filtered.groups = filtered.groups?.filter((g: any) => g.isPublic);
    }

    return filtered;
  }

  validateQuery(intent: Intent, user: User): boolean {
    // Ensure user can only query data they have access to
    switch (intent.entity) {
      case 'group':
        return this.canAccessGroup(intent.parameters.groupId, user);
      case 'event':
        return this.canAccessEvent(intent.parameters.eventId, user);
      default:
        return true;
    }
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
class NLCache {
  private queryCache = new Map<string, CachedResult>();
  private intentCache = new Map<string, Intent>();

  async getCachedIntent(query: string): Promise<Intent | null> {
    const normalized = this.normalizeQuery(query);
    return this.intentCache.get(normalized) || null;
  }

  cacheIntent(query: string, intent: Intent): void {
    const normalized = this.normalizeQuery(query);
    this.intentCache.set(normalized, intent);

    // Expire after 1 hour
    setTimeout(() => {
      this.intentCache.delete(normalized);
    }, 3600000);
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('NaturalLanguageProcessor', () => {
  it('should classify event queries correctly', async () => {
    const processor = new NaturalLanguageProcessor();
    const intent = await processor.classifyIntent(
      'What events do I have this week?',
      { currentPage: '/dashboard', userId: 'user1' }
    );

    expect(intent.type).toBe(IntentType.QUERY);
    expect(intent.entity).toBe('event');
    expect(intent.action).toBe('list');
  });

  it('should extract date parameters correctly', async () => {
    const processor = new NaturalLanguageProcessor();
    const parameters = await processor.extractParameters(
      'Create an event for tomorrow at 6 PM',
      { type: IntentType.CREATE, entity: 'event' }
    );

    expect(parameters.data.date).toBeDefined();
    expect(parameters.data.time).toBe('18:00');
  });
});
```

### Integration Tests

```typescript
describe('Natural Language API', () => {
  it('should process queries end-to-end', async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `
          mutation {
            processNaturalLanguage(input: {
              query: "Show me my tennis matches"
              context: { currentPage: "/tennis", userId: "user1" }
            }) {
              type
              data
            }
          }
        `,
      });

    expect(response.body.data.processNaturalLanguage.type).toBe('QUERY_RESULT');
  });
});
```

This design provides a comprehensive natural language interface that integrates seamlessly with the existing Groups platform while maintaining security, performance, and user experience standards.
