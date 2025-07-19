import React, { useState } from 'react';

// Types for RSVP and LineupSlot
export interface RSVPPlayer {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'MAYBE' | 'ONLY_IF_NEEDED' | 'NOT_AVAILABLE';
}

export type LineupSlotType = 'SINGLES' | 'DOUBLES';

export interface LineupSlot {
  order: number;
  type: LineupSlotType;
  player1?: RSVPPlayer;
  player2?: RSVPPlayer; // Only for doubles
}

interface LineupEditorProps {
  rsvps: RSVPPlayer[];
  slots: LineupSlot[];
  onChange: (slots: LineupSlot[]) => void;
  onSave: (visibility: 'PRIVATE' | 'TEAM' | 'ALL', slots: LineupSlot[]) => void;
}

const SINGLES_SLOTS = [1, 2, 3];
const DOUBLES_SLOTS = [1, 2, 3, 4, 5];

const initialSlots: LineupSlot[] = [
  ...SINGLES_SLOTS.map(order => ({ order, type: 'SINGLES' as LineupSlotType })),
  ...DOUBLES_SLOTS.map(order => ({ order, type: 'DOUBLES' as LineupSlotType })),
];

const LineupEditor: React.FC<LineupEditorProps> = ({ rsvps, slots: _slots, onChange: _onChange, onSave }) => {
  // Use slots from parent if available, otherwise use initial slots
  const [slots, setSlots] = useState<LineupSlot[]>(() => {
    // If parent has slots data, merge it with the expected slot structure
    if (_slots && _slots.length > 0) {
      // Create a map of existing slots by type and order
      const existingSlotsMap = new Map();
      _slots.forEach(slot => {
        const key = `${slot.type}-${slot.order}`;
        existingSlotsMap.set(key, slot);
      });

      // Merge with initial slots structure
      return initialSlots.map(initialSlot => {
        const key = `${initialSlot.type}-${initialSlot.order}`;
        return existingSlotsMap.get(key) || initialSlot;
      });
    }
    return initialSlots;
  });
  const [draggedPlayer, setDraggedPlayer] = useState<RSVPPlayer | null>(null);

  // Helper: check if a slot is enabled (enforce order)
  function isSlotEnabled(slot: LineupSlot) {
    if (slot.type === 'SINGLES') {
      return slot.order === 1 || slots.find(s => s.type === 'SINGLES' && s.order === slot.order - 1)?.player1;
    } else {
      // Doubles: both players in previous slot must be filled
      return slot.order === 1 || (slots.find(s => s.type === 'DOUBLES' && s.order === slot.order - 1)?.player1 && slots.find(s => s.type === 'DOUBLES' && s.order === slot.order - 1)?.player2);
    }
  }

  // Helper: check if at least one slot is filled
  const hasAnySlotFilled = slots.some(slot => slot.player1 && slot.player1.id);

  // Drag handlers
  function handleDragStart(player: RSVPPlayer) {
    setDraggedPlayer(player);
  }
  function handleDrop(slotIdx: number, playerNum: 1 | 2) {
    if (!draggedPlayer) return;
    setSlots(prev => {
      const newSlots = [...prev];
      const slot = { ...newSlots[slotIdx] };
      // Prevent duplicate assignment
      if (newSlots.some(s => s.player1?.id === draggedPlayer.id || s.player2?.id === draggedPlayer.id)) return prev;
      if (slot.type === 'SINGLES' && playerNum === 1) {
        slot.player1 = draggedPlayer;
      } else if (slot.type === 'DOUBLES') {
        if (playerNum === 1) slot.player1 = draggedPlayer;
        if (playerNum === 2) slot.player2 = draggedPlayer;
      }
      newSlots[slotIdx] = slot;
      return newSlots;
    });
    setDraggedPlayer(null);
  }
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  // Remove player from slot
  function handleRemove(slotIdx: number, playerNum: 1 | 2) {
    setSlots(prev => {
      const newSlots = [...prev];
      const slot = { ...newSlots[slotIdx] };
      if (playerNum === 1) slot.player1 = undefined;
      if (playerNum === 2) slot.player2 = undefined;
      newSlots[slotIdx] = slot;
      return newSlots;
    });
  }

  // Call onChange when slots change
  React.useEffect(() => {
    _onChange(slots);
  }, [slots, _onChange]);

  // Update slots when _slots prop changes (e.g., after refetch)
  React.useEffect(() => {
    if (_slots && _slots.length > 0) {
      // Create a map of existing slots by type and order
      const existingSlotsMap = new Map();
      _slots.forEach(slot => {
        const key = `${slot.type}-${slot.order}`;
        existingSlotsMap.set(key, slot);
      });

      // Merge with initial slots structure
      const mergedSlots = initialSlots.map(initialSlot => {
        const key = `${initialSlot.type}-${initialSlot.order}`;
        return existingSlotsMap.get(key) || initialSlot;
      });

      setSlots(mergedSlots);
    }
  }, [_slots]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-8">
        {/* RSVP List */}
        <div className="w-1/3">
          <h3 className="font-semibold mb-2">RSVPs</h3>
          <ul className="bg-gray-50 rounded p-2 min-h-[200px]">
            {rsvps.filter(p => p.status !== 'NOT_AVAILABLE').map(player => (
              <li
                key={player.id}
                className="p-2 mb-1 bg-white rounded shadow text-sm cursor-move"
                draggable
                onDragStart={() => handleDragStart(player)}
              >
                {player.name} <span className="text-xs text-gray-400">({player.status})</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Lineup Slots */}
        <div className="w-2/3">
          <h3 className="font-semibold mb-2">Lineup</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Singles Slots */}
            <div>
              <h4 className="font-medium mb-1">Singles</h4>
              {SINGLES_SLOTS.map(order => {
                const idx = slots.findIndex(s => s.type === 'SINGLES' && s.order === order);
                const slot = slots[idx];
                return (
                  <div
                    key={order}
                    className={`mb-2 p-2 border rounded min-h-[40px] bg-blue-50 ${isSlotEnabled(slot) ? '' : 'opacity-50'}`}
                    onDragOver={isSlotEnabled(slot) ? handleDragOver : undefined}
                    onDrop={isSlotEnabled(slot) ? () => handleDrop(idx, 1) : undefined}
                  >
                    <span className="font-bold">S{order}:</span>
                    {slot.player1 ? (
                      <span className="ml-2 inline-block bg-white px-2 py-1 rounded shadow text-xs">
                        {slot.player1.name}
                        <button className="ml-2 text-red-500" onClick={() => handleRemove(idx, 1)}>&times;</button>
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-400 text-xs">(drop player here)</span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Doubles Slots */}
            <div>
              <h4 className="font-medium mb-1">Doubles</h4>
              {DOUBLES_SLOTS.map(order => {
                const idx = slots.findIndex(s => s.type === 'DOUBLES' && s.order === order);
                const slot = slots[idx];
                return (
                  <div key={order} className={`mb-2 p-2 border rounded min-h-[40px] bg-green-50 ${isSlotEnabled(slot) ? '' : 'opacity-50'}`}>
                    <span className="font-bold">D{order}:</span>
                    {/* Player 1 */}
                    <span
                      className="ml-2 inline-block min-w-[80px]"
                      onDragOver={isSlotEnabled(slot) ? handleDragOver : undefined}
                      onDrop={isSlotEnabled(slot) ? () => handleDrop(idx, 1) : undefined}
                    >
                      {slot.player1 ? (
                        <span className="bg-white px-2 py-1 rounded shadow text-xs">
                          {slot.player1.name}
                          <button className="ml-2 text-red-500" onClick={() => handleRemove(idx, 1)}>&times;</button>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">(drop player 1)</span>
                      )}
                    </span>
                    {/* Player 2 */}
                    <span
                      className="ml-2 inline-block min-w-[80px]"
                      onDragOver={isSlotEnabled(slot) ? handleDragOver : undefined}
                      onDrop={isSlotEnabled(slot) ? () => handleDrop(idx, 2) : undefined}
                    >
                      {slot.player2 ? (
                        <span className="bg-white px-2 py-1 rounded shadow text-xs">
                          {slot.player2.name}
                          <button className="ml-2 text-red-500" onClick={() => handleRemove(idx, 2)}>&times;</button>
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">(drop player 2)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* Save/Publish Buttons */}
      <div className="flex gap-4 mt-4">
        <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded" onClick={() => onSave('PRIVATE', slots)} disabled={!hasAnySlotFilled}>
          Save Draft
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={() => onSave('TEAM', slots)} disabled={!hasAnySlotFilled}>
          Publish to Team
        </button>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={() => onSave('ALL', slots)} disabled={!hasAnySlotFilled}>
          Publish to All
        </button>
      </div>
      {!hasAnySlotFilled && (
        <div className="text-red-600 mt-2">Please assign at least one player to a slot before saving or publishing.</div>
      )}
    </div>
  );
};

export default LineupEditor;
