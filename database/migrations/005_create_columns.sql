-- Columns Table
-- Stores custom column configurations for sprint boards
-- Each sprint can have its own set of columns

CREATE TABLE IF NOT EXISTS board_columns (
    id TEXT PRIMARY KEY,
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    gradient TEXT NOT NULL DEFAULT 'slate',
    position INTEGER NOT NULL DEFAULT 0,

    -- Audit fields
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_board_columns_sprint_id ON board_columns(sprint_id);
CREATE INDEX IF NOT EXISTS idx_board_columns_position ON board_columns(sprint_id, position);

-- Add RLS policies
ALTER TABLE board_columns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view columns for their sprints
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

-- Policy: Users can insert columns for their sprints
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

-- Policy: Users can update columns for their sprints
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

-- Policy: Users can delete columns for their sprints
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

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_board_columns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER board_columns_updated_at_trigger
    BEFORE UPDATE ON board_columns
    FOR EACH ROW
    EXECUTE FUNCTION update_board_columns_updated_at();

-- Add comment for documentation
COMMENT ON TABLE board_columns IS 'Stores custom column configurations for sprint boards';
COMMENT ON COLUMN board_columns.position IS 'Position/order of the column on the board (left to right)';

-- Insert default columns for existing sprints (one-time migration)
INSERT INTO board_columns (id, sprint_id, title, gradient, position, created_at)
SELECT
    'backlog',
    id,
    'Backlog',
    'slate',
    0,
    NOW()
FROM sprints
WHERE NOT EXISTS (
    SELECT 1 FROM board_columns WHERE board_columns.sprint_id = sprints.id
);

INSERT INTO board_columns (id, sprint_id, title, gradient, position, created_at)
SELECT
    'todo',
    id,
    'To Do',
    'blue',
    1,
    NOW()
FROM sprints
WHERE NOT EXISTS (
    SELECT 1 FROM board_columns WHERE board_columns.sprint_id = sprints.id AND board_columns.id = 'todo'
);

INSERT INTO board_columns (id, sprint_id, title, gradient, position, created_at)
SELECT
    'in-progress',
    id,
    'In Progress',
    'orange',
    2,
    NOW()
FROM sprints
WHERE NOT EXISTS (
    SELECT 1 FROM board_columns WHERE board_columns.sprint_id = sprints.id AND board_columns.id = 'in-progress'
);

INSERT INTO board_columns (id, sprint_id, title, gradient, position, created_at)
SELECT
    'review',
    id,
    'In Review',
    'purple',
    3,
    NOW()
FROM sprints
WHERE NOT EXISTS (
    SELECT 1 FROM board_columns WHERE board_columns.sprint_id = sprints.id AND board_columns.id = 'review'
);

INSERT INTO board_columns (id, sprint_id, title, gradient, position, created_at)
SELECT
    'done',
    id,
    'Done',
    'green',
    4,
    NOW()
FROM sprints
WHERE NOT EXISTS (
    SELECT 1 FROM board_columns WHERE board_columns.sprint_id = sprints.id AND board_columns.id = 'done'
);
