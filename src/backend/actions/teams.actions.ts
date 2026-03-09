'use server';

import { createAdminClient } from '@/auth/supabase/admin';
import { revalidatePath } from 'next/cache';
import { getRbacContext, requireLevel, requireDepartmentAuthority, requireTeamAuthority, RoleLevel } from '@/auth/rbac';
import { logAuditEvent } from '@/auth/audit';

// ==========================================
// DEPARTMENTS
// ==========================================

export async function createDepartmentAction(name: string, budget: number = 0, leadId?: string) {
    const context = await getRbacContext();

    // Only Level 4 can create departments
    requireLevel(context, RoleLevel.SUPER_ADMIN);

    const supabaseAdmin = createAdminClient();

    const { data: department, error } = await supabaseAdmin
        .from('departments')
        .insert({
            org_id: context.orgId,
            name,
            budget,
            lead_id: leadId || null,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create department: ' + error.message);
    }

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: 'DEPARTMENT_CREATED',
        target_id: department.id,
        new_value: { name, budget, leadId },
    });

    revalidatePath('/dashboard/team');
    return { success: true, department };
}

export async function getDepartmentsAction() {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // Query departments
    const { data: departments, error } = await supabaseAdmin
        .from('departments')
        .select(`
            *,
            lead:profiles!lead_id(id, display_name, email)
        `)
        .eq('org_id', context.orgId)
        .order('name');

    if (error) {
        console.error('Supabase Departments Fetch Error:', error);
        throw new Error('Failed to fetch departments');
    }
    return departments;
}

// ==========================================
// TEAMS
// ==========================================

export async function createTeamAction(departmentId: string, name: string, leadId?: string) {
    const context = await getRbacContext();

    // Level 3 required, and must be in their department (if L3)
    requireDepartmentAuthority(context, departmentId, RoleLevel.DEPT_HEAD);

    const supabaseAdmin = createAdminClient();

    const { data: team, error } = await supabaseAdmin
        .from('teams')
        .insert({
            org_id: context.orgId,
            department_id: departmentId,
            name,
            lead_id: leadId || null,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Failed to create team: ' + error.message);
    }

    // If lead is provided, automatically assign them as a member of the team too
    if (leadId) {
        await supabaseAdmin
            .from('team_members')
            .upsert({
                org_id: context.orgId,
                team_id: team.id,
                user_id: leadId
            }, { onConflict: 'team_id, user_id' });
    }

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: 'TEAM_CREATED',
        target_id: team.id,
        new_value: { departmentId, name, leadId },
    });

    revalidatePath('/dashboard/team');
    return { success: true, team };
}

export async function getTeamsAction(departmentId?: string) {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    let query = supabaseAdmin
        .from('teams')
        .select(`
            *,
            department:departments(name),
            lead:profiles!lead_id(id, display_name, email)
        `)
        .eq('org_id', context.orgId)
        .order('name');

    if (departmentId) {
        query = query.eq('department_id', departmentId);
    }

    const { data: teams, error } = await query;
    if (error) throw new Error('Failed to fetch teams');
    return teams;
}

// ==========================================
// PERSONNEL & RBAC MANAGEMENT
// ==========================================

export async function getOrganizationMembersAction() {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // Fetch all members in org with their department and teams
    // IMPORTANT: This requires the team_members table to exist (run m2m_team_migration.sql)
    const { data: members, error } = await supabaseAdmin
        .from('profiles')
        .select(`
            id, role_level, department_id, display_name, email,
            department:departments!department_id(name),
            memberships:team_members(
                team_id, 
                capabilities,
                team:teams(name)
            )
        `)
        .eq('org_id', context.orgId)
        .is('memberships.ended_at', null) // Only active memberships
        .order('role_level', { ascending: false });

    if (error) {
        // If the table doesn't exist yet (migration not run), we return the profiles without memberships
        // so the page can still render, but we log a clear warning.
        if (error.code === 'PGRST204' || error.message.includes('team_members')) {
            console.warn('WARNING: Missing "team_members" table. Many-to-many features will be disabled. Run m2m_team_migration.sql.');

            // Fallback fetch without memberships
            const { data: fallbackMembers, error: fallbackError } = await supabaseAdmin
                .from('profiles')
                .select(`
                    id, role_level, department_id, display_name, email,
                    department:departments!department_id(name)
                `)
                .eq('org_id', context.orgId)
                .order('role_level', { ascending: false });

            if (fallbackError) throw new Error('Failed to fetch members: ' + fallbackError.message);

            // Map to include empty memberships array to maintain type consistency
            return (fallbackMembers || []).map((m: any) => ({ ...m, memberships: [] }));
        }

        console.error('Fetch Members Error Details:', error);
        throw new Error('Failed to fetch members: ' + error.message);
    }
    return members;
}

