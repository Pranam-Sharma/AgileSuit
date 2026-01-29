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
 * Fetch all columns for a specific sprint
 */
export async function getColumnsBySprintId(sprintId: string): Promise<{ data: BoardColumn[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('board_columns')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching columns:', error);
      return { data: null, error: error.message };
    }

    return { data: data as BoardColumn[], error: null };
  } catch (error) {
    console.error('Error in getColumnsBySprintId:', error);
    return { data: null, error: 'Failed to fetch columns' };
  }
}

/**
 * Create a new column
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
      .from('board_columns')
      .insert({
        ...input,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating column:', error);
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
 * Update an existing column
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
      .from('board_columns')
      .update({
        ...input,
        updated_by: user.id,
      })
      .eq('id', columnId)
      .select()
      .single();

    if (error) {
      console.error('Error updating column:', error);
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
 * Delete a column
 */
export async function deleteColumn(columnId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // First, check if there are any stories in this column
    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .select('id')
      .eq('column_id', columnId)
      .limit(1);

    if (storiesError) {
      console.error('Error checking for stories:', storiesError);
      return { success: false, error: 'Failed to check for stories in column' };
    }

    if (stories && stories.length > 0) {
      return { success: false, error: 'Cannot delete column with stories. Please move or delete all stories first.' };
    }

    // Delete the column
    const { error: deleteError } = await supabase
      .from('board_columns')
      .delete()
      .eq('id', columnId);

    if (deleteError) {
      console.error('Error deleting column:', deleteError);
      return { success: false, error: deleteError.message };
    }

    revalidatePath('/sprint/[id]/board', 'page');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteColumn:', error);
    return { success: false, error: 'Failed to delete column' };
  }
}

/**
 * Initialize default columns for a sprint (called when creating a new sprint)
 */
export async function initializeDefaultColumns(sprintId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const defaultColumns = [
      { id: 'backlog', title: 'Backlog', gradient: 'slate', position: 0 },
      { id: 'todo', title: 'To Do', gradient: 'blue', position: 1 },
      { id: 'in-progress', title: 'In Progress', gradient: 'orange', position: 2 },
      { id: 'review', title: 'In Review', gradient: 'purple', position: 3 },
      { id: 'done', title: 'Done', gradient: 'green', position: 4 },
    ];

    const columnsToInsert = defaultColumns.map(col => ({
      id: `${col.id}`,
      sprint_id: sprintId,
      title: col.title,
      gradient: col.gradient,
      position: col.position,
      created_by: user.id,
      updated_by: user.id,
    }));

    const { error } = await supabase
      .from('board_columns')
      .insert(columnsToInsert);

    if (error) {
      console.error('Error initializing default columns:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in initializeDefaultColumns:', error);
    return { success: false, error: 'Failed to initialize default columns' };
  }
}
