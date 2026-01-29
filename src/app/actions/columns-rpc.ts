'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface BoardColumn {
  id: string;
  sprint_id: string;
  title: string;
  gradient: string;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
}

export interface CreateColumnInput {
  id: string;
  sprint_id: string;
  title: string;
  gradient: string;
  position: number;
}

export interface UpdateColumnInput {
  title?: string;
  gradient?: string;
  position?: number;
}

/**
 * Fetch all columns for a specific sprint using RPC function
 * This bypasses PostgREST schema cache issues
 */
export async function getColumnsBySprintId(sprintId: string): Promise<{ data: BoardColumn[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .rpc('get_sprint_columns', { p_sprint_id: sprintId });

    if (error) {
      console.error('Error fetching columns via RPC:', error);
      return { data: null, error: error.message };
    }

    return { data: data as BoardColumn[], error: null };
  } catch (error) {
    console.error('Error in getColumnsBySprintId:', error);
    return { data: null, error: 'Failed to fetch columns' };
  }
}

/**
 * Create a new column using RPC function
 */
export async function createColumn(input: CreateColumnInput): Promise<{ data: BoardColumn | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .rpc('create_sprint_column', {
        p_id: input.id,
        p_sprint_id: input.sprint_id,
        p_title: input.title,
        p_gradient: input.gradient,
        p_position: input.position
      })
      .single();

    if (error) {
      console.error('Error creating column via RPC:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/sprint/[id]/board', 'page');
    return { data: data as BoardColumn, error: null };
  } catch (error) {
    console.error('Error in createColumn:', error);
    return { data: null, error: 'Failed to create column' };
  }
}

/**
 * Update an existing column using RPC function
 */
export async function updateColumn(
  columnId: string,
  input: UpdateColumnInput
): Promise<{ data: BoardColumn | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .rpc('update_sprint_column', {
        p_id: columnId,
        p_title: input.title || null,
        p_gradient: input.gradient || null,
        p_position: input.position || null
      })
      .single();

    if (error) {
      console.error('Error updating column via RPC:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/sprint/[id]/board', 'page');
    return { data: data as BoardColumn, error: null };
  } catch (error) {
    console.error('Error in updateColumn:', error);
    return { data: null, error: 'Failed to update column' };
  }
}

/**
 * Delete a column using RPC function
 */
export async function deleteColumn(columnId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .rpc('delete_sprint_column', { p_id: columnId });

    if (error) {
      console.error('Error deleting column via RPC:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/sprint/[id]/board', 'page');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error in deleteColumn:', error);
    return { success: false, error: error.message || 'Failed to delete column' };
  }
}

/**
 * Initialize default columns for a sprint using RPC function
 */
export async function initializeDefaultColumns(sprintId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .rpc('init_default_columns', { p_sprint_id: sprintId });

    if (error) {
      console.error('Error initializing default columns via RPC:', error);
      return { success: false, error: error.message };
    }

    return { success: data === true, error: null };
  } catch (error) {
    console.error('Error in initializeDefaultColumns:', error);
    return { success: false, error: 'Failed to initialize default columns' };
  }
}
