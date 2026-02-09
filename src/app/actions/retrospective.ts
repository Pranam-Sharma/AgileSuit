'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const DEFAULT_COLUMNS = [
    { title: 'Thank You Notes', color: 'pink' },
    { title: 'What Went Well', color: 'green' },
    { title: 'What Went Wrong', color: 'red' },
    { title: 'More Of', color: 'blue' },
    { title: 'Less Of', color: 'orange' },
    { title: 'Keep Doing', color: 'purple' },
    { title: 'Stop Doing', color: 'gray' },
];

export async function getRetrospectiveDataAction(sprintId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // 1. Fetch Columns
    let { data: columns, error: colError } = await supabase
        .from('retrospective_columns')
        .select('*')
        .eq('sprint_id', sprintId)
        .order('position', { ascending: true });

    if (colError) throw new Error(colError.message);

    // 2. Initialize Default Columns if none exist
    if (!columns || columns.length === 0) {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabaseAdmin = createAdminClient();

        const newColumns = DEFAULT_COLUMNS.map((col, index) => ({
            sprint_id: sprintId,
            title: col.title,
            color: col.color,
            position: index,
            created_by: user.id
        }));

        const { data: insertedCols, error: insertError } = await supabaseAdmin
            .from('retrospective_columns')
            .insert(newColumns)
            .select();

        if (insertError) throw new Error(insertError.message);

        // Sort explicitly in JS since .order() on insert().select() can be flaky
        columns = (insertedCols || []).sort((a, b) => a.position - b.position);
        revalidatePath(`/sprint/${sprintId}/retrospective`);
    }

    // 3. Fetch Items
    const { data: items, error: itemError } = await supabase
        .from('retrospective_items')
        .select('*')
        .in('column_id', columns!.map(c => c.id))
        .order('position', { ascending: true });

    if (itemError) throw new Error(itemError.message);

    // 4. Fetch Votes
    const { data: votes, error: voteError } = await supabase
        .from('retrospective_item_votes')
        .select('*')
        .in('item_id', items!.map(i => i.id));

    if (voteError) throw new Error(voteError.message);

    // 5. Fetch Profiles manually (to avoid Relationship not found errors)
    const userIds = new Set([
        ...items!.map(i => i.created_by),
        ...votes!.map(v => v.user_id)
    ]);

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', Array.from(userIds));

    if (profileError) throw new Error(profileError.message);

    const profilesMap = new Map(profiles?.map(p => [p.id, p]));

    // 6. Fetch Comment Counts
    const { data: allComments } = await supabase
        .from('retrospective_comments')
        .select('item_id')
        .in('item_id', items!.map(i => i.id));

    const commentCounts = new Map();
    allComments?.forEach((c: any) => {
        commentCounts.set(c.item_id, (commentCounts.get(c.item_id) || 0) + 1);
    });

    // Map profiles and counts to items and votes
    const itemsWithProfiles = items?.map(item => ({
        ...item,
        profiles: profilesMap.get(item.created_by),
        comments_count: commentCounts.get(item.id) || 0
    }));

    const votesWithProfiles = votes?.map(vote => ({
        ...vote,
        profiles: profilesMap.get(vote.user_id)
    }));

    return {
        columns: columns || [],
        items: itemsWithProfiles || [],
        votes: votesWithProfiles || []
    };
}

