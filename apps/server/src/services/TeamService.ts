import { getDb, saveDatabase } from '../db/database.js';
import { randomUUID } from 'crypto';
import type { 
  Team, 
  TeamMember, 
  UserProfile,
  TeamWithMembers,
  TeamBoardItem,
  CreateTeamInput,
  UpdateTeamInput,
} from '@paddock/shared';

// Generate a 6-character invite code
function generateTeamCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No confusing chars (0/O, 1/I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate a profile code
function generateProfileCode(): string {
  return generateTeamCode(); // Same format
}

// ============ TEAM CRUD ============

export function createTeam(userId: string, input: CreateTeamInput): Team {
  const db = getDb();
  const id = randomUUID();
  const code = generateTeamCode();
  const now = Date.now();

  // Create team
  db.run(
    `INSERT INTO teams (id, name, code, owner_id, is_public, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.name, code, userId, input.is_public ? 1 : 0, now, now]
  );

  // Add owner as member
  db.run(
    `INSERT INTO team_members (team_id, user_id, role, status, joined_at)
     VALUES (?, ?, 'owner', 'active', ?)`,
    [id, userId, now]
  );

  saveDatabase();

  return {
    id,
    name: input.name,
    code,
    owner_id: userId,
    is_public: input.is_public || false,
    max_members: 10,
    created_at: now,
    updated_at: now,
    member_count: 1,
  };
}

export function getTeam(teamId: string, userId: string): TeamWithMembers | null {
  const db = getDb();
  
  // Check if user is a member
  const memberCheck = db.exec(
    `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, userId]
  );
  if (memberCheck.length === 0 || memberCheck[0].values.length === 0) {
    return null;
  }

  // Get team
  const teamResult = db.exec(
    `SELECT t.*, 
            (SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND status = 'active') as member_count,
            u.name as owner_name
     FROM teams t
     LEFT JOIN users u ON t.owner_id = u.id
     WHERE t.id = ?`,
    [teamId]
  );

  if (teamResult.length === 0 || teamResult[0].values.length === 0) {
    return null;
  }

  const row = teamResult[0].values[0];
  const cols = teamResult[0].columns;
  const team: TeamWithMembers = {
    id: row[cols.indexOf('id')] as string,
    name: row[cols.indexOf('name')] as string,
    code: row[cols.indexOf('code')] as string,
    owner_id: row[cols.indexOf('owner_id')] as string,
    is_public: row[cols.indexOf('is_public')] === 1,
    max_members: row[cols.indexOf('max_members')] as number || 10,
    created_at: row[cols.indexOf('created_at')] as number,
    updated_at: row[cols.indexOf('updated_at')] as number,
    member_count: row[cols.indexOf('member_count')] as number,
    owner_name: row[cols.indexOf('owner_name')] as string,
    members: [],
  };

  // Get members
  team.members = getTeamMembers(teamId, userId) || [];

  return team;
}

