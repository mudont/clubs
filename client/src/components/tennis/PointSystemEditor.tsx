import { useMutation } from '@apollo/client';
import React, { useState } from 'react';

import { UPDATE_POINT_SYSTEM } from './graphql';
import { PointSystem, UpdatePointSystemData, UpdatePointSystemInput } from './types';

interface PointSystemEditorProps {
  leagueId: string;
  pointSystem: PointSystem;
}

const PointSystemEditor: React.FC<PointSystemEditorProps> = ({ leagueId, pointSystem }) => {
  const [formData, setFormData] = useState<UpdatePointSystemInput>({
    winPoints: pointSystem.winPoints,
    lossPoints: pointSystem.lossPoints,
    drawPoints: pointSystem.drawPoints,
    defaultWinPoints: pointSystem.defaultWinPoints,
    defaultLossPoints: pointSystem.defaultLossPoints,
    defaultDrawPoints: pointSystem.defaultDrawPoints,
  });

  const [updatePointSystem, { loading }] = useMutation<UpdatePointSystemData, { leagueId: string; input: UpdatePointSystemInput }>(
    UPDATE_POINT_SYSTEM,
    {
      onCompleted: () => {
        alert('Point system updated successfully!');
      },
      onError: (error) => {
        console.error('Error updating point system:', error);
        alert('Failed to update point system. Please try again.');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePointSystem({ variables: { leagueId, input: formData } });
  };

  const handleReset = () => {
    setFormData({
      winPoints: pointSystem.winPoints,
      lossPoints: pointSystem.lossPoints,
      drawPoints: pointSystem.drawPoints,
      defaultWinPoints: pointSystem.defaultWinPoints,
      defaultLossPoints: pointSystem.defaultLossPoints,
      defaultDrawPoints: pointSystem.defaultDrawPoints,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Point System Settings</h2>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current Point System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{pointSystem.winPoints}</div>
              <div className="text-sm text-green-700">Points for Win</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{pointSystem.lossPoints}</div>
              <div className="text-sm text-red-700">Points for Loss</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">{pointSystem.drawPoints}</div>
              <div className="text-sm text-gray-700">Points for Draw</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Point System</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Match Points</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points for Win
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.winPoints}
                    onChange={(e) => setFormData({ ...formData, winPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points for Loss
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lossPoints}
                    onChange={(e) => setFormData({ ...formData, lossPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points for Draw
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.drawPoints}
                    onChange={(e) => setFormData({ ...formData, drawPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Default Points (for incomplete matches)</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Win Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.defaultWinPoints}
                    onChange={(e) => setFormData({ ...formData, defaultWinPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Loss Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.defaultLossPoints}
                    onChange={(e) => setFormData({ ...formData, defaultLossPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Draw Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.defaultDrawPoints}
                    onChange={(e) => setFormData({ ...formData, defaultDrawPoints: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Updating...' : 'Update Point System'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Reset to Current
            </button>
          </div>
        </form>
      </div>

      {/* Information Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How Point System Works</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Match Points:</strong> Points awarded for completed matches based on win/loss/draw</p>
          <p>• <strong>Default Points:</strong> Points awarded for incomplete or abandoned matches</p>
          <p>• <strong>Standings:</strong> Teams are ranked by total points, then goal difference, then goals scored</p>
          <p>• <strong>Changes:</strong> Point system changes only affect future matches, not existing results</p>
        </div>
      </div>
    </div>
  );
};

export default PointSystemEditor;
