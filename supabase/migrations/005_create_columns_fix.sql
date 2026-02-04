-- Fix for board_columns table (skip if already exists)
-- This script is idempotent and safe to run multiple times

-- Ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS board_columns (
    id TEXT PRIMARY KEY,
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    gradient TEXT NOT NULL DEFAULT 'slate',
    position INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (IF NOT EXISTS prevents errors if already created)
CREATE INDEX IF NOT EXISTS idx_board_columns_sprint_id ON board_columns(sprint_id);
CREATE INDEX IF NOT EXISTS idx_board_columns_position ON board_columns(sprint_id, position);

-- Enable RLS
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid "already exists" errors)
DROP POLICY IF EXISTS "Users can view own sprint columns" ON board_columns;
DROP POLICY IF EXISTS "Users can insert own sprint columns" ON board_columns;
DROP POLICY IF EXISTS "Users can update own sprint columns" ON board_columns;
DROP POLICY IF EXISTS "Users can delete own sprint columns" ON board_columns;

-- Recreate policies
CREATE POLICY "Users can view own sprint columns" ON board_columns
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = board_columns.sprint_id
            AND (s.created_by = auth.uid() OR s.created_by IS NULL)
        )
    );

CREATE POLICY "Users can insert own sprint columns" ON board_columns
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = board_columns.sprint_id
            AND (s.created_by = auth.uid() OR s.created_by IS NULL)
        )
    );

CREATE POLICY "Users can update own sprint columns" ON board_columns
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = board_columns.sprint_id
            AND (s.created_by = auth.uid() OR s.created_by IS NULL)
        )
    );

CREATE POLICY "Users can delete own sprint columns" ON board_columns
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = board_columns.sprint_id
            AND (s.created_by = auth.uid() OR s.created_by IS NULL)
        )
    );

-- Recreate trigger function
CREATE OR REPLACE FUNCTION update_board_columns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS board_columns_updated_at_trigger ON board_columns;
CREATE TRIGGER board_columns_updated_at_trigger
    BEFORE UPDATE ON board_columns
    FOR EACH ROW
    EXECUTE FUNCTION update_board_columns_updated_at();

-- Add comments
COMMENT ON TABLE board_columns IS 'Stores custom column configurations for sprint boards';
COMMENT ON COLUMN board_columns.position IS 'Position/order of the column on the board (left to right)';

-- This script does NOT insert default columns since they already exist
-- If you need to add default columns to new sprints, use the initializeDefaultColumns function
