-- Add regional_clusters column to sprint_planning table
ALTER TABLE sprint_planning
ADD COLUMN IF NOT EXISTS regional_clusters JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN sprint_planning.regional_clusters IS 'JSONB array of regional cluster impact data';