export async function assignMemberToTeamAction(teamId: string, userId: string) {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // Authority Check: Must be Super Admin or Dept Head of the team's department
    const { data: team } = await supabaseAdmin
        .from('teams')
        .select('department_id')
        .eq('id', teamId)
        .single();

    if (!team) throw new Error('Team not found');
    requireDepartmentAuthority(context, team.department_id, RoleLevel.DEPT_HEAD);

    const { error } = await supabaseAdmin
        .from('team_members')
        .upsert({
            org_id: context.orgId,
            team_id: teamId,
            user_id: userId
        }, { onConflict: 'team_id, user_id' });

    if (error) {
        console.error('Assign Team Error:', error);
        if (error.code === 'PGRST204' || error.message.includes('team_members')) {
            throw new Error('Database migration required: Please run m2m_team_migration.sql in Supabase.');
        }
        throw new Error('Failed to assign member to team: ' + error.message);
    }

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: 'TEAM_MEMBER_ASSIGNED',
        target_id: userId,
        new_value: { team_id: teamId },
    });

    revalidatePath('/dashboard/team');
    return { success: true };
}

export async function removeMemberFromTeamAction(teamId: string, userId: string) {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // Authority Check
    const { data: team } = await supabaseAdmin
        .from('teams')
        .select('department_id')
        .eq('id', teamId)
        .single();

    if (!team) throw new Error('Team not found');
    requireDepartmentAuthority(context, team.department_id, RoleLevel.DEPT_HEAD);

    // Soft-delete the membership by setting ended_at
    const { error: softDeleteError } = await supabaseAdmin
        .from('team_members')
        .update({ ended_at: new Date().toISOString() })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .is('ended_at', null);

    if (softDeleteError) {
        console.error('Remove Team Error:', softDeleteError);
        if (softDeleteError.code === 'PGRST204' || softDeleteError.message.includes('team_members')) {
            throw new Error('Database migration required: Please run m2m_team_migration.sql in Supabase.');
        }
        throw new Error('Failed to deactivate member: ' + softDeleteError.message);
    }

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: 'TEAM_MEMBER_REMOVED',
        target_id: userId,
        old_value: { team_id: teamId },
    });

    revalidatePath('/dashboard/team');
    return { success: true };
}

export async function updateUserRoleAction(
    targetUserId: string,
    newRoleLevel: RoleLevel,
    targetDepartmentId: string | null
) {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // 1. Fetch target user's current state
    const { data: targetUser } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .eq('org_id', context.orgId)
        .single();

    if (!targetUser) throw new Error('User not found');

    // 2. Validate Authority based on Capability Matrix
    if (newRoleLevel >= RoleLevel.DEPT_HEAD || targetUser.role_level >= RoleLevel.DEPT_HEAD) {
        requireLevel(context, RoleLevel.SUPER_ADMIN);
    } else {
        if (!targetUser.department_id || !targetDepartmentId) {
            requireLevel(context, RoleLevel.SUPER_ADMIN);
        } else {
            requireDepartmentAuthority(context, targetUser.department_id, RoleLevel.DEPT_HEAD);
            requireDepartmentAuthority(context, targetDepartmentId, RoleLevel.DEPT_HEAD);
        }
    }

    // 3. Execute the Update
    const oldValues = {
        role_level: targetUser.role_level,
        department_id: targetUser.department_id
    };

    const newValues = {
        role_level: newRoleLevel,
        department_id: targetDepartmentId
    };

    const { error } = await supabaseAdmin
        .from('profiles')
        .update(newValues)
        .eq('id', targetUserId);

    if (error) throw new Error('Failed to update user role');

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: newRoleLevel > targetUser.role_level ? 'ROLE_PROMOTION' : (newRoleLevel < targetUser.role_level ? 'ROLE_DEMOTION' : 'MEMBER_REASSIGNED'),
        target_id: targetUserId,
        old_value: oldValues,
        new_value: newValues,
    });

    revalidatePath('/dashboard/team');
    return { success: true };
}

