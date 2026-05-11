-- Add JSONB columns for subtasks, comments, and activity log to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS activity_log JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;

-- Add comment for documentation
COMMENT ON COLUMN stories.subtasks IS 'JSON array of subtasks with id, title, and is_completed status';
COMMENT ON COLUMN stories.comments IS 'JSON array of comments with id, text, user_name, and created_at';
COMMENT ON COLUMN stories.activity_log IS 'JSON array of activity history for the story';
