-- Create retrospective_columns table
CREATE TABLE IF NOT EXISTS public.retrospective_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id UUID NOT NULL REFERENCES public.sprints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT 'blue', -- 'red', 'green', 'blue', 'purple', 'gray'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create retrospective_items table
CREATE TABLE IF NOT EXISTS public.retrospective_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID NOT NULL REFERENCES public.retrospective_columns(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create retrospective_item_votes table (for detailed voting)
CREATE TABLE IF NOT EXISTS public.retrospective_item_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.retrospective_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(item_id, user_id) -- One vote per user per item
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.retrospective_columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.retrospective_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.retrospective_item_votes;

-- RLS Policies
ALTER TABLE public.retrospective_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_item_votes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write (Modify this if you have specific Org policies)
CREATE POLICY "Allow all actions for authenticated users" ON public.retrospective_columns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all actions for authenticated users" ON public.retrospective_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all actions for authenticated users" ON public.retrospective_item_votes FOR ALL USING (auth.role() = 'authenticated');
