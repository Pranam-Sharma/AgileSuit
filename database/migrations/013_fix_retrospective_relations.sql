-- Fix relationships to reference public.profiles instead of auth.users
-- This allows PostgREST to detect the relationship and enable joins (e.g., fetching user details with items)

-- 1. Fix retrospective_columns
ALTER TABLE public.retrospective_columns
DROP CONSTRAINT IF EXISTS retrospective_columns_created_by_fkey;

ALTER TABLE public.retrospective_columns
ADD CONSTRAINT retrospective_columns_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- 2. Fix retrospective_items
ALTER TABLE public.retrospective_items
DROP CONSTRAINT IF EXISTS retrospective_items_created_by_fkey;

ALTER TABLE public.retrospective_items
ADD CONSTRAINT retrospective_items_created_by_fkey
FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- 3. Fix retrospective_item_votes
ALTER TABLE public.retrospective_item_votes
DROP CONSTRAINT IF EXISTS retrospective_item_votes_user_id_fkey;

ALTER TABLE public.retrospective_item_votes
ADD CONSTRAINT retrospective_item_votes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
