import { useQuery } from '@apollo/client';
import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState } from '../../store';

import { GET_TEAM_MATCH, GET_TEAM_MATCH_EVENT_RSVPS } from './graphql';
import { RSVPPlayer } from './LineupEditor';
import LineupEditorContainer from './LineupEditorContainer';
import TennisNavbar from './TennisNavbar';


const LineupPage: React.FC = () => {
  const { teamMatchId } = useParams<{ teamMatchId: string }>();
  const { data: matchData, loading: matchLoading } = useQuery(GET_TEAM_MATCH, {
    variables: { id: teamMatchId },
    skip: !teamMatchId,
  });

  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const teamMatch = matchData?.teamMatch;

  // Determine which team the user is on
  let teamId: string | undefined = undefined;
  let groupId: string | undefined = undefined;

  if (userId && teamMatch) {
    const homeMembers = teamMatch.homeTeam?.group?.memberships?.map((m: any) => m.user.id) || [];
    const awayMembers = teamMatch.awayTeam?.group?.memberships?.map((m: any) => m.user.id) || [];

    // Convert userId to string for comparison to handle potential type mismatches
    const userIdStr = String(userId);

    if (homeMembers.some((id: any) => String(id) === userIdStr)) {
      teamId = teamMatch.homeTeamId;
      groupId = teamMatch.homeTeam?.group?.id;
    } else if (awayMembers.some((id: any) => String(id) === userIdStr)) {
      teamId = teamMatch.awayTeamId;
      groupId = teamMatch.awayTeam?.group?.id;
    }
  }

  const { data: rsvpData, loading: rsvpLoading } = useQuery(GET_TEAM_MATCH_EVENT_RSVPS, {
    variables: { teamMatchId },
    skip: !teamMatchId,
  });

  const rsvps: RSVPPlayer[] = React.useMemo(() => {
    if (!rsvpData?.teamMatch?.associatedEvents || !groupId) {
      return [];
    }

    // Find the event for the user's team (backend now filters by date, so we just need group match)
    const teamEvent = rsvpData.teamMatch.associatedEvents.find((event: any) => {
      return event.group?.id === groupId;
    });

    if (!teamEvent?.rsvps) {
      return [];
    }

    return teamEvent.rsvps.map((r: any) => ({
      id: r.user.id,
      name: r.user.firstName || r.user.lastName
        ? `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim()
        : r.user.username || r.user.email,
      status: r.status,
    }));
  }, [rsvpData, groupId]);

  if (matchLoading || rsvpLoading) return <div>Loading...</div>;
  if (!teamMatch) return <div>Team match not found</div>;
  if (!userId) return <div>Please log in to access lineup editor.</div>;
  if (!teamId) {
    return (
      <div>
        <TennisNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Access Denied:</strong> You are not a member of either team for this match.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TennisNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Lineup Editor</h1>
        <LineupEditorContainer
          teamMatchId={teamMatchId!}
          teamId={teamId}
          rsvps={rsvps}
        />
      </div>
    </div>
  );
};

export default LineupPage;
