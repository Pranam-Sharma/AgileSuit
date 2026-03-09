'use server';

import { createClient } from '@/auth/supabase/server';
import { revalidatePath } from 'next/cache';

// ==================== Type Definitions ====================

export type SprintGoalData = {
    id: string;
    description: string;
    status: string;
    remark: string;
    order: number;
};

export type MilestonePhaseData = {
    id: string;
    name: string;
    pic: string;
    start_date: string | null;
    due_date: string | null;
    status: string;
    remarks: string;
};

export type MilestoneData = {
    id: string;
    name: string;
    start_date: string | null;
    end_date: string | null;
    status: string;
    description: string;
    phases: MilestonePhaseData[];
};

export type DemoItemData = {
    id: string;
    topic: string;
    presenter: string;
    due_date: string | null;
    due_time: string;
    status: string;
    attendees: string;
    description: string;
    duration: string;
};

export type AllocationData = {
    project_id: string;
    allocated_percent: number;
};

export type HolidayData = {
    id: string;
    country: string;
    days: number;
};

export type DeveloperLeaveData = {
    id: string;
    name: string;
    country: string;
    capacity: number;
    planned_leave: number;
};

export type PlatformData = {
    id: string;
    name: string;
    members: string[];
    total_story_points: number;
    allocations: AllocationData[];
    target_improvement: number;
    target_velocity: number;
    holidays: HolidayData[];
    developer_leaves: DeveloperLeaveData[];
};

export type ProjectPriorityData = {
    id: string;
    name: string;
    code: string;
    priority: number;
    allocation: number;
    color: string;
    icon: string;
};

export type SprintPlanningData = {
    sprint_id: string;
    // General Info
    start_date: string | null;
    end_date: string | null;
    sprint_days: number;
    // Team Composition (stored as JSON)
    team_members: any[];
    // Project Priorities
    projects: ProjectPriorityData[];
    // Platform Metrics
    platforms: PlatformData[];
    // Sprint Goals
    goals: SprintGoalData[];
    // Milestones
    milestones: MilestoneData[];
    // Sprint Demo
    demo_items: DemoItemData[];
    // Checklist state
    checklist: Record<string, boolean>;
};

// ==================== Helper Functions ====================

async function getAuthenticatedUserOrg() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

    if (profileError || !profile?.org_id) {
        throw new Error('User is not part of an organization');
    }

    return { user, orgId: profile.org_id };
}

// ==================== Save Sprint Planning ====================

