import { gql, useQuery } from '@apollo/client';
import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { RootState } from '../../store';

import { GET_GROUP_RSVPS } from './graphql';
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
          members {
            user {
              id
            }
          }
        }
      }
      awayTeam {
        id
        group {
          id
          members {
            user {
              id
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
    const homeMembers = teamMatch.homeTeam?.group?.members?.map((m: any) => m.user.id) || [];
    const awayMembers = teamMatch.awayTeam?.group?.members?.map((m: any) => m.user.id) || [];
    if (homeMembers.includes(userId)) {
      teamId = teamMatch.homeTeamId;
      groupId = teamMatch.homeTeam?.group?.id;
    } else if (awayMembers.includes(userId)) {
      teamId = teamMatch.awayTeamId;
      groupId = teamMatch.awayTeam?.group?.id;
    }
  }

  const { data: rsvpData, loading: rsvpLoading } = useQuery(GET_GROUP_RSVPS, {
    variables: { groupId },
    skip: !groupId,
  });

  const rsvps: RSVPPlayer[] = React.useMemo(() => {
    if (!rsvpData?.group?.rsvps) return [];
    return rsvpData.group.rsvps.map((r: any) => ({
      id: r.user.id,
      name: r.user.firstName || r.user.lastName
        ? `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim()
        : r.user.username || r.user.email,
      status: r.status,
    }));
  }, [rsvpData]);

  if (matchLoading || rsvpLoading) return <div>Loading...</div>;
  if (!teamMatch) return <div>Team match not found</div>;
  if (!teamId) return <div>You are not a member of either team for this match.</div>;

  return (
    <div>
      <TennisNavbar />
      <div className="max-w-4xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Lineup Editor</h2>
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
