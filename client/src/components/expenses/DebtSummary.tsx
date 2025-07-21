import { useQuery } from '@apollo/client';
import React from 'react';

import { GET_GROUP_DEBT_SUMMARY } from '../../graphql/Expenses';

interface DebtSummaryProps {
  groupId: string;
}

export const DebtSummary: React.FC<DebtSummaryProps> = ({ groupId }) => {
  const { data, loading, error } = useQuery(GET_GROUP_DEBT_SUMMARY, {
    variables: { groupId },
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600">
          Error loading debt summary: {error.message}
        </div>
      </div>
    );
  }

  const debtSummary = data?.groupDebtSummary || [];

  // Calculate totals
  const totalOwed = debtSummary.reduce((sum: number, debt: any) => sum + debt.totalOwed, 0);
  const totalOwedTo = debtSummary.reduce((sum: number, debt: any) => sum + debt.totalOwedTo, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Debt Summary</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Total Owed</div>
          <div className="text-2xl font-bold text-blue-800">${totalOwed.toFixed(2)}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Total Owed To</div>
          <div className="text-2xl font-bold text-green-800">${totalOwedTo.toFixed(2)}</div>
        </div>
        <div className={`p-4 rounded-lg ${totalOwedTo - totalOwed > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm font-medium ${totalOwedTo - totalOwed > 0 ? 'text-green-600' : 'text-red-600'}`}>
            Net Balance
          </div>
          <div className={`text-2xl font-bold ${totalOwedTo - totalOwed > 0 ? 'text-green-800' : 'text-red-800'}`}>
            ${(totalOwedTo - totalOwed).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Individual Debts */}
      <div className="space-y-4">
        {debtSummary.map((debt: any) => (
          <div key={debt.user.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {debt.user.firstName?.[0] || debt.user.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {debt.user.firstName} {debt.user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">@{debt.user.username}</div>
                </div>
              </div>
              <div className={`text-lg font-semibold ${debt.netAmount > 0 ? 'text-green-600' : debt.netAmount < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {debt.netAmount > 0 ? '+' : ''}${debt.netAmount.toFixed(2)}
              </div>
            </div>

            {/* Debt Details */}
            {debt.debts.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Individual Debts:</div>
                {debt.debts.map((debtDetail: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      → {debtDetail.toUser.firstName} {debtDetail.toUser.lastName}
                    </span>
                    <span className="font-medium">${debtDetail.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary for this user */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Owed to others:</span>
                <span className="font-medium text-red-600">${debt.totalOwed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Owed by others:</span>
                <span className="font-medium text-green-600">${debt.totalOwedTo.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Debts Message */}
      {debtSummary.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-lg font-medium">All settled up!</div>
          <div className="text-sm">No outstanding debts in this group.</div>
        </div>
      )}
    </div>
  );
};
