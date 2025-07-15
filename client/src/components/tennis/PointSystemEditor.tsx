import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';

import {
    CREATE_LEAGUE_POINT_SYSTEM,
    DELETE_LEAGUE_POINT_SYSTEM,
    GET_LEAGUE_POINT_SYSTEMS,
    UPDATE_LEAGUE_POINT_SYSTEM,
} from './graphql';
import {
    CreateLeaguePointSystemData,
    DeleteLeaguePointSystemData,
    GetLeaguePointSystemsData,
    MatchType,
    TeamLeaguePointSystem,
    UpdateLeaguePointSystemData,
} from './types';

interface PointSystemEditorProps {
  leagueId: string;
}

const matchTypeLabels: Record<MatchType, string> = {
  SINGLES: 'Singles',
  DOUBLES: 'Doubles',
};

const defaultForm: Partial<TeamLeaguePointSystem> = {
  matchType: 'SINGLES',
  order: 1,
  winPoints: 3,
  lossPoints: 0,
  drawPoints: 0,
};

const PointSystemEditor: React.FC<PointSystemEditorProps> = ({ leagueId }) => {
  const { data, loading, error, refetch } = useQuery<GetLeaguePointSystemsData>(GET_LEAGUE_POINT_SYSTEMS, {
    variables: { leagueId },
  });
  const [createPointSystem] = useMutation<CreateLeaguePointSystemData>(CREATE_LEAGUE_POINT_SYSTEM, { onCompleted: refetch });
  const [updatePointSystem] = useMutation<UpdateLeaguePointSystemData>(UPDATE_LEAGUE_POINT_SYSTEM, { onCompleted: refetch });
  const [deletePointSystem] = useMutation<DeleteLeaguePointSystemData>(DELETE_LEAGUE_POINT_SYSTEM, { onCompleted: refetch });

  const [form, setForm] = useState<Partial<TeamLeaguePointSystem>>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (loading) return <div>Loading point systems...</div>;
  if (error) return <div className="text-red-500">Error loading point systems: {error.message}</div>;
  const pointSystems = data?.tennisLeague?.pointSystems || [];

  const grouped = pointSystems.reduce<Record<MatchType, TeamLeaguePointSystem[]>>((acc, ps) => {
    acc[ps.matchType] = acc[ps.matchType] || [];
    acc[ps.matchType].push(ps);
    return acc;
  }, { SINGLES: [], DOUBLES: [] });
  Object.values(grouped).forEach(arr => arr.sort((a, b) => a.order - b.order));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (editingId) {
        await updatePointSystem({ variables: { id: editingId, input: {
          matchType: form.matchType,
          order: form.order,
          winPoints: form.winPoints,
          lossPoints: form.lossPoints,
          drawPoints: form.drawPoints,
        }}});
        setEditingId(null);
      } else {
        await createPointSystem({ variables: { leagueId, input: {
          matchType: form.matchType,
          order: form.order,
          winPoints: form.winPoints,
          lossPoints: form.lossPoints,
          drawPoints: form.drawPoints,
        }}});
      }
      setForm(defaultForm);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving point system');
    }
  };

  const handleEdit = (ps: TeamLeaguePointSystem) => {
    setEditingId(ps.id);
    setForm({ ...ps });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this point system?')) {
      try {
        await deletePointSystem({ variables: { id } });
      } catch (err: any) {
        setErrorMsg(err.message || 'Error deleting point system');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Point System Settings</h2>
      <div className="mb-6">
        {(['SINGLES', 'DOUBLES'] as MatchType[]).map(type => (
          <div key={type} className="mb-4">
            <h3 className="text-lg font-medium mb-2">{matchTypeLabels[type]}</h3>
            <table className="min-w-full border mb-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">Order</th>
                  <th className="px-2 py-1">Win</th>
                  <th className="px-2 py-1">Loss</th>
                  <th className="px-2 py-1">Draw</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grouped[type].length === 0 && (
                  <tr><td colSpan={5} className="text-center text-gray-400">No point systems</td></tr>
                )}
                {grouped[type].map(ps => (
                  <tr key={ps.id} className="border-t">
                    <td className="px-2 py-1 text-center">{ps.order}</td>
                    <td className="px-2 py-1 text-center">{ps.winPoints}</td>
                    <td className="px-2 py-1 text-center">{ps.lossPoints}</td>
                    <td className="px-2 py-1 text-center">{ps.drawPoints}</td>
                    <td className="px-2 py-1 text-center">
                      <button className="text-blue-600 mr-2" onClick={() => handleEdit(ps)}>Edit</button>
                      <button className="text-red-600" onClick={() => handleDelete(ps.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit' : 'Add'} Point System</h3>
        {errorMsg && <div className="text-red-500 mb-2">{errorMsg}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Match Type</label>
            <select
              value={form.matchType}
              onChange={e => setForm(f => ({ ...f, matchType: e.target.value as MatchType }))}
              className="w-full border rounded p-2"
              required
            >
              <option value="SINGLES">Singles</option>
              <option value="DOUBLES">Doubles</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.order ?? ''}
              onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Win Points</label>
            <input
              type="number"
              min={0}
              value={form.winPoints ?? ''}
              onChange={e => setForm(f => ({ ...f, winPoints: parseInt(e.target.value) || 0 }))}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loss Points</label>
            <input
              type="number"
              min={0}
              value={form.lossPoints ?? ''}
              onChange={e => setForm(f => ({ ...f, lossPoints: parseInt(e.target.value) || 0 }))}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Draw Points</label>
            <input
              type="number"
              min={0}
              value={form.drawPoints ?? ''}
              onChange={e => setForm(f => ({ ...f, drawPoints: parseInt(e.target.value) || 0 }))}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add'}</button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(defaultForm); }}>Cancel</button>
            )}
          </div>
        </form>
      </div>
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How Point System Works</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• <strong>Order</strong>: Lower order means higher priority (e.g., 1 = First Singles, 2 = Second Singles, etc.)</p>
          <p>• <strong>Validation</strong>: For each match type, lower order must have higher or equal win points</p>
          <p>• <strong>Changes</strong>: Point system changes only affect future matches, not existing results</p>
        </div>
      </div>
    </div>
  );
};

export default PointSystemEditor;
