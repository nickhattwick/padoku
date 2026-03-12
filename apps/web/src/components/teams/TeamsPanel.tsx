import { useState } from 'react';
import { useTeams } from '../../hooks/useTeams';
import type { Team } from '@paddock/shared';

interface TeamsPanelProps {
  onSelectTeam?: (team: Team) => void;
}

export const TeamsPanel = ({ onSelectTeam }: TeamsPanelProps) => {
  const { teams, loading, createTeam, joinTeam } = useTeams();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTeamName.trim()) return;
    setCreating(true);
    setError('');
    
    const team = await createTeam(newTeamName.trim());
    if (team) {
      setNewTeamName('');
      setShowCreate(false);
    } else {
      setError('Failed to create team');
    }
    setCreating(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setCreating(true);
    setError('');
    
    const result = await joinTeam(joinCode.trim().toUpperCase());
    if (result.team) {
      setJoinCode('');
      setShowJoin(false);
    } else {
      setError(result.error || 'Failed to join team');
    }
    setCreating(false);
  };

  return (
    <div className="border-t border-gray-800 pt-2 mt-2">
      {/* Header */}
      <div className="px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium">🏎️ Teams</span>
          {teams.length > 0 && (
            <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">
              {teams.length}
            </span>
          )}
        </button>
        
        <div className="flex gap-1">
          <button
            onClick={() => { setShowJoin(!showJoin); setShowCreate(false); setError(''); }}
            className="p-1 text-gray-500 hover:text-cyan-400 transition-colors rounded hover:bg-gray-800"
            title="Join team"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>
          <button
            onClick={() => { setShowCreate(!showCreate); setShowJoin(false); setError(''); }}
            className="p-1 text-gray-500 hover:text-green-400 transition-colors rounded hover:bg-gray-800"
            title="Create team"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-2 pb-2 space-y-1">
          {/* Create form */}
          {showCreate && (
            <div className="p-2 bg-gray-800/50 rounded-lg space-y-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name..."
                className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded focus:border-green-500 focus:outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || !newTeamName.trim()}
                  className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  {creating ? '...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Join form */}
          {showJoin && (
            <div className="p-2 bg-gray-800/50 rounded-lg space-y-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Team code (e.g. ABC123)"
                className="w-full px-2 py-1.5 text-sm bg-gray-900 border border-gray-700 rounded focus:border-cyan-500 focus:outline-none uppercase"
                maxLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleJoin}
                  disabled={creating || joinCode.length < 6}
                  className="flex-1 px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                >
                  {creating ? '...' : 'Join'}
                </button>
                <button
                  onClick={() => setShowJoin(false)}
                  className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="px-2 py-1 text-xs text-red-400 bg-red-900/30 rounded">
              {error}
            </div>
          )}

          {/* Team list */}
          {loading ? (
            <div className="text-center text-gray-600 text-xs py-2">Loading...</div>
          ) : teams.length === 0 ? (
            <div className="text-center text-gray-600 text-xs py-4">
              <div className="text-lg mb-1">🏁</div>
              No teams yet
              <div className="text-gray-700 mt-1">Create or join one!</div>
            </div>
          ) : (
            teams.map((team) => (
              <TeamItem
                key={team.id}
                team={team}
                onClick={() => onSelectTeam?.(team)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const TeamItem = ({ team, onClick }: { team: Team; onClick?: () => void }) => {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="group flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all cursor-pointer">
      <button onClick={onClick} className="flex-1 text-left text-sm truncate">
        {team.name}
      </button>
      
      <span className="text-xs text-gray-600">
        {team.member_count || 1} 👤
      </span>
      
      <button
        onClick={(e) => { e.stopPropagation(); setShowCode(!showCode); }}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-amber-400 transition-all p-1 rounded hover:bg-gray-700"
        title={showCode ? team.code : 'Show team code'}
      >
        {showCode ? (
          <span className="text-xs font-mono text-amber-400">{team.code}</span>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        )}
      </button>
    </div>
  );
};
