import { useMutation, useQuery } from '@apollo/client';
import React, { useCallback } from 'react';

import { CREATE_OR_UPDATE_LINEUP, GET_LINEUP, PUBLISH_LINEUP } from './graphql';
import LineupEditor, { LineupSlot, RSVPPlayer } from './LineupEditor';

interface LineupEditorContainerProps {
  teamMatchId: string;
  teamId: string;
  rsvps: RSVPPlayer[];
}

const LineupEditorContainer: React.FC<LineupEditorContainerProps> = ({ teamMatchId, teamId, rsvps }) => {
  const { data, loading, refetch } = useQuery(GET_LINEUP, { variables: { teamMatchId, teamId } });
  const [saveLineup] = useMutation(CREATE_OR_UPDATE_LINEUP);
  const [publishLineup] = useMutation(PUBLISH_LINEUP);

  const slots: LineupSlot[] = React.useMemo(() => {
    if (!data?.lineup?.slots) return [];
    return data.lineup.slots.map((slot: any) => ({
      order: slot.order,
      type: slot.type,
      player1: slot.player1 ? {
        id: slot.player1.id,
        name: slot.player1.firstName || slot.player1.lastName ? `${slot.player1.firstName ?? ''} ${slot.player1.lastName ?? ''}`.trim() : slot.player1.username || slot.player1.email,
        status: 'AVAILABLE', // Not tracked here
      } : undefined,
      player2: slot.player2 ? {
        id: slot.player2.id,
        name: slot.player2.firstName || slot.player2.lastName ? `${slot.player2.firstName ?? ''} ${slot.player2.lastName ?? ''}`.trim() : slot.player2.username || slot.player2.email,
        status: 'AVAILABLE',
      } : undefined,
    }));
  }, [data]);

  const handleChange = useCallback((_newSlots: LineupSlot[]) => {
    // No-op: state is managed in child for now
  }, []);

  const handleSave = useCallback(async (visibility: 'PRIVATE' | 'TEAM' | 'ALL', newSlots: LineupSlot[]) => {
    // Only include slots with player1 assigned
    const slotInputs = newSlots
      .filter(slot => slot.player1 && slot.player1.id)
      .map(slot => ({
        order: slot.order,
        type: slot.type,
        player1Id: slot.player1?.id,
        player2Id: slot.type === 'DOUBLES' ? slot.player2?.id : undefined,
      }));
    console.log('[Lineup Save] Sending slotInputs:', slotInputs);
    // Save draft or update
    const { data: saveData } = await saveLineup({
      variables: {
        input: {
          teamMatchId,
          teamId,
          slots: slotInputs,
          visibility,
        },
      },
    });
    if (visibility !== 'PRIVATE' && saveData?.createOrUpdateLineup?.id) {
      // Publish if needed
      await publishLineup({
        variables: {
          lineupId: saveData.createOrUpdateLineup.id,
          visibility,
        },
      });
    }
    refetch();
  }, [saveLineup, publishLineup, teamMatchId, teamId, refetch]);

  if (loading) return <div>Loading lineup...</div>;

  return (
    <LineupEditor
      rsvps={rsvps}
      slots={slots}
      onChange={handleChange}
      onSave={handleSave}
    />
  );
};

export default LineupEditorContainer;
