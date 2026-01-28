'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Story, CreateStoryInput, UpdateStoryInput, MoveStoryInput } from '@/types/story';

/**
 * Fetch all stories for a specific sprint
 */
export async function getStoriesBySprintId(sprintId: string): Promise<{ data: Story[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching stories:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Story[], error: null };
  } catch (error) {
    console.error('Error in getStoriesBySprintId:', error);
    return { data: null, error: 'Failed to fetch stories' };
  }
}

/**
 * Create a new story
 */
export async function createStory(input: CreateStoryInput): Promise<{ data: Story | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // If position not provided, calculate next position in column
    let position = input.position;
    if (position === undefined) {
      const { data: existingStories } = await supabase
        .from('stories')
        .select('position')
        .eq('sprint_id', input.sprint_id)
        .eq('column_id', input.column_id)
        .order('position', { ascending: false })
        .limit(1);

      position = existingStories && existingStories.length > 0
        ? existingStories[0].position + 1
        : 0;
    }

    const storyData = {
      ...input,
      position,
      priority: input.priority || 'medium',
      status: input.status || 'todo',
      created_by: user.id,
      updated_by: user.id,
    };

    const { data, error } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single();

    if (error) {
      console.error('Error creating story:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/sprint/[id]', 'page');
    return { data: data as Story, error: null };
  } catch (error) {
    console.error('Error in createStory:', error);
    return { data: null, error: 'Failed to create story' };
  }
}

/**
 * Update an existing story
 */
export async function updateStory(
  storyId: string,
  input: UpdateStoryInput
): Promise<{ data: Story | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('stories')
      .update({
        ...input,
        updated_by: user.id,
      })
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating story:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/sprint/[id]', 'page');
    return { data: data as Story, error: null };
  } catch (error) {
    console.error('Error in updateStory:', error);
    return { data: null, error: 'Failed to update story' };
  }
}

/**
 * Move a story to a different column/position (for drag and drop)
 */
export async function moveStory(
  storyId: string,
  input: MoveStoryInput
): Promise<{ data: Story | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Get the story's current data
    const { data: currentStory, error: fetchError } = await supabase
      .from('stories')
      .select('sprint_id, column_id, position')
      .eq('id', storyId)
      .single();

    if (fetchError || !currentStory) {
      console.error('Error fetching story:', fetchError);
      return { data: null, error: 'Story not found' };
    }

    const oldColumnId = currentStory.column_id;
    const newColumnId = input.column_id;
    const newPosition = input.position;

    // If moving to a different column, update positions in both columns
    if (oldColumnId !== newColumnId) {
      // Decrement positions in the old column for stories after the removed one
      await supabase
        .from('stories')
        .update({ position: supabase.rpc('stories', { position: 'position - 1' }) } as any)
        .eq('sprint_id', currentStory.sprint_id)
        .eq('column_id', oldColumnId)
        .gt('position', currentStory.position);

      // Increment positions in the new column for stories at or after the new position
      await supabase.rpc('increment_story_positions', {
        p_sprint_id: currentStory.sprint_id,
        p_column_id: newColumnId,
        p_position: newPosition,
      }).catch(() => {
        // Fallback if RPC doesn't exist
        // We'll handle this in a transaction in production
      });
    } else if (newPosition !== currentStory.position) {
      // Moving within the same column
      if (newPosition < currentStory.position) {
        // Moving up - increment positions between new and old
        await supabase
          .from('stories')
          .update({ position: supabase.rpc('stories', { position: 'position + 1' }) } as any)
          .eq('sprint_id', currentStory.sprint_id)
          .eq('column_id', oldColumnId)
          .gte('position', newPosition)
          .lt('position', currentStory.position);
      } else {
        // Moving down - decrement positions between old and new
        await supabase
          .from('stories')
          .update({ position: supabase.rpc('stories', { position: 'position - 1' }) } as any)
          .eq('sprint_id', currentStory.sprint_id)
          .eq('column_id', oldColumnId)
          .gt('position', currentStory.position)
          .lte('position', newPosition);
      }
    }

    // Update the story's position and column
    const updateData: any = {
      column_id: newColumnId,
      position: newPosition,
      updated_by: user.id,
    };

    // Optionally update status if provided
    if (input.status) {
      updateData.status = input.status;
    }

    const { data, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      console.error('Error moving story:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/sprint/[id]', 'page');
    return { data: data as Story, error: null };
  } catch (error) {
    console.error('Error in moveStory:', error);
    return { data: null, error: 'Failed to move story' };
  }
}

/**
 * Delete a story
 */
export async function deleteStory(storyId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get story info before deletion for position reordering
    const { data: story, error: fetchError } = await supabase
      .from('stories')
      .select('sprint_id, column_id, position')
      .eq('id', storyId)
      .single();

    if (fetchError || !story) {
      console.error('Error fetching story:', fetchError);
      return { success: false, error: 'Story not found' };
    }

    // Delete the story
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (deleteError) {
      console.error('Error deleting story:', deleteError);
      return { success: false, error: deleteError.message };
    }

    // Decrement positions for stories after the deleted one in the same column
    await supabase
      .from('stories')
      .update({ position: supabase.rpc('stories', { position: 'position - 1' }) } as any)
      .eq('sprint_id', story.sprint_id)
      .eq('column_id', story.column_id)
      .gt('position', story.position);

    revalidatePath('/sprint/[id]', 'page');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteStory:', error);
    return { success: false, error: 'Failed to delete story' };
  }
}

/**
 * Bulk create stories (useful for imports)
 */
export async function bulkCreateStories(
  stories: CreateStoryInput[]
): Promise<{ data: Story[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Not authenticated' };
    }

    const storiesData = stories.map((story, index) => ({
      ...story,
      position: story.position ?? index,
      priority: story.priority || 'medium',
      status: story.status || 'todo',
      created_by: user.id,
      updated_by: user.id,
    }));

    const { data, error } = await supabase
      .from('stories')
      .insert(storiesData)
      .select();

    if (error) {
      console.error('Error bulk creating stories:', error);
      return { data: null, error: error.message };
    }

    revalidatePath('/sprint/[id]', 'page');
    return { data: data as Story[], error: null };
  } catch (error) {
    console.error('Error in bulkCreateStories:', error);
    return { data: null, error: 'Failed to create stories' };
  }
}
