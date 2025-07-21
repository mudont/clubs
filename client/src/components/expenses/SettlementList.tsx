import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';

import { DELETE_SETTLEMENT, GET_GROUP_SETTLEMENTS, MARK_SETTLEMENT_PAID } from '../../graphql/Expenses';

interface SettlementListProps {
  groupId: string;
}

const PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'PAYPAL',
  'VENMO',
  'CASH_APP',
  'OTHER',
];

export const SettlementList: React.FC<SettlementListProps> = ({ groupId }) => {
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [settlementToDelete, setSettlementToDelete] = useState<any>(null);

  const { data, loading, error, refetch } = useQuery(GET_GROUP_SETTLEMENTS, {
    variables: { groupId },
  });

  const [markSettlementPaid] = useMutation(MARK_SETTLEMENT_PAID, {
    onCompleted: () => {
      refetch();
      setSelectedSettlement(null);
      setPaymentMethod('CASH');
      setNotes('');
    },
  });

  const [deleteSettlement] = useMutation(DELETE_SETTLEMENT, {
    onCompleted: () => {
      refetch();
    },
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
          Error loading settlements: {error.message}
        </div>
      </div>
    );
  }

  const settlements = data?.groupSettlements || [];

  const handleMarkPaid = async () => {
    if (!selectedSettlement) return;

    try {
      await markSettlementPaid({
        variables: {
          id: selectedSettlement.id,
          input: {
            paymentMethod,
            notes: notes.trim() || undefined,
          },
        },
      });
    } catch (error) {
      console.error('Error marking settlement as paid:', error);
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    setSettlementToDelete(settlementId);
  };

  const confirmDelete = async () => {
    if (!settlementToDelete) return;

    try {
      await deleteSettlement({
        variables: { id: settlementToDelete },
      });
      setSettlementToDelete(null);
    } catch (error) {
      console.error('Error deleting settlement:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    return method.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Settlements</h3>

      {/* Settlement List */}
      <div className="space-y-4">
        {settlements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-lg font-medium">No settlements yet</div>
            <div className="text-sm">Settlements will appear here when created.</div>
          </div>
        ) : (
          settlements.map((settlement: any) => (
            <div key={settlement.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {settlement.fromUser.firstName?.[0] || settlement.fromUser.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {settlement.fromUser.firstName} {settlement.fromUser.lastName}
                    </div>
                    <div className="text-sm text-gray-500">@{settlement.fromUser.username}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${settlement.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">to {settlement.toUser.firstName} {settlement.toUser.lastName}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(settlement.status)}`}>
                    {settlement.status}
                  </span>
                  {settlement.paymentMethod && (
                    <span className="text-sm text-gray-600">
                      {getPaymentMethodLabel(settlement.paymentMethod)}
                    </span>
                  )}
                  {settlement.paidAt && (
                    <span className="text-sm text-gray-500">
                      Paid: {new Date(settlement.paidAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {settlement.status === 'PENDING' && (
                    <button
                      onClick={() => setSelectedSettlement(settlement)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteSettlement(settlement.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {settlement.notes && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <span className="font-medium">Notes:</span> {settlement.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mark as Paid Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Mark Settlement as Paid</h4>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                {selectedSettlement.fromUser.firstName} {selectedSettlement.fromUser.lastName} → {selectedSettlement.toUser.firstName} {selectedSettlement.toUser.lastName}
              </div>
              <div className="text-lg font-semibold">${selectedSettlement.amount.toFixed(2)}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>
                      {getPaymentMethodLabel(method)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any notes about this payment..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedSettlement(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {settlementToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Delete Settlement</h4>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this settlement? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSettlementToDelete(null)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
