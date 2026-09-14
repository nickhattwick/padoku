import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import {
  createTeam,
  getTeam,
  getUserTeams,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  inviteTeamMember,
  joinTeam,
  approveMember,
  rejectMember,
  removeMember,
  leaveTeam,
  shareWorkItem,
  unshareWorkItem,
  getTeamWorkItems,
  searchUsers,
  getUserProfile,
  updateUserProfile,
  getPendingInvites,
  acceptInvite,
  declineInvite,
} from '../services/TeamService.js';

const router = Router();

// All team routes require authentication
router.use(requireAuth);

// ============ TEAM CRUD ============

const createTeamSchema = z.object({
  name: z.string().min(1).max(50),
  is_public: z.boolean().optional().default(false),
});

/**
 * POST /teams
 * Create a new team
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const input = createTeamSchema.parse(req.body);
    const team = createTeam(req.user!.id, input);
    return res.status(201).json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    console.error('Create team error:', error);
    return res.status(500).json({ error: 'Failed to create team' });
  }
});

/**
 * GET /teams
 * Get all teams for current user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const teams = getUserTeams(req.user!.id);
    return res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    return res.status(500).json({ error: 'Failed to get teams' });
  }
});

/**
 * GET /teams/invites
 * Get pending invites for current user
 */
router.get('/invites', async (req: Request, res: Response) => {
  try {
    const invites = getPendingInvites(req.user!.id);
    return res.json(invites);
  } catch (error) {
    console.error('Get invites error:', error);
    return res.status(500).json({ error: 'Failed to get invites' });
  }
});

/**
 * POST /teams/invites/:teamId/accept
 * Accept a team invite
 */
router.post('/invites/:teamId/accept', async (req: Request, res: Response) => {
  try {
    const result = acceptInvite(req.params.teamId, req.user!.id);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Accept invite error:', error);
    return res.status(500).json({ error: 'Failed to accept invite' });
  }
});

/**
 * POST /teams/invites/:teamId/decline
 * Decline a team invite
 */
router.post('/invites/:teamId/decline', async (req: Request, res: Response) => {
  try {
    const result = declineInvite(req.params.teamId, req.user!.id);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Decline invite error:', error);
    return res.status(500).json({ error: 'Failed to decline invite' });
  }
});

/**
 * GET /teams/:id
 * Get team details with members
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = getTeam(req.params.id, req.user!.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    return res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    return res.status(500).json({ error: 'Failed to get team' });
  }
});

const updateTeamSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  is_public: z.boolean().optional(),
});

/**
 * PATCH /teams/:id
 * Update team (owner/admin only)
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const input = updateTeamSchema.parse(req.body);
    const team = updateTeam(req.params.id, req.user!.id, input);
    if (!team) {
      return res.status(404).json({ error: 'Team not found or not authorized' });
    }
    return res.json(team);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    console.error('Update team error:', error);
    return res.status(500).json({ error: 'Failed to update team' });
  }
});

/**
 * DELETE /teams/:id
 * Delete team (owner only)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = deleteTeam(req.params.id, req.user!.id);
    if (!success) {
      return res.status(404).json({ error: 'Team not found or not authorized' });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Delete team error:', error);
    return res.status(500).json({ error: 'Failed to delete team' });
  }
});

// ============ TEAM MEMBERS ============

/**
 * GET /teams/:id/members
 * Get team members
 */
router.get('/:id/members', async (req: Request, res: Response) => {
  try {
    const members = getTeamMembers(req.params.id, req.user!.id);
    if (!members) {
      return res.status(404).json({ error: 'Team not found or not a member' });
    }
    return res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    return res.status(500).json({ error: 'Failed to get members' });
  }
});

const inviteMemberSchema = z.object({
  user_id: z.string().min(1),
});

/**
 * POST /teams/:id/invite
 * Invite a user to team (creates 'invited' status)
 */
router.post('/:id/invite', async (req: Request, res: Response) => {
  try {
    const input = inviteMemberSchema.parse(req.body);
    const result = inviteTeamMember(req.params.id, req.user!.id, input.user_id);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json(result.member);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    console.error('Invite member error:', error);
    return res.status(500).json({ error: 'Failed to invite member' });
  }
});

