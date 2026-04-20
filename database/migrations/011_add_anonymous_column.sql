-- Add is_anonymous column to retrospective_items
ALTER TABLE public.retrospective_items
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Refresh schema cache
NOTIFY pgrst, 'reload config';
