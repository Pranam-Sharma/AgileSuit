-- Enterprise Story ID System Migration
-- [TEAM_PREFIX][PLATFORM_CODE]-[SEQUENCE] format

-- 1. Add prefix to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS prefix VARCHAR(10);

-- 2. Create platforms table
CREATE TABLE IF NOT EXISTS platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id TEXT NOT NULL, -- Using TEXT to match org_slug pattern
    name TEXT NOT NULL,
    code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, code)
);

-- 3. Create org_story_counters table
CREATE TABLE IF NOT EXISTS org_story_counters (
    org_id TEXT PRIMARY KEY, -- Using TEXT to match org_slug pattern
    last_sequence INTEGER NOT NULL DEFAULT 0
);

-- 4. Add story_code, platform_id, team_id to stories
ALTER TABLE stories ADD COLUMN IF NOT EXISTS story_code VARCHAR(30);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS platform_id UUID REFERENCES platforms(id);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE stories ADD COLUMN IF NOT EXISTS org_id TEXT; -- To support unique constraint and filtering

-- 4.1 Backfill team prefixes for existing teams
UPDATE teams 
SET prefix = UPPER(SUBSTRING(name FROM 1 FOR 3))
WHERE prefix IS NULL;

-- 5. Backfill org_id in stories from sprints
-- Assuming stories table already has data
UPDATE stories
SET org_id = (SELECT org_slug FROM sprints WHERE sprints.id = stories.sprint_id)
WHERE org_id IS NULL;

-- 6. Add unique constraint on story_code per organization
-- We'll do this after backfilling existing stories to avoid conflicts
-- For now, let's just create an index
CREATE INDEX IF NOT EXISTS idx_stories_org_story_code ON stories(org_id, story_code);

-- 7. Function to generate story code
CREATE OR REPLACE FUNCTION generate_story_code(p_org_id TEXT, p_execution_code TEXT)
RETURNS TEXT AS $$
DECLARE
    v_sequence INTEGER;
    v_story_code TEXT;
BEGIN
    -- Atomic increment and get sequence
    INSERT INTO org_story_counters (org_id, last_sequence)
    VALUES (p_org_id, 1)
    ON CONFLICT (org_id)
    DO UPDATE SET last_sequence = org_story_counters.last_sequence + 1
    RETURNING last_sequence INTO v_sequence;

    -- Format: CODE-0001 (min 4 digits, zero padded)
    v_story_code := p_execution_code || '-' || LPAD(v_sequence::TEXT, 4, '0');

    RETURN v_story_code;
END;
$$ LANGUAGE plpgsql;

-- 8. Backfill existing stories with IDs (if any)
-- This is a one-time migration for existing data
DO $$
DECLARE
    r RECORD;
    v_team_prefix TEXT;
    v_platform_code TEXT;
    v_exec_code TEXT;
BEGIN
    FOR r IN SELECT s.id, s.org_id, s.team_id, s.platform_id FROM stories s WHERE s.story_code IS NULL LOOP
        -- Get team prefix
        IF r.team_id IS NOT NULL THEN
            SELECT prefix INTO v_team_prefix FROM teams WHERE id = r.team_id;
        END IF;
        
        -- Get platform code
        IF r.platform_id IS NOT NULL THEN
            SELECT code INTO v_platform_code FROM platforms WHERE id = r.platform_id;
        END IF;
        
        -- Default codes if missing
        v_team_prefix := COALESCE(v_team_prefix, 'STORY');
        v_platform_code := COALESCE(v_platform_code, '');
        v_exec_code := v_team_prefix || v_platform_code;

        UPDATE stories 
        SET story_code = generate_story_code(r.org_id, v_exec_code)
        WHERE id = r.id;
    END LOOP;
END;
$$;

-- 9. Add NOT NULL constraint to story_code after backfill
-- ALTER TABLE stories ALTER COLUMN story_code SET NOT NULL;
-- Add Unique constraint
-- ALTER TABLE stories ADD CONSTRAINT unique_org_story_code UNIQUE (org_id, story_code);