export function getTeamByCode(code: string): Team | null {
  const db = getDb();
  const result = db.exec(
    `SELECT t.*, 
            (SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND status = 'active') as member_count
     FROM teams t WHERE code = ?`,
    [code.toUpperCase()]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  const cols = result[0].columns;
  return {
    id: row[cols.indexOf('id')] as string,
    name: row[cols.indexOf('name')] as string,
    code: row[cols.indexOf('code')] as string,
    owner_id: row[cols.indexOf('owner_id')] as string,
    is_public: row[cols.indexOf('is_public')] === 1,
    max_members: row[cols.indexOf('max_members')] as number || 10,
    created_at: row[cols.indexOf('created_at')] as number,
    updated_at: row[cols.indexOf('updated_at')] as number,
    member_count: row[cols.indexOf('member_count')] as number,
  };
}

export function getUserTeams(userId: string): Team[] {
  const db = getDb();
  const result = db.exec(
    `SELECT t.*, 
            (SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND status = 'active') as member_count,
            tm.role as my_role,
            tm.status as my_status
     FROM teams t
     JOIN team_members tm ON t.id = tm.team_id
     WHERE tm.user_id = ?
     ORDER BY t.name`,
    [userId]
  );

  if (result.length === 0) {
    return [];
  }

  const cols = result[0].columns;
  return result[0].values.map(row => ({
    id: row[cols.indexOf('id')] as string,
    name: row[cols.indexOf('name')] as string,
    code: row[cols.indexOf('code')] as string,
    owner_id: row[cols.indexOf('owner_id')] as string,
    is_public: row[cols.indexOf('is_public')] === 1,
    max_members: row[cols.indexOf('max_members')] as number || 10,
    created_at: row[cols.indexOf('created_at')] as number,
    updated_at: row[cols.indexOf('updated_at')] as number,
    member_count: row[cols.indexOf('member_count')] as number,
  }));
}

export function getPendingInvites(userId: string): Array<Team & { invited_at: number }> {
  const db = getDb();
  const result = db.exec(
    `SELECT t.*, tm.joined_at as invited_at
     FROM teams t
     JOIN team_members tm ON t.id = tm.team_id
     WHERE tm.user_id = ? AND tm.status = 'invited'
     ORDER BY tm.joined_at DESC`,
    [userId]
  );

  if (result.length === 0) {
    return [];
  }

  const cols = result[0].columns;
  return result[0].values.map(row => ({
    id: row[cols.indexOf('id')] as string,
    name: row[cols.indexOf('name')] as string,
    code: row[cols.indexOf('code')] as string,
    owner_id: row[cols.indexOf('owner_id')] as string,
    is_public: row[cols.indexOf('is_public')] === 1,
    max_members: row[cols.indexOf('max_members')] as number || 10,
    created_at: row[cols.indexOf('created_at')] as number,
    updated_at: row[cols.indexOf('updated_at')] as number,
    invited_at: row[cols.indexOf('invited_at')] as number,
  }));
}

export function acceptInvite(teamId: string, userId: string): { ok: boolean; error?: string } {
  const db = getDb();

  // Check if user has an invite
  const result = db.exec(
    `SELECT status FROM team_members WHERE team_id = ? AND user_id = ?`,
    [teamId, userId]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return { ok: false, error: 'No invite found' };
  }

  const status = result[0].values[0][0];
  if (status !== 'invited') {
    return { ok: false, error: 'No pending invite' };
  }

  db.run(
    `UPDATE team_members SET status = 'active', joined_at = ? WHERE team_id = ? AND user_id = ?`,
    [Date.now(), teamId, userId]
  );

  saveDatabase();
  return { ok: true };
}

export function declineInvite(teamId: string, userId: string): { ok: boolean; error?: string } {
  const db = getDb();

  const result = db.exec(
    `SELECT status FROM team_members WHERE team_id = ? AND user_id = ?`,
    [teamId, userId]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return { ok: false, error: 'No invite found' };
  }

  db.run(
    `DELETE FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'invited'`,
    [teamId, userId]
  );

  saveDatabase();
  return { ok: true };
}

export function updateTeam(teamId: string, userId: string, input: UpdateTeamInput): Team | null {
  const db = getDb();

  // Check if user is owner or admin
  const memberResult = db.exec(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, userId]
  );
  if (memberResult.length === 0 || memberResult[0].values.length === 0) {
    return null;
  }
  const role = memberResult[0].values[0][0] as string;
  if (role !== 'owner' && role !== 'admin') {
    return null;
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    params.push(input.name);
  }
  if (input.is_public !== undefined) {
    updates.push('is_public = ?');
    params.push(input.is_public ? 1 : 0);
  }

  if (updates.length === 0) {
    return getTeam(teamId, userId);
  }

  updates.push('updated_at = ?');
  params.push(Date.now());
  params.push(teamId);

  db.run(`UPDATE teams SET ${updates.join(', ')} WHERE id = ?`, params);
  saveDatabase();

  return getTeam(teamId, userId);
}

export function deleteTeam(teamId: string, userId: string): boolean {
  const db = getDb();

  // Only owner can delete
  const teamResult = db.exec(
    `SELECT owner_id FROM teams WHERE id = ?`,
    [teamId]
  );
  if (teamResult.length === 0 || teamResult[0].values.length === 0) {
    return false;
  }
  if (teamResult[0].values[0][0] !== userId) {
    return false;
  }

  db.run('DELETE FROM teams WHERE id = ?', [teamId]);
  saveDatabase();
  return true;
}

// ============ TEAM MEMBERS ============

