import { useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { GET_USER_EXPENSES } from '../../graphql/Expenses';
import { ME_QUERY } from '../../graphql/User';
import Header from '../common/Header';

import { ExpenseForm } from './index';

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  splitType: string;
  paidBy: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  group: {
    id: string;
    name: string;
  };
  splits: {
    id: string;
    amount: number;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

interface UserExpensesData {
  userExpenses: Expense[];
}

interface MeData {
  me: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const ExpensesPage: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: meData } = useQuery<MeData>(ME_QUERY);
  const { data: userExpensesData, loading: userExpensesLoading, refetch } = useQuery<UserExpensesData>(GET_USER_EXPENSES, {
    variables: { userId: meData?.me?.id || '' },
    skip: !meData?.me?.id
  });

  const userExpenses = userExpensesData?.userExpenses || [];
  const totalExpenses = userExpenses.length;
  const totalAmount = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Group expenses by group
  const expensesByGroup = userExpenses.reduce((acc, expense) => {
    const groupId = expense.group.id;
    if (!acc[groupId]) {
      acc[groupId] = {
        group: expense.group,
        expenses: [],
        totalAmount: 0
      };
    }
    acc[groupId].expenses.push(expense);
    acc[groupId].totalAmount += expense.amount;
    return acc;
  }, {} as Record<string, { group: { id: string; name: string }; expenses: Expense[]; totalAmount: number }>);

  const handleExpenseAdded = () => {
    setShowAddForm(false);
    refetch();
  };

  return (
    <div className="expenses-page">
      <Header title="Expenses">
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add New Expense'}
        </button>
        <Link to="/dashboard" className="btn-secondary">
          Back to Dashboard
        </Link>
      </Header>

      <main className="expenses-content">
        {showAddForm && (
          <div className="add-expense-section">
            <h2>Add New Expense</h2>
            <ExpenseForm
              groupId=""
              onSuccess={handleExpenseAdded}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {!userExpensesLoading && (
          <>
            {/* Expenses Overview */}
            <section className="expenses-overview">
              <h2>Expenses Overview</h2>
              <div className="overview-stats">
                <div className="stat-card">
                  <span className="stat-label">Total Expenses</span>
                  <span className="stat-value">{totalExpenses}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Amount</span>
                  <span className="stat-value">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Groups with Expenses</span>
                  <span className="stat-value">{Object.keys(expensesByGroup).length}</span>
                </div>
              </div>
            </section>

            {/* All Expenses List */}
            <section className="all-expenses">
              <h2>All Expenses</h2>
              {totalExpenses === 0 ? (
                <div className="empty-state">
                  <h3>No expenses yet</h3>
                  <p>Start tracking shared expenses with your groups</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary"
                  >
                    💰 Add Your First Expense
                  </button>
                </div>
              ) : (
                <div className="expenses-list">
                  {userExpenses.map((expense) => (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-info">
                        <h4>{expense.description}</h4>
                        <p className="expense-meta">
                          {expense.group.name} • {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </p>
                        <p className="expense-amount">
                          ${expense.amount.toFixed(2)} {expense.currency}
                        </p>
                      </div>
                      <div className="expense-details">
                        <span className="paid-by">Paid by {expense.paidBy.firstName || expense.paidBy.username}</span>
                        <span className="split-type">{expense.splitType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Group Breakdown */}
            {Object.keys(expensesByGroup).length > 0 && (
              <section className="group-breakdown">
                <h2>Expenses by Group</h2>
                <div className="group-expenses-grid">
                  {Object.values(expensesByGroup).map(({ group, expenses, totalAmount }) => (
                    <div key={group.id} className="group-expense-card">
                      <h4>{group.name}</h4>
                      <div className="group-expense-stats">
                        <span>{expenses.length} expenses</span>
                        <span className="total-amount">${totalAmount.toFixed(2)}</span>
                      </div>
                      <Link to={`/expenses/group/${group.id}`} className="btn-link">
                        View Group Expenses
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}


          </>
        )}

        {userExpensesLoading && (
          <div className="loading">
            Loading expenses...
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpensesPage;