const joinTeamSchema = z.object({
  code: z.string().length(6),
});

/**
 * POST /teams/join
 * Join a team by code (invited users join immediately, others go to pending)
 */
router.post('/join', async (req: Request, res: Response) => {
  try {
    const input = joinTeamSchema.parse(req.body);
    const result = joinTeam(req.user!.id, input.code);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ 
      team: result.team,
      status: result.status, // 'active' or 'pending'
      message: result.status === 'pending' 
        ? 'Join request sent. Waiting for approval.' 
        : 'Successfully joined team!'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid team code format' });
    }
    console.error('Join team error:', error);
    return res.status(500).json({ error: 'Failed to join team' });
  }
});

/**
 * POST /teams/:id/members/:userId/approve
 * Approve a pending member (owner/admin only)
 */
router.post('/:id/members/:userId/approve', async (req: Request, res: Response) => {
  try {
    const result = approveMember(req.params.id, req.user!.id, req.params.userId);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Approve member error:', error);
    return res.status(500).json({ error: 'Failed to approve member' });
  }
});

/**
 * POST /teams/:id/members/:userId/reject
 * Reject a pending member (owner/admin only)
 */
router.post('/:id/members/:userId/reject', async (req: Request, res: Response) => {
  try {
    const result = rejectMember(req.params.id, req.user!.id, req.params.userId);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Reject member error:', error);
    return res.status(500).json({ error: 'Failed to reject member' });
  }
});

/**
 * DELETE /teams/:id/members/:userId
 * Remove a member (owner/admin only, or self)
 */
router.delete('/:id/members/:userId', async (req: Request, res: Response) => {
  try {
    const isSelf = req.params.userId === req.user!.id;
    const result = isSelf 
      ? leaveTeam(req.params.id, req.user!.id)
      : removeMember(req.params.id, req.user!.id, req.params.userId);
    
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
});

// ============ TEAM WORK ITEMS ============

/**
 * GET /teams/:id/items
 * Get all work items shared with team
 */
router.get('/:id/items', async (req: Request, res: Response) => {
  try {
    const items = getTeamWorkItems(req.params.id, req.user!.id);
    if (!items) {
      return res.status(404).json({ error: 'Team not found or not a member' });
    }
    return res.json(items);
  } catch (error) {
    console.error('Get team items error:', error);
    return res.status(500).json({ error: 'Failed to get team items' });
  }
});

const shareWorkItemSchema = z.object({
  work_item_id: z.string().min(1),
  include_children: z.boolean().optional().default(true),
});

/**
 * POST /teams/:id/share
 * Share a work item with team
 */
router.post('/:id/share', async (req: Request, res: Response) => {
  try {
    const input = shareWorkItemSchema.parse(req.body);
    const result = shareWorkItem(
      req.params.id, 
      req.user!.id, 
      input.work_item_id, 
      input.include_children
    );
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true, sharedCount: result.sharedCount });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    console.error('Share item error:', error);
    return res.status(500).json({ error: 'Failed to share item' });
  }
});

/**
 * DELETE /teams/:id/share/:itemId
 * Unshare a work item from team
 */
router.delete('/:id/share/:itemId', async (req: Request, res: Response) => {
  try {
    const result = unshareWorkItem(req.params.id, req.user!.id, req.params.itemId);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('Unshare item error:', error);
    return res.status(500).json({ error: 'Failed to unshare item' });
  }
});

// ============ USER SEARCH & PROFILES ============

/**
 * GET /teams/users/search
 * Search for users (by name, email, or profile code)
 */
router.get('/users/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return res.json([]);
    }
    const users = searchUsers(query, req.user!.id);
    return res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ error: 'Failed to search users' });
  }
});

/**
 * GET /teams/users/profile
 * Get current user's profile
 */
router.get('/users/profile', async (req: Request, res: Response) => {
  try {
    const profile = getUserProfile(req.user!.id);
    return res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to get profile' });
  }
});

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  is_public: z.boolean().optional(),
});

/**
 * PATCH /teams/users/profile
 * Update current user's profile
 */
router.patch('/users/profile', async (req: Request, res: Response) => {
  try {
    const input = updateProfileSchema.parse(req.body);
    const profile = updateUserProfile(req.user!.id, input);
    return res.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