export function getTeamMembers(teamId: string, userId: string): TeamMember[] | null {
  const db = getDb();

  // Check if user is a member
  const memberCheck = db.exec(
    `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?`,
    [teamId, userId]
  );
  if (memberCheck.length === 0 || memberCheck[0].values.length === 0) {
    return null;
  }

  const result = db.exec(
    `SELECT tm.*, u.name as user_name, u.email as user_email, u.picture as user_picture
     FROM team_members tm
     LEFT JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = ?
     ORDER BY tm.role, tm.joined_at`,
    [teamId]
  );

  if (result.length === 0) {
    return [];
  }

  const cols = result[0].columns;
  return result[0].values.map(row => ({
    team_id: row[cols.indexOf('team_id')] as string,
    user_id: row[cols.indexOf('user_id')] as string,
    role: row[cols.indexOf('role')] as 'owner' | 'admin' | 'member',
    status: row[cols.indexOf('status')] as 'active' | 'pending' | 'invited',
    team_project_id: row[cols.indexOf('team_project_id')] as string | null,
    joined_at: row[cols.indexOf('joined_at')] as number,
    user_name: row[cols.indexOf('user_name')] as string,
    user_email: row[cols.indexOf('user_email')] as string,
    user_picture: row[cols.indexOf('user_picture')] as string,
  }));
}

export function inviteTeamMember(
  teamId: string, 
  inviterId: string, 
  inviteeId: string
): { ok: boolean; error?: string; member?: TeamMember } {
  const db = getDb();

  // Check if inviter is owner/admin
  const inviterResult = db.exec(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, inviterId]
  );
  if (inviterResult.length === 0 || inviterResult[0].values.length === 0) {
    return { ok: false, error: 'Not authorized to invite members' };
  }
  const role = inviterResult[0].values[0][0] as string;
  if (role !== 'owner' && role !== 'admin') {
    return { ok: false, error: 'Not authorized to invite members' };
  }

  // Check team size
  const countResult = db.exec(
    `SELECT COUNT(*) as count, max_members 
     FROM team_members tm 
     JOIN teams t ON tm.team_id = t.id 
     WHERE tm.team_id = ? AND tm.status IN ('active', 'invited')`,
    [teamId]
  );
  const count = countResult[0].values[0][0] as number;
  const maxMembers = countResult[0].values[0][1] as number || 10;
  if (count >= maxMembers) {
    return { ok: false, error: 'Team is full' };
  }

  // Check if already a member
  const existingResult = db.exec(
    `SELECT status FROM team_members WHERE team_id = ? AND user_id = ?`,
    [teamId, inviteeId]
  );
  if (existingResult.length > 0 && existingResult[0].values.length > 0) {
    return { ok: false, error: 'User is already a member or has a pending request' };
  }

  // Add as invited
  const now = Date.now();
  db.run(
    `INSERT INTO team_members (team_id, user_id, role, status, joined_at)
     VALUES (?, ?, 'member', 'invited', ?)`,
    [teamId, inviteeId, now]
  );
  saveDatabase();

  return {
    ok: true,
    member: {
      team_id: teamId,
      user_id: inviteeId,
      role: 'member',
      status: 'invited',
      team_project_id: null,
      joined_at: now,
    },
  };
}

export function joinTeam(
  userId: string, 
  code: string
): { ok: boolean; error?: string; team?: Team; status?: string } {
  const db = getDb();

  // Find team by code
  const team = getTeamByCode(code);
  if (!team) {
    return { ok: false, error: 'Invalid team code' };
  }

  // Check team size
  if (team.member_count && team.member_count >= team.max_members) {
    return { ok: false, error: 'Team is full' };
  }

  // Check if already a member
  const existingResult = db.exec(
    `SELECT status FROM team_members WHERE team_id = ? AND user_id = ?`,
    [team.id, userId]
  );

  if (existingResult.length > 0 && existingResult[0].values.length > 0) {
    const existingStatus = existingResult[0].values[0][0] as string;
    
    if (existingStatus === 'active') {
      return { ok: false, error: 'Already a member of this team' };
    }
    
    if (existingStatus === 'invited') {
      // Accept the invite - join immediately
      db.run(
        `UPDATE team_members SET status = 'active' WHERE team_id = ? AND user_id = ?`,
        [team.id, userId]
      );
      saveDatabase();
      
      // Create team project for user
      createTeamProjectForUser(team.id, userId, team.name);
      
      return { ok: true, team, status: 'active' };
    }
    
    if (existingStatus === 'pending') {
      return { ok: false, error: 'Your join request is already pending approval' };
    }
  }

  // Not invited - create pending request
  const now = Date.now();
  db.run(
    `INSERT INTO team_members (team_id, user_id, role, status, joined_at)
     VALUES (?, ?, 'member', 'pending', ?)`,
    [team.id, userId, now]
  );
  saveDatabase();

  return { ok: true, team, status: 'pending' };
}