export async function createRetrospectiveColumnAction(sprintId: string, title: string, color: string = 'blue') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Get max position
    const { data: maxPosData } = await supabase
        .from('retrospective_columns')
        .select('position')
        .eq('sprint_id', sprintId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

    const position = (maxPosData?.position ?? -1) + 1;

    const { data, error } = await supabase
        .from('retrospective_columns')
        .insert({
            sprint_id: sprintId,
            title,
            color,
            position,
            created_by: user.id
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath(`/sprint/${sprintId}/retrospective`);
    return data;
}

export async function updateRetrospectiveColumnAction(columnId: string, title: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('retrospective_columns')
        .update({ title })
        .eq('id', columnId);

    if (error) throw new Error(error.message);
    revalidatePath(`/sprint/[sprintId]/retrospective`);
}

export async function deleteRetrospectiveColumnAction(columnId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('retrospective_columns')
        .delete()
        .eq('id', columnId);

    if (error) throw new Error(error.message);
    revalidatePath(`/sprint/[sprintId]/retrospective`);
}

export async function createRetrospectiveItemAction(columnId: string, content: string, isAnonymous: boolean = false) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('retrospective_items')
        .insert({
            column_id: columnId,
            content,
            created_by: user.id,
            is_anonymous: isAnonymous
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath(`/sprint/[sprintId]/retrospective`);
    return data;
}

export async function deleteRetrospectiveItemAction(itemId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('retrospective_items')
        .delete()
        .eq('id', itemId);

    if (error) throw new Error(error.message);
    revalidatePath(`/sprint/[sprintId]/retrospective`);
}

export async function toggleVoteAction(itemId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Check if vote exists
    const { data: existingVote } = await supabase
        .from('retrospective_item_votes')
        .select('id')
        .eq('item_id', itemId)
        .eq('user_id', user.id)
        .single();

    if (existingVote) {
        // Remove vote
        await supabase
            .from('retrospective_item_votes')
            .delete()
            .eq('id', existingVote.id);
    } else {
        // Add vote
        await supabase
            .from('retrospective_item_votes')
            .insert({
                item_id: itemId,
                user_id: user.id
            });
    }

    revalidatePath(`/sprint/[sprintId]/retrospective`);
}

export async function addRetrospectiveCommentAction(itemId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
        .from('retrospective_comments')
        .insert({
            item_id: itemId,
            content,
            created_by: user.id
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function getRetrospectiveCommentsAction(itemId: string) {
    const supabase = await createClient();

    // 1. Fetch comments
    const { data: comments, error } = await supabase
        .from('retrospective_comments')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    // 2. Extract unique user IDs
    const userIds = Array.from(new Set(comments.map((c: any) => c.created_by)));

    // 3. Fetch profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', userIds);

    if (profileError) console.error('Error fetching profiles:', profileError);

    const profilesMap = new Map(profiles?.map(p => [p.id, p]));

    // 4. Map profiles to comments
    const commentsWithUser = comments.map((comment: any) => {
        const profile = profilesMap.get(comment.created_by);
        return {
            ...comment,
            user_name: profile?.display_name || profile?.email || 'Unknown User',
            user_avatar: null // avatar_url removed from schema
        };
    });

    return commentsWithUser;
}


export async function updateRetrospectiveItemPositionAction(itemId: string, newColumnId: string, newPosition: number) {
    const supabase = await createClient();

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    // 1. Get the current item to check if it's moving columns
    const { data: currentItem, error: fetchError } = await supabase
        .from('retrospective_items')
        .select('column_id, position, content, created_by')
        .eq('id', itemId)
        .single();

    if (fetchError || !currentItem) {
        throw new Error(`Item not found`);
    }

    const oldColumnId = currentItem.column_id;
    const oldPosition = currentItem.position;

    // 2. Update the item's new position and column
    const { error: updateError } = await supabase
        .from('retrospective_items')
        .update({ column_id: newColumnId, position: newPosition })
        .eq('id', itemId);

    if (updateError) {
        throw new Error(updateError.message);
    }

    // 3. Reorder other items
    // Function to reorder items in a column
    const reorderColumn = async (columnId: string) => {
        const { data: items } = await supabase
            .from('retrospective_items')
            .select('id, position, content, created_by')
            .eq('column_id', columnId)
            .order('position', { ascending: true });

        if (!items) return;

        // Re-assign positions sequentially
        const updates = items.map((item: any, index: number) => ({
            id: item.id,
            position: index,
            column_id: columnId,
            content: item.content,
            created_by: item.created_by
        }));

        if (updates.length > 0) {
            await supabase.from('retrospective_items').upsert(updates);
        }
    };

    // If moving within the same column
    if (oldColumnId === newColumnId) {
        console.log('[DND] Same column move detected');
        const { data: siblingItems, error: sibError } = await supabase
            .from('retrospective_items')
            .select('id, position, column_id, content, created_by')
            .eq('column_id', newColumnId)
            .neq('id', itemId)
            .order('position', { ascending: true });

        if (sibError) {
            console.error('[DND] Error fetching siblings:', sibError);
            throw new Error(sibError.message);
        }

        if (siblingItems) {
            const newItems = [...siblingItems];
            newItems.splice(newPosition, 0, {
                id: itemId,
                position: newPosition,
                column_id: newColumnId,
                content: currentItem.content,
                created_by: currentItem.created_by
            });

            const updates = newItems.map((item: any, index: number) => ({
                id: item.id,
                position: index,
                column_id: newColumnId,
                content: item.content,
                created_by: item.created_by
            }));

            console.log('[DND] Upserting updates:', updates);
            const { error: upsertError } = await supabase.from('retrospective_items').upsert(updates);
            if (upsertError) {
                console.error('[DND] Upsert Error (Same Column):', upsertError);
                throw new Error(upsertError.message);
            }
        }

    } else {
        console.log('[DND] Cross column move detected');
        // Moved to a different column
        await reorderColumn(oldColumnId);

        const { data: newSiblingItems, error: sibError } = await supabase
            .from('retrospective_items')
            .select('id, position, column_id, content, created_by')
            .eq('column_id', newColumnId)
            .neq('id', itemId) // Exclude our item to place it manually
            .order('position', { ascending: true });

        if (sibError) {
            throw new Error(sibError.message);
        }

        if (newSiblingItems) {
            const newItems = [...newSiblingItems];
            // Sort just in case
            // newItems.sort((a, b) => a.position - b.position);

            // Insert our item at new position
            newItems.splice(newPosition, 0, {
                id: itemId,
                position: newPosition,
                column_id: newColumnId,
                content: currentItem.content,
                created_by: currentItem.created_by
            });

            const updates = newItems.map((item: any, index: number) => ({
                id: item.id,
                position: index,
                column_id: newColumnId,
                content: item.content,
                created_by: item.created_by
            }));

            const { error: upsertError } = await supabase.from('retrospective_items').upsert(updates);
            if (upsertError) {
                console.error('[DND] Upsert Error (Cross Column):', upsertError);
                throw new Error(upsertError.message);
            }
        }
    }

    // Force revalidate to bust cache
    // We don't have sprintId here easily unless we pass it or look it up.
    // For now, client-side refetch is relying on this action succeeding.

    return { success: true };
}

export async function deleteRetrospectiveCommentAction(commentId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('retrospective_comments')
        .delete()
        .eq('id', commentId);

    if (error) throw new Error(error.message);
}
