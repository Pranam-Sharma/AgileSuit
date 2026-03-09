-- Create retrospective_comments table
CREATE TABLE IF NOT EXISTS public.retrospective_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.retrospective_items(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.retrospective_comments;

-- RLS Policies
ALTER TABLE public.retrospective_comments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write
CREATE POLICY "Allow all actions for authenticated users" ON public.retrospective_comments FOR ALL USING (auth.role() = 'authenticated');
