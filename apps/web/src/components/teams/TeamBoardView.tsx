import { useState, useEffect } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { getStoredUser } from '../../api/auth';
import { InviteMemberDialog } from './InviteMemberDialog';
import type { Team, TeamWithMembers, TeamBoardItem } from '@paddock/shared';

// Status display config
const STATUS_CONFIG = {
  garage: { label: 'In the Garage', emoji: '🔧' },
  on_track: { label: 'On Track', emoji: '🏎️' },
  pits: { label: 'In the Pits', emoji: '🛠️' },
  checkered: { label: 'Checkered', emoji: '🏁' },
} as const;

interface TeamBoardViewProps {
  team: Team;
  onClose: () => void;
  onOpenItem?: (itemId: string) => void;
}

export const TeamBoardView = ({ team, onClose, onOpenItem }: TeamBoardViewProps) => {
  const { getTeamDetails, getTeamItems, leaveTeam, kickMember, deleteTeam } = useTeams();
  const [teamDetails, setTeamDetails] = useState<TeamWithMembers | null>(null);
  const [items, setItems] = useState<TeamBoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMembers, setShowMembers] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  
  const currentUser = getStoredUser();
  const isOwner = teamDetails?.owner_id === currentUser?.id;

  useEffect(() => {
    loadTeamData();
  }, [team.id]);

  const loadTeamData = async () => {
    setLoading(true);
    const [details, teamItems] = await Promise.all([
      getTeamDetails(team.id),
      getTeamItems(team.id),
    ]);
    setTeamDetails(details);
    setItems(teamItems);
    setLoading(false);
  };

  const handleLeave = async () => {
    if (!currentUser) return;
    if (!confirm('Are you sure you want to leave this team?')) return;
    
    setActionLoading('leave');
    const result = await leaveTeam(team.id, currentUser.id);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error || 'Failed to leave team');
    }
    setActionLoading(null);
  };

  const handleKick = async (userId: string, userName: string) => {
    if (!confirm(`Remove ${userName} from the team?`)) return;
    
    setActionLoading(userId);
    const result = await kickMember(team.id, userId);
    if (result.ok) {
      await loadTeamData();
    } else {
      setError(result.error || 'Failed to remove member');
    }
    setActionLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this team? This cannot be undone.')) return;
    
    setActionLoading('delete');
    const ok = await deleteTeam(team.id);
    if (ok) {
      onClose();
    } else {
      setError('Failed to delete team');
    }
    setActionLoading(null);
  };

  const copyTeamCode = () => {
    navigator.clipboard.writeText(team.code);
  };

  // Group items by status
  const itemsByStatus = items.reduce((acc, item) => {
    const status = item.status || 'garage';
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {} as Record<string, TeamBoardItem[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏎️</span> {team.name}
            </h2>
            <button
              onClick={copyTeamCode}
              className="px-2 py-1 text-xs font-mono bg-gray-800 text-amber-400 rounded border border-gray-700 hover:border-amber-500 transition-colors"
              title="Click to copy"
            >
              {team.code}
            </button>
            <span className="text-sm text-gray-500">
              {teamDetails?.member_count || 1} member{(teamDetails?.member_count || 1) > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setShowInvite(true)}
                className="px-3 py-1.5 text-sm rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                ➕ Invite
              </button>
            )}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showMembers 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              👥 Members
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-6 py-2 bg-red-900/50 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Members panel (collapsible) */}
          {showMembers && teamDetails && (
            <div className="w-64 border-r border-gray-800 p-4 overflow-y-auto bg-gray-900/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Team Members</h3>
              <div className="space-y-2">
                {teamDetails.members?.map((member) => (
                  <div 
                    key={member.user_id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 group"
                  >
                    {member.user_picture ? (
                      <img 
                        src={member.user_picture} 
                        alt="" 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                        {member.user_name?.[0] || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">
                        {member.user_name || member.user_email}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {member.role}
                      </div>
                    </div>
                    
                    {/* Kick button (owner only, can't kick self or other owners) */}
                    {isOwner && member.user_id !== currentUser?.id && member.role !== 'owner' && (
                      <button
                        onClick={() => handleKick(member.user_id, member.user_name || 'this member')}
                        disabled={actionLoading === member.user_id}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 transition-opacity"
                        title="Remove from team"
                      >
                        {actionLoading === member.user_id ? '...' : '✕'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Team actions */}
              <div className="mt-6 pt-4 border-t border-gray-800 space-y-2">
                {!isOwner && (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading === 'leave'}
                    className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-800"
                  >
                    {actionLoading === 'leave' ? 'Leaving...' : '🚪 Leave Team'}
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading === 'delete'}
                    className="w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-800"
                  >
                    {actionLoading === 'delete' ? 'Deleting...' : '🗑️ Delete Team'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Board */}
          <div className="flex-1 p-4 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-3xl mb-2 animate-pulse">🏎️</div>
                  Loading team board...
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏁</div>
                  <div className="text-lg mb-1">No shared items yet</div>
                  <div className="text-sm text-gray-600">
                    Share work items from your board to collaborate with your team
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 h-full min-w-max">
                {(['garage', 'on_track', 'pits', 'checkered'] as const).map((status) => (
                  <div 
                    key={status}
                    className="w-72 flex-shrink-0 bg-gray-800/30 rounded-lg p-3"
                  >
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                      <span>{STATUS_CONFIG[status].emoji}</span>
                      {STATUS_CONFIG[status].label}
                      <span className="ml-auto text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">
                        {itemsByStatus[status]?.length || 0}
                      </span>
                    </h3>
                    
                    <div className="space-y-2">
                      {itemsByStatus[status]?.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onOpenItem?.(item.id)}
                          className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors group"
                        >
                          <div className="font-medium text-white text-sm mb-1 line-clamp-2">
                            {item.title}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {item.grid_points && (
                              <span className="px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded">
                                {item.grid_points} GP
                              </span>
                            )}
                            {item.due_at && (
                              <span className="text-gray-600">
                                📅 {new Date(item.due_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 pt-2 border-t border-gray-700 flex items-center gap-2 text-xs text-gray-600">
                            <span>Shared by {item.shared_by_name || 'Unknown'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invite Dialog */}
      <InviteMemberDialog
        teamId={team.id}
        teamName={team.name}
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvited={() => loadTeamData()}
      />
    </div>
  );
};
