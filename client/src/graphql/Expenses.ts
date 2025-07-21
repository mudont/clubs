import { gql } from '@apollo/client';

// ===== EXPENSE QUERIES =====

export const GET_GROUP_EXPENSES = gql`
  query GetGroupExpenses($groupId: ID!, $limit: Int) {
    groupExpenses(groupId: $groupId, limit: $limit) {
      id
      description
      amount
      currency
      category
      date
      receiptUrl
      splitType
      createdAt
      updatedAt
      paidBy {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
      splits {
        id
        amount
        percentage
        shares
        createdAt
        user {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

export const GET_EXPENSE = gql`
  query GetExpense($id: ID!) {
    expense(id: $id) {
      id
      description
      amount
      currency
      category
      date
      receiptUrl
      splitType
      createdAt
      updatedAt
      paidBy {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
      splits {
        id
        amount
        percentage
        shares
        createdAt
        user {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

export const GET_USER_EXPENSES = gql`
  query GetUserExpenses($userId: ID!) {
    userExpenses(userId: $userId) {
      id
      description
      amount
      currency
      category
      date
      receiptUrl
      splitType
      createdAt
      updatedAt
      paidBy {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
      splits {
        id
        amount
        percentage
        shares
        createdAt
        user {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

// ===== SETTLEMENT QUERIES =====

export const GET_GROUP_SETTLEMENTS = gql`
  query GetGroupSettlements($groupId: ID!) {
    groupSettlements(groupId: $groupId) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;

export const GET_USER_SETTLEMENTS = gql`
  query GetUserSettlements($userId: ID!) {
    userSettlements(userId: $userId) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;

// ===== DEBT QUERIES =====

export const GET_GROUP_DEBT_SUMMARY = gql`
  query GetGroupDebtSummary($groupId: ID!) {
    groupDebtSummary(groupId: $groupId) {
      user {
        id
        username
        firstName
        lastName
      }
      totalOwed
      totalOwedTo
      netAmount
      debts {
        toUser {
          id
          username
          firstName
          lastName
        }
        amount
        currency
      }
    }
  }
`;

export const GET_USER_DEBT_SUMMARY = gql`
  query GetUserDebtSummary($userId: ID!, $groupId: ID!) {
    userDebtSummary(userId: $userId, groupId: $groupId) {
      user {
        id
        username
        firstName
        lastName
      }
      totalOwed
      totalOwedTo
      netAmount
      debts {
        toUser {
          id
          username
          firstName
          lastName
        }
        amount
        currency
      }
    }
  }
`;

export const GET_OPTIMAL_SETTLEMENTS = gql`
  query GetOptimalSettlements($groupId: ID!) {
    optimalSettlements(groupId: $groupId) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;

// ===== SETTINGS QUERIES =====

export const GET_GROUP_SETTINGS = gql`
  query GetGroupSettings($groupId: ID!) {
    groupSettings(groupId: $groupId) {
      id
      defaultCurrency
      allowExpenses
      expenseLimit
      requireApproval
      autoSettle
      createdAt
      updatedAt
      group {
        id
        name
      }
    }
  }
`;

// ===== EXPENSE MUTATIONS =====

export const CREATE_EXPENSE = gql`
  mutation CreateExpense($input: CreateExpenseInput!) {
    createExpense(input: $input) {
      id
      description
      amount
      currency
      category
      date
      receiptUrl
      splitType
      createdAt
      updatedAt
      paidBy {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
      splits {
        id
        amount
        percentage
        shares
        createdAt
        user {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

export const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: ID!, $input: UpdateExpenseInput!) {
    updateExpense(id: $id, input: $input) {
      id
      description
      amount
      currency
      category
      date
      receiptUrl
      splitType
      createdAt
      updatedAt
      paidBy {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
      splits {
        id
        amount
        percentage
        shares
        createdAt
        user {
          id
          username
          firstName
          lastName
        }
      }
    }
  }
`;

export const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: ID!) {
    deleteExpense(id: $id)
  }
`;

// ===== SETTLEMENT MUTATIONS =====

export const CREATE_SETTLEMENT = gql`
  mutation CreateSettlement($input: CreateSettlementInput!) {
    createSettlement(input: $input) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;

export const UPDATE_SETTLEMENT = gql`
  mutation UpdateSettlement($id: ID!, $input: UpdateSettlementInput!) {
    updateSettlement(id: $id, input: $input) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;

export const MARK_SETTLEMENT_PAID = gql`
  mutation MarkSettlementPaid($id: ID!, $input: MarkSettlementPaidInput!) {
    markSettlementPaid(id: $id, input: $input) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;

export const DELETE_SETTLEMENT = gql`
  mutation DeleteSettlement($id: ID!) {
    deleteSettlement(id: $id)
  }
`;

// ===== SETTINGS MUTATIONS =====

export const UPDATE_GROUP_SETTINGS = gql`
  mutation UpdateGroupSettings($groupId: ID!, $input: UpdateGroupSettingsInput!) {
    updateGroupSettings(groupId: $groupId, input: $input) {
      id
      defaultCurrency
      allowExpenses
      expenseLimit
      requireApproval
      autoSettle
      createdAt
      updatedAt
      group {
        id
        name
      }
    }
  }
`;

// ===== UTILITY MUTATIONS =====

export const GENERATE_OPTIMAL_SETTLEMENTS = gql`
  mutation GenerateOptimalSettlements($groupId: ID!) {
    generateOptimalSettlements(groupId: $groupId) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;

export const BULK_CREATE_SETTLEMENTS = gql`
  mutation BulkCreateSettlements($input: BulkCreateSettlementsInput!) {
    bulkCreateSettlements(input: $input) {
      id
      amount
      currency
      status
      paymentMethod
      notes
      paidAt
      createdAt
      updatedAt
      fromUser {
        id
        username
        firstName
        lastName
      }
      toUser {
        id
        username
        firstName
        lastName
      }
      group {
        id
        name
      }
    }
  }
`;
