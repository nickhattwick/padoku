import { useState, useEffect } from 'react';
import { useTeams } from '../../hooks/useTeams';
import { TeamBoardView } from './TeamBoardView';
import type { Team } from '@paddock/shared';

interface TeamsPanelProps {
  onSelectTeam?: (team: Team) => void;
  onOpenItem?: (itemId: string) => void;
}

export const TeamsPanel = ({ onSelectTeam, onOpenItem }: TeamsPanelProps) => {
  const { teams, loading, createTeam, joinTeam, getPendingInvites, acceptInvite, declineInvite } = useTeams();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [invites, setInvites] = useState<Array<Team & { invited_at: number }>>([]);
  const [inviteAction, setInviteAction] = useState<string | null>(null);

  // Load pending invites
  useEffect(() => {
    getPendingInvites().then(setInvites);
  }, [teams]); // Refresh when teams change

  const handleAcceptInvite = async (teamId: string) => {
    setInviteAction(teamId);
    const ok = await acceptInvite(teamId);
    if (ok) {
      setInvites(prev => prev.filter(i => i.id !== teamId));
    }
    setInviteAction(null);
  };

  const handleDeclineInvite = async (teamId: string) => {
    setInviteAction(teamId);
    const ok = await declineInvite(teamId);
    if (ok) {
      setInvites(prev => prev.filter(i => i.id !== teamId));
    }
    setInviteAction(null);
  };

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
      <div className="px-4 py-3 flex items-center justify-between bg-gray-800/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-bold">🏎️ Teams</span>
          {(teams.length > 0 || invites.length > 0) && (
            <span className="text-xs bg-amber-600 text-white px-1.5 py-0.5 rounded-full">
              {teams.length}{invites.length > 0 && <span className="text-amber-200">+{invites.length}</span>}
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
            <div className="p-3 bg-gray-800 rounded-lg space-y-2 border border-gray-700">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name..."
                className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none placeholder-gray-500"
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
            <div className="p-3 bg-gray-800 rounded-lg space-y-2 border border-gray-700">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Team code (e.g. ABC123)"
                className="w-full px-3 py-2 text-white bg-gray-900 border border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none uppercase placeholder-gray-500 font-mono tracking-wider"
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

          {/* Pending invites */}
          {invites.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-amber-400 mb-2 px-1">
                📬 Pending Invites
              </div>
              <div className="space-y-2">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg"
                  >
                    <div className="font-medium text-white text-sm mb-2">
                      {invite.name}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvite(invite.id)}
                        disabled={inviteAction === invite.id}
                        className="flex-1 px-2 py-1.5 text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white rounded transition-colors"
                      >
                        {inviteAction === invite.id ? '...' : '✓ Accept'}
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(invite.id)}
                        disabled={inviteAction === invite.id}
                        className="flex-1 px-2 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 rounded transition-colors"
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team list */}
          {loading ? (
            <div className="text-center text-gray-400 text-sm py-3">Loading...</div>
          ) : teams.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-6">
              <div className="text-2xl mb-2">🏁</div>
              <div className="font-medium">No teams yet</div>
              <div className="text-gray-500 mt-1 text-xs">Create or join one!</div>
            </div>
          ) : (
            teams.map((team) => (
              <TeamItem
                key={team.id}
                team={team}
                onSelectTeam={() => {
                  if (onSelectTeam) {
                    onSelectTeam(team);
                  } else {
                    setSelectedTeam(team);
                  }
                }}
                onOpenItem={onOpenItem}
              />
            ))
          )}
        </div>
      )}

      {/* Team Board View Modal */}
      {selectedTeam && (
        <TeamBoardView
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onOpenItem={onOpenItem}
        />
      )}
    </div>
  );
};

interface TeamItemProps {
  team: Team;
  onSelectTeam?: () => void;
  onOpenItem?: (itemId: string) => void;
}

const TeamItem = ({ team, onSelectTeam, onOpenItem }: TeamItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const { getTeamItems } = useTeams();

  const handleExpand = async () => {
    if (!isExpanded && items.length === 0) {
      setLoadingItems(true);
      const teamItems = await getTeamItems(team.id);
      setItems(teamItems);
      setLoadingItems(false);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-1">
      <div className="group flex items-center gap-1 px-2 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all">
        {/* Expand arrow */}
        <button
          onClick={handleExpand}
          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white rounded hover:bg-gray-600"
        >
          {loadingItems ? (
            <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        
        {/* Team name - click to open full view */}
        <button 
          onClick={onSelectTeam}
          className="flex-1 text-left text-sm text-white font-medium truncate hover:text-amber-400"
        >
          {team.name}
        </button>
        
        <span className="text-xs text-gray-500">
          {team.member_count || 1} 👤
        </span>
      </div>

      {/* Expanded team items */}
      {isExpanded && (
        <div className="ml-3 space-y-1 border-l border-gray-700 pl-2">
          {items.length === 0 && !loadingItems && (
            <div className="text-xs text-gray-600 py-2 pl-2">No shared items</div>
          )}
          {items.map((item) => (
            <TeamTreeItem
              key={item.id}
              item={item}
              onOpenItem={onOpenItem}
              level={0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Tree item for team shared items (with recursive children)
interface TeamTreeItemProps {
  item: any;
  onOpenItem?: (itemId: string) => void;
  level: number;
}

const TeamTreeItem = ({ item, onOpenItem, level }: TeamTreeItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExpand = async () => {
    if (!isExpanded && children.length === 0) {
      setLoading(true);
      try {
        const res = await fetch(`/api/work-items/${item.id}/children`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('paddock_auth_token')}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChildren(data);
        }
      } catch {}
      setLoading(false);
    }
    setIsExpanded(!isExpanded);
  };

  // Status indicator colors
  const statusColors: Record<string, string> = {
    garage: 'bg-gray-500',
    on_track: 'bg-green-500',
    pits: 'bg-yellow-500',
    checkered: 'bg-blue-500',
  };

  return (
    <div className="space-y-1">
      <div 
        className="group flex items-center gap-1 px-2 py-1.5 rounded hover:bg-gray-800 transition-colors"
        style={{ paddingLeft: `${level * 8 + 8}px` }}
      >
        {/* Expand arrow */}
        <button
          onClick={(e) => { e.stopPropagation(); handleExpand(); }}
          className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-white"
        >
          {loading ? (
            <div className="w-2 h-2 border border-gray-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className={`w-2 h-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* Status dot */}
        <div className={`w-2 h-2 rounded-full ${statusColors[item.status] || 'bg-gray-500'}`} />
        
        {/* Item title */}
        <button
          onClick={() => onOpenItem?.(item.id)}
          className="flex-1 text-left text-sm text-gray-300 hover:text-white truncate"
        >
          {item.title}
        </button>

        {/* Grid points */}
        {item.grid_points && (
          <span className="text-xs text-purple-400">{item.grid_points}</span>
        )}
      </div>

      {/* Children */}
      {isExpanded && children.length > 0 && (
        <div className="space-y-1">
          {children.map((child) => (
            <TeamTreeItem
              key={child.id}
              item={child}
              onOpenItem={onOpenItem}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
