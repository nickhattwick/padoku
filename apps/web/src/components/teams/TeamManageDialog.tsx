import { useState, useEffect } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { getStoredUser } from '../../api/auth';
import { InviteMemberDialog } from './InviteMemberDialog';
import type { Team, TeamWithMembers } from '@paddock/shared';

interface TeamManageDialogProps {
  team: Team;
  onClose: () => void;
}

export const TeamManageDialog = ({ team, onClose }: TeamManageDialogProps) => {
  const { getTeamDetails, leaveTeam, kickMember, deleteTeam } = useTeams();
  const [teamDetails, setTeamDetails] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
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
    const details = await getTeamDetails(team.id);
    setTeamDetails(details);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🏎️</span> {team.name}
            </h2>
            <button
              onClick={copyTeamCode}
              className="px-2 py-1 text-xs font-mono bg-gray-800 text-amber-400 rounded border border-gray-700 hover:border-amber-500 transition-colors"
              title="Click to copy"
            >
              {team.code}
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-6 py-2 bg-red-900/50 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-2xl mb-2 animate-pulse">🏎️</div>
              Loading...
            </div>
          ) : (
            <>
              {/* Members */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-400">
                    Team Members ({teamDetails?.member_count || 1})
                  </h3>
                  {isOwner && (
                    <button
                      onClick={() => setShowInvite(true)}
                      className="px-3 py-1 text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                    >
                      👥 Invite
                    </button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {teamDetails?.members?.map((member) => (
                    <div 
                      key={member.user_id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 group"
                    >
                      {member.user_picture ? (
                        <img 
                          src={member.user_picture} 
                          alt="" 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                          {member.user_name?.[0] || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">
                          {member.user_name || member.user_email}
                        </div>
                        <div className="text-xs text-gray-500 capitalize flex items-center gap-2">
                          {member.role === 'owner' && <span className="text-amber-400">👑</span>}
                          {member.role}
                        </div>
                      </div>
                      
                      {/* Kick button (owner only, can't kick self or other owners) */}
                      {isOwner && member.user_id !== currentUser?.id && member.role !== 'owner' && (
                        <button
                          onClick={() => handleKick(member.user_id, member.user_name || 'this member')}
                          disabled={actionLoading === member.user_id}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-2 transition-opacity"
                          title="Remove from team"
                        >
                          {actionLoading === member.user_id ? '...' : '✕'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-800 space-y-2">
                {!isOwner && (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading === 'leave'}
                    className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-800 flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'leave' ? 'Leaving...' : '🚪 Leave Team'}
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading === 'delete'}
                    className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-800 flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'delete' ? 'Deleting...' : '🗑️ Delete Team'}
                  </button>
                )}
              </div>
            </>
          )}
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
