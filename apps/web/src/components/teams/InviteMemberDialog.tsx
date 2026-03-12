import { useState, useEffect, useCallback } from 'react';
import { getStoredToken } from '../../api/auth';

interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

interface InviteMemberDialogProps {
  teamId: string;
  teamName: string;
  isOpen: boolean;
  onClose: () => void;
  onInvited?: () => void;
}

export const InviteMemberDialog = ({
  teamId,
  teamName,
  isOpen,
  onClose,
  onInvited,
}: InviteMemberDialogProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const token = getStoredToken();

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/teams/users/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // Ignore errors
      }
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, token]);

  const handleInvite = async (user: User) => {
    setInviting(user.id);
    setError(null);

    try {
      const res = await fetch(`/api/teams/${teamId}/invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSuccess(user.name || user.email);
        setQuery('');
        setResults([]);
        onInvited?.();
        
        setTimeout(() => {
          setSuccess(null);
        }, 2000);
      } else {
        setError(data.error || 'Failed to invite');
      }
    } catch {
      setError('Network error');
    }
    
    setInviting(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>👥</span> Invite to {teamName}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Search by email or name
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
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500"
              autoFocus
            />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Success message */}
          {success && (
            <div className="mt-4 px-4 py-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300 text-sm">
              ✓ Invited {success} to the team!
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {results.length === 0 && query.length >= 2 && !searching && (
              <div className="text-center text-gray-500 py-4">
                No users found matching "{query}"
              </div>
            )}
            
            {results.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors"
              >
                {user.picture ? (
                  <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                    {user.name?.[0] || user.email[0].toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {user.name || 'No name'}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {user.email}
                  </div>
                </div>
                
                <button
                  onClick={() => handleInvite(user)}
                  disabled={inviting === user.id}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {inviting === user.id ? '...' : 'Invite'}
                </button>
              </div>
            ))}
          </div>

          {/* Hint */}
          {query.length < 2 && results.length === 0 && (
            <div className="mt-4 text-center text-gray-500 text-sm">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
