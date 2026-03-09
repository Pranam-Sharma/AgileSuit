-- Add position column to retrospective_items if it doesn't exist
ALTER TABLE public.retrospective_items ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

-- Optional: Update existing items to have unique positions (simple version)
-- In a real scenario, we might want to order by created_at within each column
WITH ranked_items AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY column_id ORDER BY created_at) - 1 as new_pos
    FROM public.retrospective_items
)
UPDATE public.retrospective_items
SET position = ranked_items.new_pos
FROM ranked_items
WHERE public.retrospective_items.id = ranked_items.id;
