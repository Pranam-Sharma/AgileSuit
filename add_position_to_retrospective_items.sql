-- Add position column to retrospective_items table
ALTER TABLE public.retrospective_items 
ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 999; -- Default to 999 so they appear at the end initially

-- Optional: You might want to update existing items to have a sequential position, 
-- but strictly speaking, just adding the column fixes the crash. 
-- The frontend/backend DND logic handles reordering which will fix the values over time.
