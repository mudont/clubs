# Splitwise-like Payment System Plan

## Overview
A comprehensive payment splitting and settlement system for groups, allowing members to track shared expenses, split bills, and settle debts efficiently.

## Core Features

### 1. Expense Tracking
- **Create Expenses**: Add expenses with description, amount, date, and category
- **Split Options**: Equal, percentage, custom amounts, or by shares
- **Categories**: Food, Transport, Entertainment, Utilities, etc.
- **Receipt Upload**: Optional image upload for receipts
- **Currency Support**: Multi-currency support with exchange rates

### 2. Payment Splitting
- **Equal Split**: Divide expense equally among all members
- **Percentage Split**: Split based on custom percentages
- **Custom Amounts**: Specify exact amounts for each person
- **Shares Split**: Split by shares (e.g., 2 shares for couples)
- **Exclude Members**: Option to exclude certain members from specific expenses

### 3. Settlement System
- **Debt Calculation**: Automatic calculation of who owes what to whom
- **Simplified Settlements**: Minimize number of transactions needed
- **Payment Methods**: Cash, bank transfer, digital wallets
- **Payment Status**: Track paid/unpaid settlements
- **Payment History**: Complete audit trail of all payments

### 4. Group Management
- **Group Currencies**: Set default currency per group
- **Member Permissions**: Control who can add expenses
- **Expense Limits**: Optional spending limits per member
- **Budget Tracking**: Monthly/yearly budget tracking

## Database Schema Design

### Core Tables

#### 1. Expense
```sql
model Expense {
  id          String   @id @default(uuid())
  groupId     String   @map("group_id")
  group       Group    @relation(fields: [groupId], references: [id])
  paidBy      String   @map("paid_by")
  paidByUser  User     @relation("ExpensePaidBy", fields: [paidBy], references: [id])
  description String
  amount      Decimal  @db.Decimal(10,2)
  currency    String   @default("USD")
  category    String   @default("General")
  date        DateTime
  receiptUrl  String?  @map("receipt_url")
  splitType   SplitType
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relations
  splits      ExpenseSplit[]
  settlements Settlement[]

  @@map("expenses")
}
```

#### 2. ExpenseSplit
```sql
model ExpenseSplit {
  id        String   @id @default(uuid())
  expenseId String   @map("expense_id")
  expense   Expense  @relation(fields: [expenseId], references: [id])
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id])
  amount    Decimal  @db.Decimal(10,2)
  percentage Decimal? @db.Decimal(5,2)
  shares    Int?     @default(1)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([expenseId, userId])
  @@map("expense_splits")
}
```

#### 3. Settlement
```sql
model Settlement {
  id            String        @id @default(uuid())
  groupId       String        @map("group_id")
  group         Group         @relation(fields: [groupId], references: [id])
  fromUserId    String        @map("from_user_id")
  fromUser      User          @relation("SettlementFrom", fields: [fromUserId], references: [id])
  toUserId      String        @map("to_user_id")
  toUser        User          @relation("SettlementTo", fields: [toUserId], references: [id])
  amount        Decimal       @db.Decimal(10,2)
  currency      String        @default("USD")
  status        SettlementStatus @default("PENDING")
  paymentMethod PaymentMethod?
  notes         String?
  paidAt        DateTime?     @map("paid_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  @@map("settlements")
}
```

#### 4. GroupSettings
```sql
model GroupSettings {
  id                String   @id @default(uuid())
  groupId           String   @unique @map("group_id")
  group             Group    @relation(fields: [groupId], references: [id])
  defaultCurrency   String   @default("USD") @map("default_currency")
  allowExpenses     Boolean  @default(true) @map("allow_expenses")
  expenseLimit      Decimal? @db.Decimal(10,2) @map("expense_limit")
  requireApproval   Boolean  @default(false) @map("require_approval")
  autoSettle        Boolean  @default(false) @map("auto_settle")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("group_settings")
}
```

### Enums
```sql
enum SplitType {
  EQUAL
  PERCENTAGE
  CUSTOM
  SHARES
}

enum SettlementStatus {
  PENDING
  PAID
  CANCELLED
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  PAYPAL
  VENMO
  CASH_APP
  OTHER
}
```

### Updated Existing Models

#### User Model (Additions)
```sql
model User {
  // ... existing fields ...

  // Payment relations
  expensesPaid     Expense[]     @relation("ExpensePaidBy")
  expenseSplits    ExpenseSplit[]
  settlementsFrom  Settlement[]  @relation("SettlementFrom")
  settlementsTo    Settlement[]  @relation("SettlementTo")
}
```

