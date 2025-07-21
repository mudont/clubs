import { useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { GET_MY_GROUPS } from '../../graphql/Group';
import Header from '../common/Header';

import { ExpenseForm } from './index';

interface Group {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  memberships: {
    id: string;
    isAdmin: boolean;
    memberId: number;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }[];
}

interface MyGroupsData {
  myGroups: Group[];
}



const AddExpensePage: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const navigate = useNavigate();

  const { data: myGroupsData, loading: myGroupsLoading } = useQuery<MyGroupsData>(GET_MY_GROUPS);

  const handleExpenseAdded = () => {
    navigate('/expenses');
  };

  const handleCancel = () => {
    navigate('/expenses');
  };

  return (
    <div className="add-expense-page">
      <Header title="Add New Expense">
        <Link to="/expenses" className="btn-secondary">
          Back to Expenses
        </Link>
      </Header>

      <main className="add-expense-content">
        {!selectedGroupId ? (
          /* Group Selection */
          <div className="group-selection">
            <h2>Select a Group</h2>
            <p className="section-description">
              Choose which group to add the expense to
            </p>

            {myGroupsLoading ? (
              <div className="loading">Loading your groups...</div>
            ) : myGroupsData?.myGroups?.length === 0 ? (
              <div className="empty-state">
                <h3>No groups available</h3>
                <p>You need to be a member of a group to add expenses</p>
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="groups-grid">
                {myGroupsData?.myGroups?.map((group) => (
                  <button
                    key={group.id}
                    className="group-card selectable"
                    onClick={() => setSelectedGroupId(group.id)}
                    type="button"
                  >
                    <div className="group-info">
                      <h3>{group.name}</h3>
                      <p className="group-description">
                        {group.description || 'No description available.'}
                      </p>
                      <div className="group-meta">
                        <span className="member-count">
                          {group.memberships?.length || 0} members
                        </span>
                      </div>
                    </div>
                    <div className="group-actions">
                      <span className="btn-select-group">
                        Select Group
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Expense Form */
          <div className="expense-form-section">
            <h2>Add New Expense</h2>
            <p className="section-description">
              Add expense details and split information
            </p>
            <ExpenseForm
              groupId={selectedGroupId}
              onSuccess={handleExpenseAdded}
              onCancel={handleCancel}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default AddExpensePage;
