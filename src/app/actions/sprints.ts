'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type CreateSprintData = {
    sprintNumber: string;
    sprintName: string;
    projectName: string;
    department: string;
    team: string;
    facilitatorName?: string;
    plannedPoints?: number;
    completedPoints?: number;
};

export async function createSprintAction(data: CreateSprintData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // 1. Get User's Organization
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

    if (profileError || !profile?.org_id) {
        throw new Error('User is not part of an organization');
    }

    // 2. Insert Sprint using Admin Client to bypass RLS
    // We already verified the user and their org above
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: sprint, error } = await supabaseAdmin
        .from('sprints')
        .insert({
            org_slug: profile.org_id,
            sprint_number: data.sprintNumber,
            name: data.sprintName, // Mapped to 'name' column in DB
            project_name: data.projectName,
            department: data.department,
            team: data.team,
            facilitator_name: data.facilitatorName,
            // planned_points: data.plannedPoints || 0, // Columns don't exist in DB yet
            // completed_points: data.completedPoints || 0,
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating sprint:', error);
        throw new Error('Failed to create sprint');
    }

    revalidatePath('/dashboard');
    return { success: true, sprint };
}

export async function getSprintsAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // 1. Get User's Organization
    const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

    if (!profile?.org_id) {
        return [];
    }

    // 2. Fetch Sprints using Admin Client (to bypass RLS for now)
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabaseAdmin = createAdminClient();

    const { data: sprints, error } = await supabaseAdmin
        .from('sprints')
        .select('*')
        .eq('org_slug', profile.org_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching sprints:', error);
        return [];
    }

    // Map DB fields to UI model
    return sprints.map(s => ({
        id: s.id,
        sprintNumber: s.sprint_number,
        sprintName: s.name,
        projectName: s.project_name,
        department: s.department,
        team: s.team,
        facilitatorName: s.facilitator_name,
        plannedPoints: s.planned_points,
        completedPoints: s.completed_points,
        userId: s.created_by,
        isFacilitator: false // default
    }));
}
