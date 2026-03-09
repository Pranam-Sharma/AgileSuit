-- ============================================
-- COMPLETE STORIES TABLE SETUP
-- ============================================
-- This script creates the stories table with proper RLS policies
-- Handles edge cases including NULL sprint ownership from Firebase migration
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Clean up existing setup
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own org stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own org stories" ON stories;
DROP POLICY IF EXISTS "Users can update own org stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own org stories" ON stories;

-- Drop existing table (WARNING: This will delete all existing stories!)
-- Comment out the line below if you want to keep existing stories
-- DROP TABLE IF EXISTS stories CASCADE;

-- If table exists, just truncate it instead
-- Uncomment if you want to keep the table structure but remove data:
-- TRUNCATE TABLE stories;

-- ============================================
-- STEP 2: Create stories table
-- ============================================

CREATE TABLE IF NOT EXISTS stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,

    -- Story details
    title TEXT NOT NULL,
    description TEXT,
    story_points INTEGER,

    -- Assignment and categorization
    assignee TEXT, -- Will be converted to FK to team_members in Phase 1.6
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done', 'blocked')),

    -- Board positioning
    column_id TEXT NOT NULL, -- The column this story belongs to
    position INTEGER NOT NULL DEFAULT 0, -- Position within the column

    -- Optional metadata
    tags TEXT[], -- Array of tag strings
    due_date DATE,

    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_stories_sprint_id ON stories(sprint_id);
CREATE INDEX IF NOT EXISTS idx_stories_column_id ON stories(column_id);
CREATE INDEX IF NOT EXISTS idx_stories_assignee ON stories(assignee);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_position ON stories(sprint_id, column_id, position);
CREATE INDEX IF NOT EXISTS idx_stories_created_by ON stories(created_by);

-- ============================================
-- STEP 4: Create trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stories_updated_at_trigger ON stories;
CREATE TRIGGER stories_updated_at_trigger
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_stories_updated_at();

-- ============================================
-- STEP 5: Enable RLS
-- ============================================

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies (handles NULL sprint ownership)
-- ============================================

-- SELECT Policy: Users can view stories if:
-- 1. They created the sprint, OR
-- 2. Sprint has no owner (created_by IS NULL - legacy Firebase data), OR
-- 3. They are authenticated (for now, to allow access during migration)
CREATE POLICY "Users can view stories" ON stories
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()
                OR s.created_by IS NULL
            )
        )
    );

-- INSERT Policy: Users can create stories if:
-- 1. They are authenticated, AND
-- 2. They own the sprint OR sprint has no owner
CREATE POLICY "Users can insert stories" ON stories
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()
                OR s.created_by IS NULL
            )
        )
    );

-- UPDATE Policy: Users can update stories if:
-- 1. They are authenticated, AND
-- 2. They own the sprint OR sprint has no owner
CREATE POLICY "Users can update stories" ON stories
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()
                OR s.created_by IS NULL
            )
        )
    );

-- DELETE Policy: Users can delete stories if:
-- 1. They are authenticated, AND
-- 2. They own the sprint OR sprint has no owner
CREATE POLICY "Users can delete stories" ON stories
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()
                OR s.created_by IS NULL
            )
        )
    );

-- ============================================
-- STEP 7: Add table and column comments
-- ============================================

COMMENT ON TABLE stories IS 'Stores user stories and tasks for sprint boards with positioning and metadata';
COMMENT ON COLUMN stories.column_id IS 'The board column this story belongs to (e.g., backlog, todo, in_progress, done)';
COMMENT ON COLUMN stories.position IS 'Position within the column for drag-and-drop ordering';
COMMENT ON COLUMN stories.created_by IS 'User who created the story (may be NULL for legacy data from Firebase migration)';

-- ============================================
-- STEP 8: Verification queries
-- ============================================

-- Check that table was created
SELECT
    'stories table created' as status,
    COUNT(*) as row_count
FROM stories;

-- Check indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'stories'
ORDER BY indexname;

-- Check RLS is enabled
SELECT
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename = 'stories';

-- Check policies
SELECT
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'stories'
ORDER BY cmd, policyname;

-- Check for sprints with NULL created_by
SELECT
    COUNT(*) as sprints_with_null_owner,
    (SELECT COUNT(*) FROM sprints) as total_sprints
FROM sprints
WHERE created_by IS NULL;

-- ============================================
-- STEP 9 (OPTIONAL): Fix sprint ownership
-- ============================================

-- If you want to assign ownership of NULL sprints to yourself:
-- 1. First, get your user ID by logging into the app and checking the logs
-- 2. Or run: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- 3. Then uncomment and run this:
--
-- UPDATE sprints
-- SET created_by = 'YOUR_USER_ID_HERE'
-- WHERE created_by IS NULL;

-- ============================================
-- SUCCESS!
-- ============================================
-- The stories table is now ready to use
-- Try creating a story through your app