#### Group Model (Additions)
```sql
model Group {
  // ... existing fields ...

  // Payment relations
  expenses         Expense[]
  settlements      Settlement[]
  settings         GroupSettings?
}
```

## GraphQL Schema

### Types
```graphql
type Expense {
  id: ID!
  group: Group!
  paidBy: User!
  description: String!
  amount: Float!
  currency: String!
  category: String!
  date: DateTime!
  receiptUrl: String
  splitType: SplitType!
  splits: [ExpenseSplit!]!
  settlements: [Settlement!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ExpenseSplit {
  id: ID!
  expense: Expense!
  user: User!
  amount: Float!
  percentage: Float
  shares: Int
  createdAt: DateTime!
}

type Settlement {
  id: ID!
  group: Group!
  fromUser: User!
  toUser: User!
  amount: Float!
  currency: String!
  status: SettlementStatus!
  paymentMethod: PaymentMethod
  notes: String
  paidAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type GroupSettings {
  id: ID!
  group: Group!
  defaultCurrency: String!
  allowExpenses: Boolean!
  expenseLimit: Float
  requireApproval: Boolean!
  autoSettle: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type DebtSummary {
  user: User!
  totalOwed: Float!
  totalOwedTo: Float!
  netAmount: Float! # positive = owed to others, negative = owed by others
  debts: [DebtDetail!]!
}

type DebtDetail {
  toUser: User!
  amount: Float!
  currency: String!
}

enum SplitType {
  EQUAL
  PERCENTAGE
  CUSTOM
  SHARES
}

enum SettlementStatus {
  PENDING
  PAID
  CANCELLED
}

enum PaymentMethod {
  CASH
  BANK_TRANSFER
  PAYPAL
  VENMO
  CASH_APP
  OTHER
}
```

### Queries
```graphql
type Query {
  # Expense queries
  groupExpenses(groupId: ID!, limit: Int = 50): [Expense!]!
  expense(id: ID!): Expense
  userExpenses(userId: ID!): [Expense!]!

  # Settlement queries
  groupSettlements(groupId: ID!): [Settlement!]!
  userSettlements(userId: ID!): [Settlement!]!

  # Debt queries
  groupDebtSummary(groupId: ID!): [DebtSummary!]!
  userDebtSummary(userId: ID!, groupId: ID!): DebtSummary
  optimalSettlements(groupId: ID!): [Settlement!]!

  # Settings queries
  groupSettings(groupId: ID!): GroupSettings
}
```

### Mutations
```graphql
type Mutation {
  # Expense mutations
  createExpense(input: CreateExpenseInput!): Expense!
  updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
  deleteExpense(id: ID!): Boolean!

  # Settlement mutations
  createSettlement(input: CreateSettlementInput!): Settlement!
  updateSettlement(id: ID!, input: UpdateSettlementInput!): Settlement!
  markSettlementPaid(id: ID!, input: MarkSettlementPaidInput!): Settlement!
  deleteSettlement(id: ID!): Boolean!

  # Settings mutations
  updateGroupSettings(groupId: ID!, input: UpdateGroupSettingsInput!): GroupSettings!

  # Utility mutations
  generateOptimalSettlements(groupId: ID!): [Settlement!]!
  bulkCreateSettlements(input: BulkCreateSettlementsInput!): [Settlement!]!
}
```

### Input Types
```graphql
input CreateExpenseInput {
  groupId: ID!
  description: String!
  amount: Float!
  currency: String!
  category: String!
  date: DateTime!
  receiptUrl: String
  splitType: SplitType!
  splits: [ExpenseSplitInput!]!
}

input ExpenseSplitInput {
  userId: ID!
  amount: Float
  percentage: Float
  shares: Int
}

input CreateSettlementInput {
  groupId: ID!
  fromUserId: ID!
  toUserId: ID!
  amount: Float!
  currency: String!
  paymentMethod: PaymentMethod
  notes: String
}

input UpdateGroupSettingsInput {
  defaultCurrency: String
  allowExpenses: Boolean
  expenseLimit: Float
  requireApproval: Boolean
  autoSettle: Boolean
}
```

## Business Logic

### 1. Expense Creation
```typescript
async function createExpense(input: CreateExpenseInput) {
  // Validate total splits equal expense amount
  const totalSplit = input.splits.reduce((sum, split) => sum + split.amount, 0);
  if (Math.abs(totalSplit - input.amount) > 0.01) {
    throw new Error('Split amounts must equal expense amount');
  }

  // Create expense and splits
  const expense = await prisma.expense.create({
    data: {
      ...input,
      splits: {
        create: input.splits
      }
    },
    include: {
      splits: { include: { user: true } },
      paidBy: true
    }
  });

  // Auto-generate settlements if enabled
  if (input.autoSettle) {
    await generateOptimalSettlements(input.groupId);
  }

  return expense;
}
```

