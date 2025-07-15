import { useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';

import { CREATE_TENNIS_TEAM, DELETE_TENNIS_TEAM, GET_TENNIS_LEAGUE, UPDATE_TENNIS_TEAM } from './graphql';
import GroupAutocomplete from './GroupAutocomplete';
import { CreateTennisTeamData, CreateTennisTeamInput, DeleteTennisTeamData, TeamLeagueTeam, UpdateTennisTeamData, UpdateTennisTeamInput } from './types';
import UserAutocomplete from './UserAutocomplete';

interface TeamListProps {
  leagueId: string;
  teams: TeamLeagueTeam[];
}

const TeamList: React.FC<TeamListProps> = ({ leagueId, teams }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamLeagueTeam | null>(null);
  const [formData, setFormData] = useState<CreateTennisTeamInput>({
    groupId: '',
    captainId: '',
  });
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string; description?: string } | null>(null);

  const { refetch } = useQuery(GET_TENNIS_LEAGUE, { variables: { id: leagueId } });

  const [createTeam, { loading: creating }] = useMutation<CreateTennisTeamData, { leagueId: string; input: CreateTennisTeamInput }>(
    CREATE_TENNIS_TEAM,
    {
      onCompleted: () => {
        setShowCreateForm(false);
        setFormData({ groupId: '', captainId: '' });
        setSelectedGroup(null);
        refetch();
      },
      onError: (error) => {
        console.error('Error creating team:', error);
        alert('Failed to create team. Please try again.');
      },
    }
  );

  const [updateTeam, { loading: updating }] = useMutation<UpdateTennisTeamData, { id: string; input: UpdateTennisTeamInput }>(
    UPDATE_TENNIS_TEAM,
    {
      onCompleted: () => {
        setEditingTeam(null);
        setFormData({ groupId: '', captainId: '' });
        setSelectedGroup(null);
        refetch();
      },
      onError: (error) => {
        console.error('Error updating team:', error);
        alert('Failed to update team. Please try again.');
      },
    }
  );

  const [deleteTeam] = useMutation<DeleteTennisTeamData, { id: string }>(DELETE_TENNIS_TEAM, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.groupId || !formData.captainId) {
      alert('Please fill in all required fields.');
      return;
    }

    if (editingTeam) {
      updateTeam({ variables: { id: editingTeam.id, input: formData } });
    } else {
      createTeam({ variables: { leagueId, input: formData } });
    }
  };

  const handleEdit = (team: TeamLeagueTeam) => {
    setEditingTeam(team);
    setFormData({
      groupId: team.group.id,
      captainId: team.captainId,
    });
    setSelectedGroup({
      id: team.group.id,
      name: team.group.name,
      description: team.group.description,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the team "${name}"? This action cannot be undone.`)) {
      deleteTeam({ variables: { id } });
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingTeam(null);
    setFormData({ groupId: '', captainId: '' });
    setSelectedGroup(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Teams</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Team
        </button>
      </div>

      {/* Create/Edit Team Form */}
      {(showCreateForm || editingTeam) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingTeam ? 'Edit Team' : 'Create New Team'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <GroupAutocomplete
                onChange={(groupId, group) => {
                  setFormData({ ...formData, groupId });
                  setSelectedGroup(group || null);
                }}
                label="Group"
                placeholder="Search for a group..."
                required
              />
            </div>
            {selectedGroup && (
              <div className="bg-gray-50 rounded p-3 border border-gray-200">
                <div className="font-semibold text-gray-800">{selectedGroup.name}</div>
                {selectedGroup.description && (
                  <div className="text-gray-600 text-sm">{selectedGroup.description}</div>
                )}
              </div>
            )}
            <div>
              <UserAutocomplete
                onChange={(captainId) => setFormData({ ...formData, captainId })}
                label="Captain"
                placeholder="Search for a captain..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || updating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {creating || updating ? 'Saving...' : (editingTeam ? 'Update Team' : 'Create Team')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{team.group.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Team"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(team.id, team.group.name)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete Team"
                >
                  🗑️
                </button>
              </div>
            </div>

            {team.group.description && (
              <p className="text-gray-600 mb-4">{team.group.description}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Captain:</span>
                <span className="font-medium">
                  {team.captain.firstName} {team.captain.lastName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Members:</span>
                <span className="font-medium">{team.group.members?.length ?? 0}</span>
              </div>
            </div>

            {team.group.members && team.group.members.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Team Members:</h4>
                <div className="space-y-1">
                  {team.group.members.slice(0, 3).map((member) => (
                    <div key={member.id} className="text-sm text-gray-600">
                      {member.user.firstName} {member.user.lastName}
                    </div>
                  ))}
                  {team.group.members.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{team.group.members.length - 3} more members
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Teams Yet</h3>
          <p className="text-gray-600 mb-4">Create your first team to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First Team
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamList;
