import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState } from '../../store';

import { GET_TEAM_MATCH_EVENT_RSVPS } from './graphql';
import { RSVPPlayer } from './LineupEditor';
import LineupEditorContainer from './LineupEditorContainer';
import TennisNavbar from './TennisNavbar';


const GET_TEAM_MATCH = gql`
  query GetTeamMatch($id: ID!) {
    teamMatch(id: $id) {
      id
      teamLeagueId
      homeTeamId
      awayTeamId
      homeTeam {
        id
        group {
          id
          memberships {
            user {
              id
              username
              firstName
              lastName
              email
            }
          }
        }
      }
      awayTeam {
        id
        group {
          id
          memberships {
            user {
              id
              username
              firstName
              lastName
              email
            }
          }
        }
      }
    }
  }
`;

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
    console.log('Debug - User ID:', userId, 'Type:', typeof userId);
    console.log('Debug - Team Match:', teamMatch);

    const homeMembers = teamMatch.homeTeam?.group?.memberships?.map((m: any) => m.user.id) || [];
    const awayMembers = teamMatch.awayTeam?.group?.memberships?.map((m: any) => m.user.id) || [];

    console.log('Debug - Home Members:', homeMembers);
    console.log('Debug - Away Members:', awayMembers);
    console.log('Debug - Home Members includes userId:', homeMembers.includes(userId));
    console.log('Debug - Away Members includes userId:', awayMembers.includes(userId));

    // Convert userId to string for comparison to handle potential type mismatches
    const userIdStr = String(userId);

    if (homeMembers.some((id: any) => String(id) === userIdStr)) {
      teamId = teamMatch.homeTeamId;
      groupId = teamMatch.homeTeam?.group?.id;
      console.log('Debug - User is on home team');
    } else if (awayMembers.some((id: any) => String(id) === userIdStr)) {
      teamId = teamMatch.awayTeamId;
      groupId = teamMatch.awayTeam?.group?.id;
      console.log('Debug - User is on away team');
    } else {
      console.log('Debug - User is not found in either team');
    }
  }

  const { data: rsvpData, loading: rsvpLoading } = useQuery(GET_TEAM_MATCH_EVENT_RSVPS, {
    variables: { teamMatchId },
    skip: !teamMatchId,
  });

  const rsvps: RSVPPlayer[] = React.useMemo(() => {
    console.log('Debug - RSVP Data:', rsvpData);
    console.log('Debug - Group ID:', groupId);

    if (!rsvpData?.teamMatch?.associatedEvents || !groupId) {
      console.log('Debug - Missing data:', {
        hasRsvpData: !!rsvpData,
        hasTeamMatch: !!rsvpData?.teamMatch,
        hasAssociatedEvents: !!rsvpData?.teamMatch?.associatedEvents,
        groupId: groupId
      });
      return [];
    }

    console.log('Debug - Associated Events:', rsvpData.teamMatch.associatedEvents);

    // Find the event for the user's team (matching groupId)
    const teamEvent = rsvpData.teamMatch.associatedEvents.find((event: any) => {
      console.log('Debug - Checking event:', {
        eventId: event.id,
        eventGroupId: event.group?.id,
        userGroupId: groupId,
        matches: event.group?.id === groupId
      });
      return event.group?.id === groupId;
    });

    console.log('Debug - Found team event:', teamEvent);

    if (!teamEvent?.rsvps) {
      console.log('Debug - No RSVPs found for team event');
      return [];
    }

    console.log('Debug - Team event RSVPs:', teamEvent.rsvps);

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
            <br />
            <small>User ID: {userId}</small>
            <br />
            <small>Team Match ID: {teamMatchId}</small>
          </div>
        </div>
      </div>
    );
  }

  // Debug section for production troubleshooting
  const debugInfo = {
    userId,
    teamMatchId,
    teamId,
    groupId,
    hasRsvpData: !!rsvpData,
    hasTeamMatch: !!rsvpData?.teamMatch,
    hasAssociatedEvents: !!rsvpData?.teamMatch?.associatedEvents,
    associatedEventsCount: rsvpData?.teamMatch?.associatedEvents?.length || 0,
    rsvpsCount: rsvps.length,
    rawAssociatedEvents: rsvpData?.teamMatch?.associatedEvents || []
  };

  return (
    <div>
      <TennisNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Lineup Editor</h1>

        {/* Debug section - remove this in production */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Debug Info:</strong>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

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