export async function saveSprintPlanningAction(data: SprintPlanningData) {
    const { user, orgId } = await getAuthenticatedUserOrg();

    const { createAdminClient } = await import('@/auth/supabase/admin');
    const supabaseAdmin = createAdminClient();

    // Verify the sprint belongs to the user's organization
    const { data: sprint, error: sprintError } = await supabaseAdmin
        .from('sprints')
        .select('id')
        .eq('id', data.sprint_id)
        .eq('org_slug', orgId)
        .single();

    if (sprintError || !sprint) {
        throw new Error('Sprint not found or access denied');
    }

    // Check if planning record already exists
    const { data: existingPlanning } = await supabaseAdmin
        .from('sprint_planning')
        .select('id')
        .eq('sprint_id', data.sprint_id)
        .single();

    const planningRecord = {
        sprint_id: data.sprint_id,
        org_slug: orgId,
        start_date: data.start_date,
        end_date: data.end_date,
        sprint_days: data.sprint_days,
        team_members: data.team_members,
        projects: data.projects,
        platforms: data.platforms,
        goals: data.goals,
        milestones: data.milestones,
        demo_items: data.demo_items,
        checklist: data.checklist,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
    };

    let result;
    if (existingPlanning) {
        // Update existing record
        result = await supabaseAdmin
            .from('sprint_planning')
            .update(planningRecord)
            .eq('id', existingPlanning.id)
            .select()
            .single();
    } else {
        // Insert new record
        result = await supabaseAdmin
            .from('sprint_planning')
            .insert({
                ...planningRecord,
                created_by: user.id,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();
    }

    if (result.error) {
        console.error('Error saving sprint planning:', result.error);
        throw new Error('Failed to save sprint planning');
    }

    // Sync dates with the sprints table
    if (data.start_date || data.end_date) {
        await supabaseAdmin
            .from('sprints')
            .update({
                start_date: data.start_date,
                end_date: data.end_date,
            })
            .eq('id', data.sprint_id);
    }

    revalidatePath(`/sprint/${data.sprint_id}/planning`);
    revalidatePath('/dashboard');
    return { success: true, data: result.data };
}

// ==================== Get Sprint Planning ====================

export async function getSprintPlanningAction(sprintId: string) {
    const { orgId } = await getAuthenticatedUserOrg();

    const { createAdminClient } = await import('@/auth/supabase/admin');
    const supabaseAdmin = createAdminClient();

    // Fetch planning data
    const { data: planning, error } = await supabaseAdmin
        .from('sprint_planning')
        .select('*')
        .eq('sprint_id', sprintId)
        .eq('org_slug', orgId)
        .single();

    if (error) {
        // No planning data exists yet - try to get dates from sprints table
        if (error.code === 'PGRST116') {
            const { data: sprint } = await supabaseAdmin
                .from('sprints')
                .select('start_date, end_date')
                .eq('id', sprintId)
                .eq('org_slug', orgId)
                .single();

            if (sprint && (sprint.start_date || sprint.end_date)) {
                return {
                    start_date: sprint.start_date,
                    end_date: sprint.end_date,
                };
            }
            return null;
        }
        console.error('Error fetching sprint planning:', error);
        return null;
    }

    return planning;
}

// ==================== Auto-save specific sections ====================

export async function saveSprintGoalsAction(sprintId: string, goals: SprintGoalData[]) {
    const { user, orgId } = await getAuthenticatedUserOrg();

    const { createAdminClient } = await import('@/auth/supabase/admin');
    const supabaseAdmin = createAdminClient();

    // Check if planning record exists, create if not
    const { data: existingPlanning } = await supabaseAdmin
        .from('sprint_planning')
        .select('id')
        .eq('sprint_id', sprintId)
        .eq('org_slug', orgId)
        .single();

    if (existingPlanning) {
        const { error } = await supabaseAdmin
            .from('sprint_planning')
            .update({
                goals,
                updated_by: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingPlanning.id);

        if (error) throw new Error('Failed to save goals');
    } else {
        const { error } = await supabaseAdmin
            .from('sprint_planning')
            .insert({
                sprint_id: sprintId,
                org_slug: orgId,
                goals,
                created_by: user.id,
                updated_by: user.id,
            });

        if (error) throw new Error('Failed to save goals');
    }

    return { success: true };
}

export async function saveSprintDemosAction(sprintId: string, demoItems: DemoItemData[]) {
    const { user, orgId } = await getAuthenticatedUserOrg();

    const { createAdminClient } = await import('@/auth/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: existingPlanning } = await supabaseAdmin
        .from('sprint_planning')
        .select('id')
        .eq('sprint_id', sprintId)
        .eq('org_slug', orgId)
        .single();

    if (existingPlanning) {
        const { error } = await supabaseAdmin
            .from('sprint_planning')
            .update({
                demo_items: demoItems,
                updated_by: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingPlanning.id);

        if (error) throw new Error('Failed to save demos');
    } else {
        const { error } = await supabaseAdmin
            .from('sprint_planning')
            .insert({
                sprint_id: sprintId,
                org_slug: orgId,
                demo_items: demoItems,
                created_by: user.id,
                updated_by: user.id,
            });

        if (error) throw new Error('Failed to save demos');
    }

    return { success: true };
}

export async function saveSprintMilestonesAction(sprintId: string, milestones: MilestoneData[]) {
    const { user, orgId } = await getAuthenticatedUserOrg();

    const { createAdminClient } = await import('@/auth/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: existingPlanning } = await supabaseAdmin
        .from('sprint_planning')
        .select('id')
        .eq('sprint_id', sprintId)
        .eq('org_slug', orgId)
        .single();

    if (existingPlanning) {
        const { error } = await supabaseAdmin
            .from('sprint_planning')
            .update({
                milestones,
                updated_by: user.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existingPlanning.id);

        if (error) throw new Error('Failed to save milestones');
    } else {
        const { error } = await supabaseAdmin
            .from('sprint_planning')
            .insert({
                sprint_id: sprintId,
                org_slug: orgId,
                milestones,
                created_by: user.id,
                updated_by: user.id,
            });

        if (error) throw new Error('Failed to save milestones');
    }

    return { success: true };
}
