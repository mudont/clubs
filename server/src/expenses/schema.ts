import gql from 'graphql-tag';

export const expensesTypeDefs = gql`
  # ===== EXPENSES MODULE TYPES =====

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

  # ===== EXPENSES MODULE INPUTS =====

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
    paidBy: ID!
  }

  input UpdateExpenseInput {
    description: String
    amount: Float
    currency: String
    category: String
    date: DateTime
    receiptUrl: String
    splitType: SplitType
    splits: [ExpenseSplitInput!]
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

  input UpdateSettlementInput {
    amount: Float
    currency: String
    status: SettlementStatus
    paymentMethod: PaymentMethod
    notes: String
  }

  input MarkSettlementPaidInput {
    paymentMethod: PaymentMethod!
    notes: String
  }

  input UpdateGroupSettingsInput {
    defaultCurrency: String
    allowExpenses: Boolean
    expenseLimit: Float
    requireApproval: Boolean
    autoSettle: Boolean
  }

  input BulkCreateSettlementsInput {
    groupId: ID!
    settlements: [CreateSettlementInput!]!
  }

  # ===== EXPENSES MODULE QUERIES =====

  extend type Query {
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

  # ===== EXPENSES MODULE MUTATIONS =====

  extend type Mutation {
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
`;
