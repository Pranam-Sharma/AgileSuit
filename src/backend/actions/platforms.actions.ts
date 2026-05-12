'use server';

import { createClient } from '@/auth/supabase/server';
import { revalidatePath } from 'next/cache';
import { getRbacContext } from '@/auth/rbac';

export interface Platform {
    id: string;
    org_id: string;
    name: string;
    code: string;
}

/**
 * Get all platforms for the current organization
 */
export async function getPlatformsAction() {
    try {
        const context = await getRbacContext();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('platforms')
            .select('*')
            .eq('org_id', context.orgId)
            .order('name');

        if (error) throw error;
        return data as Platform[];
    } catch (error) {
        console.error('Error fetching platforms:', error);
        return [];
    }
}

/**
 * Create a new platform
 */
export async function createPlatformAction(name: string, code: string) {
    try {
        const context = await getRbacContext();
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('platforms')
            .insert({
                org_id: context.orgId,
                name,
                code: code.toUpperCase()
            })
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/dashboard/team');
        revalidatePath('/settings');
        return { success: true, platform: data };
    } catch (error: any) {
        console.error('Error creating platform:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing platform
 */
export async function updatePlatformAction(id: string, name: string, code: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('platforms')
            .update({ name, code: code.toUpperCase() })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/dashboard/team');
        revalidatePath('/settings');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating platform:', error);
        return { success: false, error: error.message };
    }
}