export function requestJoinTeam(userId: string, teamId: string): { ok: boolean; error?: string } {
  // This is essentially the same as joinTeam but by team ID
  const db = getDb();
  
  const teamResult = db.exec(`SELECT code FROM teams WHERE id = ?`, [teamId]);
  if (teamResult.length === 0 || teamResult[0].values.length === 0) {
    return { ok: false, error: 'Team not found' };
  }
  
  const code = teamResult[0].values[0][0] as string;
  const result = joinTeam(userId, code);
  return { ok: result.ok, error: result.error };
}

export function approveMember(
  teamId: string, 
  approverId: string, 
  memberId: string
): { ok: boolean; error?: string } {
  const db = getDb();

  // Check if approver is owner/admin
  const approverResult = db.exec(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, approverId]
  );
  if (approverResult.length === 0 || approverResult[0].values.length === 0) {
    return { ok: false, error: 'Not authorized' };
  }
  const role = approverResult[0].values[0][0] as string;
  if (role !== 'owner' && role !== 'admin') {
    return { ok: false, error: 'Not authorized' };
  }

  // Update member status
  db.run(
    `UPDATE team_members SET status = 'active' WHERE team_id = ? AND user_id = ? AND status = 'pending'`,
    [teamId, memberId]
  );
  
  if (db.getRowsModified() === 0) {
    return { ok: false, error: 'No pending request found' };
  }

  // Get team name for project creation
  const teamResult = db.exec(`SELECT name FROM teams WHERE id = ?`, [teamId]);
  const teamName = teamResult[0].values[0][0] as string;

  // Create team project for the new member
  createTeamProjectForUser(teamId, memberId, teamName);

  saveDatabase();
  return { ok: true };
}

export function rejectMember(
  teamId: string, 
  rejecterId: string, 
  memberId: string
): { ok: boolean; error?: string } {
  const db = getDb();

  // Check if rejecter is owner/admin
  const rejecterResult = db.exec(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, rejecterId]
  );
  if (rejecterResult.length === 0 || rejecterResult[0].values.length === 0) {
    return { ok: false, error: 'Not authorized' };
  }
  const role = rejecterResult[0].values[0][0] as string;
  if (role !== 'owner' && role !== 'admin') {
    return { ok: false, error: 'Not authorized' };
  }

  db.run(
    `DELETE FROM team_members WHERE team_id = ? AND user_id = ? AND status IN ('pending', 'invited')`,
    [teamId, memberId]
  );
  saveDatabase();
  return { ok: true };
}

