import { createClient } from '@/lib/supabase/server';

export enum RoleLevel {
    MEMBER = 1,
    TEAM_LEAD = 2,
    DEPT_HEAD = 3,
    SUPER_ADMIN = 4,
}

export interface RbacContext {
    userId: string;
    orgId: string;
    roleLevel: RoleLevel;
    departmentId: string | null;
    teamId: string | null;
}

/**
 * Retrieves the current user's full RBAC context from the database.
 * Throws an error if unauthorized.
 */
export async function getRbacContext(): Promise<RbacContext> {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error("getRbacContext Auth Error:", authError, "User:", user);
        throw new Error('Unauthorized: User not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('org_id, role_level, department_id, team_id')
        .eq('id', user.id)
        .single();

    if (profileError || !profile?.org_id) {
        console.error("getRbacContext Profile Error:", profileError, "Profile:", profile);
        throw new Error('Unauthorized: User profile or organization not found');
    }

    console.log("getRbacContext SUCCESS:", profile);

    return {
        userId: user.id,
        orgId: profile.org_id,
        roleLevel: profile.role_level as RoleLevel,
        departmentId: profile.department_id,
        teamId: profile.team_id,
    };
}

/**
 * Basic capability check: Does the user meet the raw power level?
 */
export function requireLevel(context: RbacContext, requiredLevel: RoleLevel) {
    if (context.roleLevel < requiredLevel) {
        throw new Error(`Forbidden: Requires Role Level ${requiredLevel}`);
    }
}

/**
 * Validates if the user has authority OVER a given department.
 * Super Admins (Level 4) have global authority.
 * Dept Heads (Level 3) only have authority if the target department matches their own.
 */
export function requireDepartmentAuthority(context: RbacContext, targetDepartmentId: string, requiredLevel: RoleLevel = RoleLevel.DEPT_HEAD) {
    requireLevel(context, requiredLevel);

    // Level 4 spans all departments
    if (context.roleLevel >= RoleLevel.SUPER_ADMIN) return;

    // Level 3 limits to their own department
    if (context.departmentId !== targetDepartmentId) {
        throw new Error('Forbidden: Out of Department scope');
    }
}

/**
 * Validates if the user has authority OVER a specific team.
 * Level 4: Global
 * Level 3: Within their department
 * Level 2: Only their specific team
 */
export function requireTeamAuthority(context: RbacContext, targetDepartmentId: string, targetTeamId: string, requiredLevel: RoleLevel = RoleLevel.TEAM_LEAD) {
    requireLevel(context, requiredLevel);
    if (context.roleLevel >= RoleLevel.SUPER_ADMIN) return;

    // Level 3: Dept Head can manage any team in their department
    if (context.roleLevel === RoleLevel.DEPT_HEAD) {
        if (context.departmentId !== targetDepartmentId) {
            throw new Error('Forbidden: Out of Department scope');
        }
        return;
    }

    // Level 2: Team Lead can only manage their specific team
    if (context.roleLevel === RoleLevel.TEAM_LEAD) {
        if (context.teamId !== targetTeamId) {
            throw new Error('Forbidden: Out of Team scope');
        }
    }
}
