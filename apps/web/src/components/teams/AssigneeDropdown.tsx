import { useState, useEffect, useRef } from 'react';
import { useTeams, useTeamMembers } from '../../hooks/useTeams';

interface AssigneeDropdownProps {
  workItemId: string;
  currentAssigneeId: string | null;
  teamId?: string | null;
  onAssign: (userId: string | null) => void;
  disabled?: boolean;
}

// workItemId is kept for future use (tracking assignments)

export const AssigneeDropdown = ({
  workItemId: _workItemId, // Reserved for future use
  currentAssigneeId,
  teamId,
  onAssign,
  disabled,
}: AssigneeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teamId || null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { teams } = useTeams();
  const { members, loading: membersLoading } = useTeamMembers(selectedTeamId);
  
  // Find current assignee
  const currentAssignee = members.find(m => m.user_id === currentAssigneeId);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAssign = (userId: string | null) => {
    onAssign(userId);
    setIsOpen(false);
  };

  if (teams.length === 0) {
    return (
      <div className="text-xs text-gray-600">
        Join a team to assign items
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-sm hover:border-gray-500 transition-colors disabled:opacity-50 w-full"
      >
        {currentAssignee ? (
          <>
            {currentAssignee.user_picture ? (
              <img 
                src={currentAssignee.user_picture} 
                alt=""
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
                {currentAssignee.user_name?.[0] || '?'}
              </div>
            )}
            <span className="text-white truncate">
              {currentAssignee.user_name || currentAssignee.user_email}
            </span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full border border-dashed border-gray-500 flex items-center justify-center">
              <span className="text-gray-500 text-xs">+</span>
            </div>
            <span className="text-gray-400">Unassigned</span>
          </>
        )}
        
        <svg className="w-4 h-4 ml-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
          {/* Team selector (if multiple teams) */}
          {teams.length > 1 && (
            <div className="p-2 border-b border-gray-700">
              <select
                value={selectedTeamId || ''}
                onChange={(e) => setSelectedTeamId(e.target.value || null)}
                className="w-full px-2 py-1 text-sm bg-gray-900 border border-gray-700 rounded text-white"
              >
                <option value="">Select team...</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Auto-select first team if only one */}
          {teams.length === 1 && !selectedTeamId && (
            <div className="hidden">
              {(() => { setSelectedTeamId(teams[0].id); return null; })()}
            </div>
          )}

          {/* Members list */}
          <div className="max-h-64 overflow-y-auto">
            {/* Unassign option */}
            {currentAssigneeId && (
              <button
                onClick={() => handleAssign(null)}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-700 text-left transition-colors"
              >
                <div className="w-6 h-6 rounded-full border border-dashed border-gray-500 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">✕</span>
                </div>
                <span className="text-gray-400">Unassign</span>
              </button>
            )}
            
            {membersLoading ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                Loading...
              </div>
            ) : !selectedTeamId ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                Select a team first
              </div>
            ) : members.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                No members found
              </div>
            ) : (
              members.map((member) => (
                <button
                  key={member.user_id}
                  onClick={() => handleAssign(member.user_id)}
                  className={`w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-700 text-left transition-colors ${
                    member.user_id === currentAssigneeId ? 'bg-purple-900/30' : ''
                  }`}
                >
                  {member.user_picture ? (
                    <img 
                      src={member.user_picture} 
                      alt=""
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">
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
                  {member.user_id === currentAssigneeId && (
                    <span className="text-purple-400">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