### 2. Debt Calculation
```typescript
async function calculateDebts(groupId: string) {
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      splits: { include: { user: true } },
      paidBy: true
    }
  });

  const debts = new Map<string, Map<string, number>>();

  for (const expense of expenses) {
    const paidBy = expense.paidBy.id;

    for (const split of expense.splits) {
      const userId = split.user.id;
      if (userId === paidBy) continue;

      // Initialize debt tracking
      if (!debts.has(userId)) debts.set(userId, new Map());
      if (!debts.has(paidBy)) debts.set(paidBy, new Map());

      // Track debt from user to paidBy
      const userDebts = debts.get(userId)!;
      userDebts.set(paidBy, (userDebts.get(paidBy) || 0) + split.amount);
    }
  }

  return debts;
}
```

### 3. Optimal Settlement Generation
```typescript
async function generateOptimalSettlements(groupId: string) {
  const debts = await calculateDebts(groupId);
  const settlements: Settlement[] = [];

  // Use graph algorithm to minimize number of transactions
  const netAmounts = new Map<string, number>();

  // Calculate net amounts for each user
  for (const [userId, userDebts] of debts) {
    let net = 0;

    // Subtract what user owes
    for (const [toUser, amount] of userDebts) {
      net -= amount;
    }

    // Add what others owe to user
    for (const [otherUser, otherDebts] of debts) {
      if (otherUser !== userId) {
        net += otherDebts.get(userId) || 0;
      }
    }

    netAmounts.set(userId, net);
  }

  // Generate minimal settlements
  const creditors = Array.from(netAmounts.entries())
    .filter(([_, net]) => net > 0)
    .sort((a, b) => b[1] - a[1]);

  const debtors = Array.from(netAmounts.entries())
    .filter(([_, net]) => net < 0)
    .sort((a, b) => a[1] - b[1]);

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const [creditorId, creditorAmount] = creditors[creditorIndex];
    const [debtorId, debtorAmount] = debtors[debtorIndex];

    const settlementAmount = Math.min(creditorAmount, Math.abs(debtorAmount));

    if (settlementAmount > 0.01) {
      settlements.push({
        fromUserId: debtorId,
        toUserId: creditorId,
        amount: settlementAmount,
        status: 'PENDING'
      });
    }

    // Update remaining amounts
    creditors[creditorIndex][1] -= settlementAmount;
    debtors[debtorIndex][1] += settlementAmount;

    if (creditors[creditorIndex][1] < 0.01) creditorIndex++;
    if (debtors[debtorIndex][1] > -0.01) debtorIndex++;
  }

  return settlements;
}
```

## Frontend Components

### 1. Expense Form
```typescript
interface ExpenseFormProps {
  groupId: string;
  onSubmit: (expense: CreateExpenseInput) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ groupId, onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'General',
    splitType: 'EQUAL' as SplitType,
    splits: []
  });

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="number"
        placeholder="Amount"
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
      />
      <select
        value={formData.splitType}
        onChange={(e) => setFormData({...formData, splitType: e.target.value as SplitType})}
      >
        <option value="EQUAL">Split Equally</option>
        <option value="PERCENTAGE">Split by Percentage</option>
        <option value="CUSTOM">Custom Amounts</option>
        <option value="SHARES">Split by Shares</option>
      </select>
      <SplitSelector
        groupId={groupId}
        splitType={formData.splitType}
        totalAmount={formData.amount}
        onChange={(splits) => setFormData({...formData, splits})}
      />
      <button type="submit">Add Expense</button>
    </form>
  );
};
```

### 2. Debt Summary
```typescript
const DebtSummary: React.FC<{ groupId: string }> = ({ groupId }) => {
  const { data: debtSummary } = useQuery(GET_GROUP_DEBT_SUMMARY, {
    variables: { groupId }
  });

  return (
    <div className="debt-summary">
      <h3>Debt Summary</h3>
      {debtSummary?.map((debt: DebtSummary) => (
        <div key={debt.user.id} className="debt-item">
          <span>{debt.user.username}</span>
          <span className={debt.netAmount > 0 ? 'owed' : 'owes'}>
            {debt.netAmount > 0
              ? `Owed: $${debt.netAmount.toFixed(2)}`
              : `Owes: $${Math.abs(debt.netAmount).toFixed(2)}`
            }
          </span>
        </div>
      ))}
    </div>
  );
};
```

