import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';

import { CREATE_EXPENSE, GET_GROUP_EXPENSES, UPDATE_EXPENSE } from '../../graphql/Expenses';
import { GET_GROUP_MEMBERS } from '../../graphql/Group';
import { ME_QUERY } from '../../graphql/User';

interface ExpenseFormProps {
  groupId: string;
  expense?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface SplitInput {
  userId: string;
  amount?: number;
  percentage?: number;
  shares?: number;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Travel',
  'Healthcare',
  'Education',
  'General',
];

const SPLIT_TYPES = [
  { value: 'EQUAL', label: 'Split Equally' },
  { value: 'PERCENTAGE', label: 'Split by Percentage' },
  { value: 'CUSTOM', label: 'Custom Amounts' },
  { value: 'SHARES', label: 'Split by Shares' },
];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  groupId,
  expense,
  onSuccess,
  onCancel,
}) => {
  const { data: meData } = useQuery(ME_QUERY);
  const [paidBy, setPaidBy] = useState<string>('');

  const [formData, setFormData] = useState({
    description: expense?.description || '',
    amount: expense?.amount || 0,
    currency: expense?.currency || 'USD',
    category: expense?.category || 'General',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    receiptUrl: expense?.receiptUrl || '',
    splitType: expense?.splitType || 'EQUAL',
  });

  const [splits, setSplits] = useState<SplitInput[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Get group members
  const { data: membersData } = useQuery(GET_GROUP_MEMBERS, {
    variables: { groupId },
  });

  const [createExpense] = useMutation(CREATE_EXPENSE, {
    refetchQueries: [{ query: GET_GROUP_EXPENSES, variables: { groupId } }],
  });

  const [updateExpense] = useMutation(UPDATE_EXPENSE, {
    refetchQueries: [{ query: GET_GROUP_EXPENSES, variables: { groupId } }],
  });

  // Initialize splits when members data is available
  useEffect(() => {
    if (membersData?.group?.memberships && !expense) {
      const initialSplits: SplitInput[] = membersData.group.memberships.map((membership: any) => ({
        userId: membership.user.id,
        amount: 0,
        percentage: 0,
        shares: 1,
      }));
      setSplits(initialSplits);
    } else if (expense?.splits) {
      setSplits(expense.splits.map((split: any) => ({
        userId: split.user.id,
        amount: split.amount,
        percentage: split.percentage,
        shares: split.shares,
      })));
    }
  }, [membersData, expense]);

  // Set default paidBy to current user when data is loaded
  useEffect(() => {
    if (meData?.me && membersData?.group?.memberships) {
      // If editing, use the expense's paidBy, else default to current user
      if (expense?.paidBy?.id) {
        setPaidBy(expense.paidBy.id);
      } else {
        setPaidBy(meData.me.id);
      }
    }
  }, [meData, membersData, expense]);

  // Calculate splits based on split type
  useEffect(() => {
    if (!membersData?.group?.memberships || splits.length === 0) return;

    const memberCount = membersData.group.memberships.length;
    const totalAmount = formData.amount;

    if (formData.splitType === 'EQUAL') {
      const equalAmount = totalAmount / memberCount;
      setSplits(splits.map(split => ({
        ...split,
        amount: equalAmount,
        percentage: (equalAmount / totalAmount) * 100,
        shares: 1,
      })));
    } else if (formData.splitType === 'PERCENTAGE') {
      const equalPercentage = 100 / memberCount;
      setSplits(splits.map(split => ({
        ...split,
        amount: (equalPercentage / 100) * totalAmount,
        percentage: equalPercentage,
        shares: 1,
      })));
    } else if (formData.splitType === 'SHARES') {
      const totalShares = splits.reduce((sum, split) => sum + (split.shares || 1), 0);
      setSplits(splits.map(split => ({
        ...split,
        amount: ((split.shares || 1) / totalShares) * totalAmount,
        percentage: ((split.shares || 1) / totalShares) * 100,
      })));
    }
  }, [formData.splitType, formData.amount, membersData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSplitChange = (userId: string, field: string, value: number) => {
    setSplits(prev => prev.map(split =>
      split.userId === userId ? { ...split, [field]: value } : split
    ));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }

    if (formData.amount <= 0) {
      newErrors.push('Amount must be greater than 0');
    }

    if (formData.splitType === 'CUSTOM') {
      const totalSplit = splits.reduce((sum, split) => sum + (split.amount || 0), 0);
      if (Math.abs(totalSplit - formData.amount) > 0.01) {
        newErrors.push('Split amounts must equal the total amount');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Convert date string to ISO DateTime
      const dateTime = new Date(formData.date + 'T00:00:00.000Z').toISOString();

      const input = {
        ...formData,
        date: dateTime,
        groupId,
        paidBy, // <-- send selected paidBy
        splits: splits.map(split => ({
          userId: split.userId,
          amount: split.amount,
          percentage: split.percentage,
          shares: split.shares,
        })),
      };

      if (expense) {
        await updateExpense({ variables: { id: expense.id, input } });
      } else {
        await createExpense({ variables: { input } });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrors(['Failed to save expense. Please try again.']);
    }
  };

  if (!membersData?.group?.memberships) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {expense ? 'Edit Expense' : 'Add New Expense'}
      </h2>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Paid By Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paid By
          </label>
          <select
            value={paidBy}
            onChange={e => setPaidBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {membersData.group.memberships.map((membership: any) => (
              <option key={membership.user.id} value={membership.user.id}>
                {membership.user.firstName} {membership.user.lastName} ({membership.user.username})
                {meData?.me?.id === membership.user.id ? ' (You)' : ''}
              </option>
            ))}
          </select>
        </div>
        {/* Basic Expense Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What was this expense for?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Receipt URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipt URL (optional)
          </label>
          <input
            type="url"
            value={formData.receiptUrl}
            onChange={(e) => handleInputChange('receiptUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/receipt"
          />
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Type
          </label>
          <select
            value={formData.splitType}
            onChange={(e) => handleInputChange('splitType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SPLIT_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Split Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Split Details
          </label>
          <div className="space-y-3">
            {splits.map((split) => {
              const member = membersData.group.memberships.find((m: any) => m.user.id === split.userId);
              if (!member) return null;

              return (
                <div key={split.userId} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <span className="font-medium">
                      {member.user.firstName} {member.user.lastName} ({member.user.username})
                    </span>
                  </div>

                  {formData.splitType === 'CUSTOM' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={split.amount || 0}
                        onChange={(e) => handleSplitChange(split.userId, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}

                  {formData.splitType === 'PERCENTAGE' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={split.percentage || 0}
                        onChange={(e) => handleSplitChange(split.userId, 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  )}

                  {formData.splitType === 'SHARES' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={split.shares || 1}
                        onChange={(e) => handleSplitChange(split.userId, 'shares', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">shares</span>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    ${(split.amount || 0).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {expense ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};
