import { useState, useEffect, useCallback } from 'react';
import { getStoredToken } from '../api/auth';
import type { Team, TeamWithMembers, UserProfile, TeamBoardItem } from '@paddock/shared';

const API_BASE = '/api/teams';

export function useTeams() {
  const token = getStoredToken();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch teams');
      const data = await res.json();
      setTeams(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = async (name: string): Promise<Team | null> => {
    if (!token) return null;
    
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create team');
      const team = await res.json();
      setTeams(prev => [...prev, team]);
      return team;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  };

  const joinTeam = async (code: string): Promise<{ team?: Team; error?: string }> => {
    if (!token) return { error: 'Not authenticated' };
    
    try {
      const res = await fetch(`${API_BASE}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to join team' };
      await fetchTeams();
      return { team: data };
    } catch (e) {
      return { error: (e as Error).message };
    }
  };

  const getTeamDetails = async (teamId: string): Promise<TeamWithMembers | null> => {
    if (!token) return null;
    
    try {
      const res = await fetch(`${API_BASE}/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const getTeamItems = async (teamId: string): Promise<TeamBoardItem[]> => {
    if (!token) return [];
    
    try {
      const res = await fetch(`${API_BASE}/${teamId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const shareWorkItem = async (teamId: string, workItemId: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/${teamId}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ work_item_id: workItemId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const deleteTeam = async (teamId: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/${teamId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTeams(prev => prev.filter(t => t.id !== teamId));
      }
      return res.ok;
    } catch {
      return false;
    }
  };

  const leaveTeam = async (teamId: string, userId: string): Promise<{ ok: boolean; error?: string }> => {
    if (!token) return { ok: false, error: 'Not authenticated' };
    
    try {
      const res = await fetch(`${API_BASE}/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTeams(prev => prev.filter(t => t.id !== teamId));
        return { ok: true };
      }
      return { ok: false, error: data.error || 'Failed to leave team' };
    } catch {
      return { ok: false, error: 'Network error' };
    }
  };

  const kickMember = async (teamId: string, userId: string): Promise<{ ok: boolean; error?: string }> => {
    if (!token) return { ok: false, error: 'Not authenticated' };
    
    try {
      const res = await fetch(`${API_BASE}/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'Failed to remove member' };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error' };
    }
  };

  const assignWorkItem = async (workItemId: string, assigneeId: string | null): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const res = await fetch(`/api/work-items/${workItemId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignee_id: assigneeId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  const getPendingInvites = async (): Promise<Array<Team & { invited_at: number }>> => {
    if (!token) return [];
    
    try {
      const res = await fetch(`${API_BASE}/invites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  const acceptInvite = async (teamId: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/invites/${teamId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchTeams();
      }
      return res.ok;
    } catch {
      return false;
    }
  };

  const declineInvite = async (teamId: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/invites/${teamId}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  return {
    teams,
    loading,
    error,
    createTeam,
    joinTeam,
    getTeamDetails,
    getTeamItems,
    shareWorkItem,
    deleteTeam,
    leaveTeam,
    kickMember,
    assignWorkItem,
    getPendingInvites,
    acceptInvite,
    declineInvite,
    refreshTeams: fetchTeams,
  };
}

export function useUserProfile() {
  const token = getStoredToken();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    fetch(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setProfile)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'display_name' | 'is_public'>>): Promise<boolean> => {
    if (!token) return false;
    
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: updates.display_name,
          isPublic: updates.is_public,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      }
      return res.ok;
    } catch {
      return false;
    }
  };

  return { profile, loading, updateProfile };
}

export function useTeamMembers(teamId: string | null) {
  const token = getStoredToken();
  const [members, setMembers] = useState<TeamWithMembers['members']>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !teamId) {
      setMembers([]);
      return;
    }
    
    setLoading(true);
    fetch(`${API_BASE}/${teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((team: TeamWithMembers) => setMembers(team.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [token, teamId]);

  return { members, loading };
}
