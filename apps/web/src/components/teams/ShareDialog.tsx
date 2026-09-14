import { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import type { Team } from '@paddock/shared';

interface ShareDialogProps {
  workItemId: string;
  workItemTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onShared?: () => void;
}

export const ShareDialog = ({
  workItemId,
  workItemTitle,
  isOpen,
  onClose,
  onShared,
}: ShareDialogProps) => {
  const { teams, shareWorkItem } = useTeams();
  const [sharing, setSharing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleShare = async (team: Team) => {
    setSharing(team.id);
    setError(null);
    setSuccess(null);

    const ok = await shareWorkItem(team.id, workItemId);
    
    if (ok) {
      setSuccess(team.name);
      setTimeout(() => {
        onShared?.();
        onClose();
      }, 1000);
    } else {
      setError('Failed to share. Item may already be shared.');
    }
    
    setSharing(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🏎️</span> Share to Team
            </h3>
            <p className="text-sm text-gray-400 mt-1 truncate max-w-[300px]">
              {workItemTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏁</div>
              <div className="text-green-400 font-medium">
                Shared to {success}!
              </div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏎️</div>
              <div className="text-gray-400 mb-2">No teams yet</div>
              <p className="text-sm text-gray-600">
                Create or join a team first to share items
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-4">
                Select a team to share this item with:
              </p>
              
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleShare(team)}
                  disabled={sharing !== null}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all disabled:opacity-50"
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{team.name}</div>
                    <div className="text-xs text-gray-500">
                      {team.member_count || 1} member{(team.member_count || 1) > 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {sharing === team.id ? (
                    <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 px-3 py-2 text-sm text-red-400 bg-red-900/30 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
