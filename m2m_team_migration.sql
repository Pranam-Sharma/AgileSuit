-- Migration Script: Many-to-Many Team Assignment
-- Run this script in your Supabase SQL Editor.

-- 1. Create Team Members Junction Table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id TEXT NOT NULL,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(team_id, user_id)
);

-- 2. Migrate existing data from profiles.team_id
INSERT INTO public.team_members (org_id, team_id, user_id)
SELECT org_id, team_id, id 
FROM public.profiles 
WHERE team_id IS NOT NULL
ON CONFLICT (team_id, user_id) DO NOTHING;

-- 3. Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 4. Basic read policy for org members
CREATE POLICY "Users can view team members in their org" ON public.team_members
    FOR SELECT USING (org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid()));

-- 5. Hard remove team_id from profiles (Optional: logic in code will handle it, but clean DB is better)
-- ALTER TABLE public.profiles DROP COLUMN team_id;
-- COMMENT: We'll keep the column for a moment to avoid breaking live code before server side is updated, 
-- but we should eventually drop it.