export function removeMember(
  teamId: string, 
  removerId: string, 
  memberId: string
): { ok: boolean; error?: string } {
  const db = getDb();

  // Check if remover is owner/admin
  const removerResult = db.exec(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, removerId]
  );
  if (removerResult.length === 0 || removerResult[0].values.length === 0) {
    return { ok: false, error: 'Not authorized' };
  }
  const role = removerResult[0].values[0][0] as string;
  if (role !== 'owner' && role !== 'admin') {
    return { ok: false, error: 'Not authorized' };
  }

  // Can't remove the owner
  const memberResult = db.exec(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ?`,
    [teamId, memberId]
  );
  if (memberResult.length > 0 && memberResult[0].values[0][0] === 'owner') {
    return { ok: false, error: 'Cannot remove the team owner' };
  }

  db.run(`DELETE FROM team_members WHERE team_id = ? AND user_id = ?`, [teamId, memberId]);
  saveDatabase();
  return { ok: true };
}

export function leaveTeam(teamId: string, userId: string): { ok: boolean; error?: string } {
  const db = getDb();

  // Check if user is the owner
  const memberResult = db.exec(
    `SELECT role FROM team_members WHERE team_id = ? AND user_id = ?`,
    [teamId, userId]
  );
  if (memberResult.length === 0 || memberResult[0].values.length === 0) {
    return { ok: false, error: 'Not a member of this team' };
  }
  if (memberResult[0].values[0][0] === 'owner') {
    return { ok: false, error: 'Owner cannot leave the team. Transfer ownership or delete the team.' };
  }

  db.run(`DELETE FROM team_members WHERE team_id = ? AND user_id = ?`, [teamId, userId]);
  saveDatabase();
  return { ok: true };
}

// ============ TEAM WORK ITEMS ============

function createTeamProjectForUser(teamId: string, userId: string, teamName: string): void {
  const db = getDb();
  const projectId = randomUUID();
  const now = Date.now();

  // Create a top-level project for the team
  db.run(
    `INSERT INTO work_items (id, user_id, title, description, status, parent_id, position, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'garage', NULL, 0, ?, ?)`,
    [projectId, userId, `🏎️ Team: ${teamName}`, `Shared items from team ${teamName}`, now, now]
  );

  // Link it to the team membership
  db.run(
    `UPDATE team_members SET team_project_id = ? WHERE team_id = ? AND user_id = ?`,
    [projectId, teamId, userId]
  );
}

export function shareWorkItem(
  teamId: string,
  userId: string,
  workItemId: string,
  includeChildren: boolean = true
): { ok: boolean; error?: string; sharedCount?: number } {
  const db = getDb();

  // Check if user is a member
  const memberResult = db.exec(
    `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, userId]
  );
  if (memberResult.length === 0 || memberResult[0].values.length === 0) {
    return { ok: false, error: 'Not a team member' };
  }

  // Check if user owns the work item
  const itemResult = db.exec(
    `SELECT user_id FROM work_items WHERE id = ?`,
    [workItemId]
  );
  if (itemResult.length === 0 || itemResult[0].values.length === 0) {
    return { ok: false, error: 'Work item not found' };
  }
  if (itemResult[0].values[0][0] !== userId) {
    return { ok: false, error: 'You can only share your own work items' };
  }

  const now = Date.now();
  let sharedCount = 0;

  // Share the item
  const shareItem = (itemId: string) => {
    const existing = db.exec(
      `SELECT 1 FROM team_work_items WHERE team_id = ? AND work_item_id = ?`,
      [teamId, itemId]
    );
    if (existing.length === 0 || existing[0].values.length === 0) {
      const id = randomUUID();
      db.run(
        `INSERT INTO team_work_items (id, team_id, work_item_id, shared_by, shared_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, teamId, itemId, userId, now]
      );
      sharedCount++;
    }
  };

  shareItem(workItemId);

  // Share children recursively
  if (includeChildren) {
    const shareChildren = (parentId: string) => {
      const children = db.exec(
        `SELECT id FROM work_items WHERE parent_id = ?`,
        [parentId]
      );
      if (children.length > 0) {
        for (const row of children[0].values) {
          const childId = row[0] as string;
          shareItem(childId);
          shareChildren(childId);
        }
      }
    };
    shareChildren(workItemId);
  }

  saveDatabase();
  return { ok: true, sharedCount };
}

export function unshareWorkItem(
  teamId: string,
  userId: string,
  workItemId: string
): { ok: boolean; error?: string } {
  const db = getDb();

  // Check if user shared this item or is owner/admin
  const checkResult = db.exec(
    `SELECT twi.shared_by, tm.role 
     FROM team_work_items twi
     JOIN team_members tm ON twi.team_id = tm.team_id AND tm.user_id = ?
     WHERE twi.team_id = ? AND twi.work_item_id = ?`,
    [userId, teamId, workItemId]
  );

  if (checkResult.length === 0 || checkResult[0].values.length === 0) {
    return { ok: false, error: 'Item not found or not shared with team' };
  }

  const sharedBy = checkResult[0].values[0][0] as string;
  const role = checkResult[0].values[0][1] as string;

  if (sharedBy !== userId && role !== 'owner' && role !== 'admin') {
    return { ok: false, error: 'Not authorized to unshare this item' };
  }

  db.run(
    `DELETE FROM team_work_items WHERE team_id = ? AND work_item_id = ?`,
    [teamId, workItemId]
  );
  saveDatabase();
  return { ok: true };
}

export function getTeamWorkItems(teamId: string, userId: string): TeamBoardItem[] | null {
  const db = getDb();

  // Check if user is a member
  const memberResult = db.exec(
    `SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? AND status = 'active'`,
    [teamId, userId]
  );
  if (memberResult.length === 0 || memberResult[0].values.length === 0) {
    return null;
  }

  const result = db.exec(
    `SELECT w.*, twi.team_id, twi.shared_by, twi.shared_at, 
            u.name as shared_by_name,
            a.name as assignee_name, a.picture as assignee_picture
     FROM team_work_items twi
     JOIN work_items w ON twi.work_item_id = w.id
     LEFT JOIN users u ON twi.shared_by = u.id
     LEFT JOIN users a ON w.assignee_id = a.id
     WHERE twi.team_id = ?
     ORDER BY w.position`,
    [teamId]
  );

  if (result.length === 0) {
    return [];
  }

  const cols = result[0].columns;
  return result[0].values.map(row => ({
    id: row[cols.indexOf('id')] as string,
    user_id: row[cols.indexOf('user_id')] as string,
    title: row[cols.indexOf('title')] as string,
    description: row[cols.indexOf('description')] as string | null,
    status: row[cols.indexOf('status')] as 'garage' | 'on_track' | 'pits' | 'checkered',
    parent_id: row[cols.indexOf('parent_id')] as string | null,
    due_at: row[cols.indexOf('due_at')] as number | null,
    grid_points: row[cols.indexOf('grid_points')] as number | null,
    is_goal: row[cols.indexOf('is_goal')] === 1,
    goal_end_condition: row[cols.indexOf('goal_end_condition')] as string | null,
    goal_target: row[cols.indexOf('goal_target')] as number | null,
    is_recurring_template: row[cols.indexOf('is_recurring_template')] === 1,
    recurrence_rule: row[cols.indexOf('recurrence_rule')] as string | null,
    position: row[cols.indexOf('position')] as number,
    created_at: row[cols.indexOf('created_at')] as number,
    updated_at: row[cols.indexOf('updated_at')] as number,
    team_id: row[cols.indexOf('team_id')] as string,
    shared_by: row[cols.indexOf('shared_by')] as string,
    shared_by_name: row[cols.indexOf('shared_by_name')] as string,
    shared_at: row[cols.indexOf('shared_at')] as number,
    assignee_id: row[cols.indexOf('assignee_id')] as string | null,
    assignee_name: row[cols.indexOf('assignee_name')] as string,
    assignee_picture: row[cols.indexOf('assignee_picture')] as string,
  }));
}

// ============ USER SEARCH & PROFILES ============

export function searchUsers(query: string, currentUserId: string): UserProfile[] {
  const db = getDb();
  const searchTerm = `%${query}%`;

  // Search public users or by exact profile code
  const result = db.exec(
    `SELECT id, email, name, display_name, picture, is_public, profile_code, created_at
     FROM users
     WHERE id != ?
       AND (
         (is_public = 1 AND (name LIKE ? OR display_name LIKE ? OR email LIKE ?))
         OR profile_code = ?
       )
     LIMIT 20`,
    [currentUserId, searchTerm, searchTerm, searchTerm, query.toUpperCase()]
  );

  if (result.length === 0) {
    return [];
  }

  const cols = result[0].columns;
  return result[0].values.map(row => ({
    id: row[cols.indexOf('id')] as string,
    email: row[cols.indexOf('email')] as string,
    name: row[cols.indexOf('name')] as string | null,
    display_name: row[cols.indexOf('display_name')] as string | null,
    picture: row[cols.indexOf('picture')] as string | null,
    is_public: row[cols.indexOf('is_public')] === 1,
    profile_code: row[cols.indexOf('profile_code')] as string | null,
    created_at: row[cols.indexOf('created_at')] as number,
  }));
}

export function getUserProfile(userId: string): UserProfile | null {
  const db = getDb();
  const result = db.exec(
    `SELECT id, email, name, display_name, picture, is_public, profile_code, created_at
     FROM users WHERE id = ?`,
    [userId]
  );

  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }

  const row = result[0].values[0];
  const cols = result[0].columns;

  // Generate profile code if not exists
  let profileCode = row[cols.indexOf('profile_code')] as string | null;
  if (!profileCode) {
    profileCode = generateProfileCode();
    db.run(`UPDATE users SET profile_code = ? WHERE id = ?`, [profileCode, userId]);
    saveDatabase();
  }

  return {
    id: row[cols.indexOf('id')] as string,
    email: row[cols.indexOf('email')] as string,
    name: row[cols.indexOf('name')] as string | null,
    display_name: row[cols.indexOf('display_name')] as string | null,
    picture: row[cols.indexOf('picture')] as string | null,
    is_public: row[cols.indexOf('is_public')] === 1,
    profile_code: profileCode,
    created_at: row[cols.indexOf('created_at')] as number,
  };
}

export function updateUserProfile(
  userId: string, 
  input: { display_name?: string; is_public?: boolean }
): UserProfile | null {
  const db = getDb();
  const updates: string[] = [];
  const params: any[] = [];

  if (input.display_name !== undefined) {
    updates.push('display_name = ?');
    params.push(input.display_name);
  }
  if (input.is_public !== undefined) {
    updates.push('is_public = ?');
    params.push(input.is_public ? 1 : 0);
  }

  if (updates.length > 0) {
    params.push(userId);
    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    saveDatabase();
  }

  return getUserProfile(userId);
}
