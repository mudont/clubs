import React, { useState } from 'react';

import { IndividualDoublesMatch, IndividualSinglesMatch } from './types';
import { parseScoreString, scoreArrayToString } from './utils';

const RESULT_TYPES = [
  { value: 'C', label: 'Completed' },
  { value: 'TM', label: 'Timed Match' },
  { value: 'D', label: 'Default' },
  { value: 'NONE', label: 'None' },
];

interface BatchMatchEditorProps {
  singlesMatches: IndividualSinglesMatch[];
  doublesMatches: IndividualDoublesMatch[];
  onSave: (matches: (IndividualSinglesMatch | IndividualDoublesMatch)[], matchType: 'singles' | 'doubles') => void;
}

const BatchMatchEditor: React.FC<BatchMatchEditorProps> = ({ singlesMatches, doublesMatches, onSave }) => {
  const [activeTab, setActiveTab] = useState<'singles' | 'doubles'>('singles');
  // Local state for editing
  const [singlesState, setSinglesState] = useState(() => singlesMatches.map(m => ({ ...m, scoreArr: parseScoreString(m.score) })));
  const [doublesState, setDoublesState] = useState(() => doublesMatches.map(m => ({ ...m, scoreArr: parseScoreString(m.score) })));
  const [saving, setSaving] = useState(false);

  // Helper to update a match in state
  function updateMatchState(index: number, field: string, value: any, type: 'singles' | 'doubles') {
    if (type === 'singles') {
      setSinglesState(state => {
        const newState = [...state];
        newState[index] = { ...newState[index], [field]: value };
        return newState;
      });
    } else {
      setDoublesState(state => {
        const newState = [...state];
        newState[index] = { ...newState[index], [field]: value };
        return newState;
      });
    }
  }

  // Helper to update set scores
  function updateSetScore(index: number, setIdx: number, side: 0 | 1, value: string, type: 'singles' | 'doubles') {
    const parsed = value === '' ? 0 : Number(value);
    if (type === 'singles') {
      setSinglesState(state => {
        const newState = [...state];
        const arr = newState[index].scoreArr ? [...newState[index].scoreArr] : [];
        arr[setIdx] = arr[setIdx] ? [...arr[setIdx]] : [0, 0];
        arr[setIdx][side] = parsed;
        newState[index] = { ...newState[index], scoreArr: arr };
        return newState;
      });
    } else {
      setDoublesState(state => {
        const newState = [...state];
        const arr = newState[index].scoreArr ? [...newState[index].scoreArr] : [];
        arr[setIdx] = arr[setIdx] ? [...arr[setIdx]] : [0, 0];
        arr[setIdx][side] = parsed;
        newState[index] = { ...newState[index], scoreArr: arr };
        return newState;
      });
    }
  }

  // Save handler
  async function handleSave() {
    setSaving(true);
    try {
      if (activeTab === 'singles') {
        const toSave = singlesState.map(m => ({
          ...m,
          score: scoreArrayToString(m.scoreArr),
        }));
        await onSave(toSave, 'singles');
      } else {
        const toSave = doublesState.map(m => ({
          ...m,
          score: scoreArrayToString(m.scoreArr),
        }));
        await onSave(toSave, 'doubles');
      }
    } finally {
      setSaving(false);
    }
  }

  // Render player link (stub)
  function PlayerLink({ user }: { user: any }) {
    return <span className="text-blue-700 underline cursor-pointer">{user?.firstName || user?.lastName ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() : user?.username || user?.email}</span>;
  }

  // Render match rows
  function renderRows(matches: any[], type: 'singles' | 'doubles') {
    return matches.map((m, idx) => {
      // Always render 3 sets for alignment
      const sets = [0, 1, 2].map(i => m.scoreArr && m.scoreArr[i] ? m.scoreArr[i] : [ '', '' ]);
      return (
        <tr key={m.id} className="border-b">
          <td className="px-2 py-1 text-xs font-semibold align-middle">{idx + 1}</td>
          <td className="px-2 py-1 align-middle">
            <PlayerLink user={type === 'singles' ? m.player1 : m.team1Player1} />
            {type === 'doubles' && <span> / <PlayerLink user={m.team1Player2} /></span>}
          </td>
          <td className="px-2 py-1 align-middle" style={{ borderRight: '2px solid #e5e7eb' }}>
            <PlayerLink user={type === 'singles' ? m.player2 : m.team2Player1} />
            {type === 'doubles' && <span> / <PlayerLink user={m.team2Player2} /></span>}
          </td>
          {/* Set scores: always 3 sets */}
          {sets.map((set: any, setIdx: number) => (
            <React.Fragment key={setIdx}>
              <td className="px-0 py-1 align-middle" style={{ minWidth: 22, width: 22, borderLeft: setIdx === 0 ? '2px solid #e5e7eb' : undefined }}>
                <input
                  type="text"
                  value={set[0] ?? ''}
                  onChange={e => updateSetScore(idx, setIdx, 0, e.target.value.replace(/[^0-9]/g, ''), type)}
                  onBlur={e => {
                    const v = e.target.value;
                    if (v === '' || (Number(v) >= 0 && Number(v) <= 7)) return;
                    updateSetScore(idx, setIdx, 0, '', type);
                  }}
                  className="w-5 border rounded text-xs text-center"
                  style={{ width: 22 }}
                />
              </td>
              <td className="px-0 py-1 align-middle" style={{ minWidth: 10, width: 10 }}>
                <span className="inline-block w-2 text-center">-</span>
              </td>
              <td className="px-0 py-1 align-middle" style={{ minWidth: 22, width: 22, borderRight: setIdx === 2 ? '2px solid #e5e7eb' : undefined }}>
                <input
                  type="text"
                  value={set[1] ?? ''}
                  onChange={e => updateSetScore(idx, setIdx, 1, e.target.value.replace(/[^0-9]/g, ''), type)}
                  onBlur={e => {
                    const v = e.target.value;
                    if (v === '' || (Number(v) >= 0 && Number(v) <= 7)) return;
                    updateSetScore(idx, setIdx, 1, '', type);
                  }}
                  className="w-5 border rounded text-xs text-center"
                  style={{ width: 22 }}
                />
              </td>
            </React.Fragment>
          ))}
          {/* Winner dropdown */}
          <td className="px-2 py-1 align-middle" style={{ borderLeft: '2px solid #e5e7eb' }}>
            <select
              value={m.winner || ''}
              onChange={e => updateMatchState(idx, 'winner', e.target.value, type)}
              className="border rounded text-xs w-16"
              style={{ minWidth: 60 }}
            >
              <option value="">Select</option>
              <option value="HOME">Home</option>
              <option value="AWAY">Away</option>
            </select>
          </td>
          {/* Result type dropdown */}
          <td className="px-2 py-1 align-middle">
            <select
              value={m.resultType || 'NONE'}
              onChange={e => updateMatchState(idx, 'resultType', e.target.value, type)}
              className="border rounded text-xs"
            >
              {RESULT_TYPES.map(rt => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
          </td>
        </tr>
      );
    });
  }

  const matches = activeTab === 'singles' ? singlesState : doublesState;
  const type = activeTab;

  return (
    <div>
      {/* Tabs for Singles/Doubles */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'singles' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('singles')}
        >
          Singles
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'doubles' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('doubles')}
        >
          Doubles
        </button>
      </div>
      <table className="min-w-full text-xs mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 align-middle">#</th>
            <th className="px-2 py-1 align-middle text-left">Home</th>
            <th className="px-2 py-1 align-middle text-left" style={{ borderRight: '2px solid #e5e7eb' }}>Away</th>
            {/* Vertical separator before S1 */}
            <th className="px-0 py-1 align-middle" colSpan={3} style={{ borderLeft: '2px solid #e5e7eb', borderRight: '2px solid #e5e7eb' }}>S1</th>
            <th className="px-0 py-1 align-middle" colSpan={3} style={{ borderRight: '2px solid #e5e7eb' }}>S2</th>
            <th className="px-0 py-1 align-middle" colSpan={3} style={{ borderRight: '2px solid #e5e7eb' }}>S3</th>
            {/* Vertical separator after S3 */}
            <th className="px-2 py-1 align-middle text-left" style={{ borderLeft: '2px solid #e5e7eb' }}>Winner</th>
            <th className="px-2 py-1 align-middle text-left">Result</th>
          </tr>
        </thead>
        <tbody>
          {renderRows(matches, type)}
        </tbody>
      </table>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save All'}
      </button>
    </div>
  );
};

export default BatchMatchEditor;
