-- Fix RLS Policies for Retrospective Items
-- The previous policy might have been preventing updates or upserts silently.

-- 1. Drop the old policy (if it exists)
DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON public.retrospective_items;
DROP POLICY IF EXISTS "policy_retro_items_all" ON public.retrospective_items;

-- 2. Create a new, explicit policy for authenticated users
-- This allows SELECT, INSERT, UPDATE, DELETE for anyone logged in.
CREATE POLICY "policy_retro_items_all" 
ON public.retrospective_items 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Ensure RLS is enabled
ALTER TABLE public.retrospective_items ENABLE ROW LEVEL SECURITY;

-- 4. Verify grants (optional but good practice)
GRANT ALL ON TABLE public.retrospective_items TO authenticated;
GRANT ALL ON TABLE public.retrospective_items TO service_role;
