-- Add start_date and end_date columns to sprints table
ALTER TABLE sprints
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN sprints.start_date IS 'Sprint start date';
COMMENT ON COLUMN sprints.end_date IS 'Sprint end date';
