-- Add completed_story_points column to stories table
-- This field tracks how many story points have been completed
-- Used to calculate progress percentage and for burndown charts

ALTER TABLE stories
ADD COLUMN IF NOT EXISTS completed_story_points INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN stories.completed_story_points IS 'Number of story points completed out of total story_points. Used for progress tracking and burndown charts.';

-- Add a check constraint to ensure completed points don't exceed total points
ALTER TABLE stories
ADD CONSTRAINT check_completed_points_valid
CHECK (completed_story_points >= 0 AND (story_points IS NULL OR completed_story_points <= story_points));