export async function removeUserFromOrgAction(targetUserId: string) {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // 1. Fetch target user
    const { data: targetUser } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .eq('org_id', context.orgId)
        .single();

    if (!targetUser) throw new Error('User not found');

    requireLevel(context, RoleLevel.SUPER_ADMIN);

    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            org_id: null,
            department_id: null,
            team_id: null,
            role_level: 1
        })
        .eq('id', targetUserId);

    if (error) throw new Error('Failed to remove user');

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: 'MEMBER_TERMINATED',
        target_id: targetUserId,
        old_value: { name: targetUser.full_name, id: targetUserId },
    });

    revalidatePath('/dashboard/team');
    return { success: true };
}

// ==========================================
// GOVERNANCE & APPROVALS
// ==========================================

export async function requestTeamJoinAction(teamId: string, userId: string, note?: string) {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // Any team lead or above can request a member to join a team
    requireLevel(context, RoleLevel.TEAM_LEAD);

    const { error } = await supabaseAdmin
        .from('team_requests')
        .insert({
            org_id: context.orgId,
            team_id: teamId,
            user_id: userId,
            requester_id: context.userId,
            request_type: 'JOIN',
            status: 'PENDING',
            note
        });

    if (error) throw new Error('Failed to submit team request: ' + error.message);

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: 'TEAM_JOIN_REQUESTED',
        target_id: userId,
        new_value: { teamId, note }
    });

    revalidatePath('/dashboard/team');
    return { success: true };
}

export async function processTeamRequestAction(requestId: string, status: 'APPROVED' | 'REJECTED') {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // Fetch the request to check department authority
    const { data: request } = await supabaseAdmin
        .from('team_requests')
        .select(`*, team:teams(department_id)`)
        .eq('id', requestId)
        .single();

    if (!request) throw new Error('Request not found');

    // Only Dept Head or Super Admin can process
    requireDepartmentAuthority(context, request.team.department_id, RoleLevel.DEPT_HEAD);

    const { error: updateError } = await supabaseAdmin
        .from('team_requests')
        .update({
            status,
            processed_by: context.userId,
            processed_at: new Date().toISOString()
        })
        .eq('id', requestId);

    if (updateError) throw new Error('Failed to process request: ' + updateError.message);

    if (status === 'APPROVED') {
        // Create the active membership
        await assignMemberToTeamAction(request.team_id, request.user_id);
    }

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: status === 'APPROVED' ? 'TEAM_JOIN_APPROVED' : 'TEAM_JOIN_REJECTED',
        target_id: request.user_id,
        new_value: { requestId, teamId: request.team_id }
    });

    revalidatePath('/dashboard/team');
    return { success: true };
}

export async function getPendingTeamRequestsAction() {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
        .from('team_requests')
        .select(`
            *,
            user:profiles!user_id(id, display_name, email),
            requester:profiles!requester_id(id, display_name, email),
            team:teams(id, name, department_id)
        `)
        .eq('org_id', context.orgId)
        .eq('status', 'PENDING');

    if (error) throw new Error('Failed to fetch requests');

    // Filter by authority (Only show requests user has power to approve)
    if (context.roleLevel === RoleLevel.SUPER_ADMIN) return data;

    // For Dept Heads, only show requests for their department
    if (context.roleLevel === RoleLevel.DEPT_HEAD) {
        return data.filter((r: any) => r.team.department_id === context.departmentId);
    }

    return []; // Members/Leads don't see pending queue
}

export async function updateMemberCapabilitiesAction(teamId: string, userId: string, capabilities: any) {
    const context = await getRbacContext();
    const supabaseAdmin = createAdminClient();

    // Authority Check
    const { data: team } = await supabaseAdmin
        .from('teams')
        .select('department_id')
        .eq('id', teamId)
        .single();

    if (!team) throw new Error('Team not found');
    requireDepartmentAuthority(context, team.department_id, RoleLevel.DEPT_HEAD);

    const { error } = await supabaseAdmin
        .from('team_members')
        .update({ capabilities })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .is('ended_at', null);

    if (error) throw new Error('Failed to update capabilities: ' + error.message);

    await logAuditEvent({
        org_id: context.orgId,
        actor_id: context.userId,
        action_type: 'CAPABILITIES_UPDATED',
        target_id: userId,
        new_value: { teamId, capabilities }
    });

    revalidatePath('/dashboard/team');
    return { success: true };
}
