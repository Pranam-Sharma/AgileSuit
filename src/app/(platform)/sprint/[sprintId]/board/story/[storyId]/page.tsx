import { StoryDetailClient } from '@/modules/sprint/board/story-detail-client';
import { createAdminClient } from '@/auth/supabase/admin';
import { notFound } from 'next/navigation';

export default async function StoryDetailPage({ 
    params 
}: { 
    params: Promise<{ sprintId: string; storyId: string }> 
}) {
    const { sprintId, storyId } = await params;
    const supabase = await createAdminClient();

    // Fetch story
    const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

    if (storyError || !story) {
        return notFound();
    }

    // Fetch sprint info
    const { data: sprintInfo } = await supabase
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single();

    return <StoryDetailClient story={story} sprintId={sprintId} sprintInfo={sprintInfo} />;
}