### 3. Settlement List
```typescript
const SettlementList: React.FC<{ groupId: string }> = ({ groupId }) => {
  const { data: settlements } = useQuery(GET_GROUP_SETTLEMENTS, {
    variables: { groupId }
  });

  const [markPaid] = useMutation(MARK_SETTLEMENT_PAID);

  return (
    <div className="settlement-list">
      <h3>Settlements</h3>
      {settlements?.map((settlement: Settlement) => (
        <div key={settlement.id} className="settlement-item">
          <span>{settlement.fromUser.username} → {settlement.toUser.username}</span>
          <span>${settlement.amount}</span>
          <span className={`status ${settlement.status.toLowerCase()}`}>
            {settlement.status}
          </span>
          {settlement.status === 'PENDING' && (
            <button onClick={() => markPaid({ variables: { id: settlement.id } })}>
              Mark Paid
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
```

## Implementation Phases

### Phase 1: Core Database & Basic CRUD
1. **Database Migration**: Add expense, expense_split, settlement tables
2. **GraphQL Schema**: Basic types, queries, and mutations
3. **Basic Resolvers**: Create, read, update, delete operations
4. **Simple Frontend**: Basic expense form and list

### Phase 2: Split Logic & Debt Calculation
1. **Split Algorithms**: Implement different split types
2. **Debt Calculation**: Calculate who owes what to whom
3. **Validation**: Ensure split amounts equal expense amounts
4. **Frontend Split Selector**: UI for choosing split methods

### Phase 3: Settlement System
1. **Settlement Generation**: Optimal settlement algorithm
2. **Payment Tracking**: Mark settlements as paid
3. **Settlement UI**: List and manage settlements
4. **Payment Methods**: Support different payment types

### Phase 4: Advanced Features
1. **Categories & Budgets**: Expense categorization and limits
2. **Receipt Upload**: Image upload for receipts
3. **Currency Support**: Multi-currency with exchange rates
4. **Notifications**: Payment reminders and updates
5. **Reports**: Monthly/yearly expense reports

### Phase 5: Optimization & Polish
1. **Performance**: Optimize queries and caching
2. **Mobile UI**: Responsive design improvements
3. **Export**: CSV/PDF export of expenses
4. **Integration**: Connect with payment services

## Technical Considerations

### 1. Data Integrity
- **Decimal Precision**: Use Decimal type for currency amounts
- **Foreign Key Constraints**: Ensure referential integrity
- **Validation**: Server-side validation of all inputs
- **Transactions**: Use database transactions for complex operations

### 2. Performance
- **Indexing**: Index on groupId, userId, date fields
- **Pagination**: Implement cursor-based pagination for large datasets
- **Caching**: Cache debt calculations and frequently accessed data
- **Optimization**: Use efficient algorithms for settlement generation

### 3. Security
- **Authorization**: Check user permissions for all operations
- **Input Validation**: Sanitize all user inputs
- **Rate Limiting**: Prevent abuse of expense creation
- **Audit Trail**: Log all financial transactions

### 4. Scalability
- **Database Design**: Optimize for read-heavy workloads
- **API Design**: RESTful GraphQL endpoints
- **Caching Strategy**: Redis for session and cache data
- **Monitoring**: Track performance and usage metrics

## Testing Strategy

### 1. Unit Tests
- **Split Algorithms**: Test all split types with edge cases
- **Debt Calculation**: Verify correct debt calculations
- **Settlement Generation**: Test optimal settlement algorithm
- **Validation**: Test input validation and error handling

### 2. Integration Tests
- **Database Operations**: Test CRUD operations with real database
- **GraphQL Resolvers**: Test complete resolver chains
- **Authentication**: Test authorization and permissions
- **Error Handling**: Test error scenarios and edge cases

### 3. End-to-End Tests
- **User Flows**: Complete expense creation and settlement flows
- **Multi-User Scenarios**: Test group interactions
- **Data Consistency**: Verify data integrity across operations
- **Performance**: Test with realistic data volumes

## Success Metrics

### 1. User Engagement
- **Active Users**: Number of users creating expenses monthly
- **Expense Volume**: Total expenses created per group
- **Settlement Rate**: Percentage of settlements completed
- **Feature Adoption**: Usage of different split types

### 2. Technical Performance
- **Response Time**: API response times under 200ms
- **Uptime**: 99.9% system availability
- **Error Rate**: Less than 1% error rate
- **Database Performance**: Query execution times

### 3. Business Impact
- **User Satisfaction**: Positive feedback on payment splitting
- **Group Activity**: Increased group engagement
- **Feature Usage**: Adoption of advanced features
- **Retention**: User retention after implementing payments

This comprehensive plan provides a solid foundation for implementing a Splitwise-like payment system that integrates seamlessly with your existing clubs application architecture.
