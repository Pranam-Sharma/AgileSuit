-- Stories Table
-- Stores individual user stories/tasks for sprint boards
-- Each story belongs to a sprint and can be moved between columns

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
    column_id TEXT NOT NULL, -- The column this story belongs to (e.g., 'backlog', 'todo', 'in_progress', etc.)
    position INTEGER NOT NULL DEFAULT 0, -- Position within the column for ordering

    -- Optional metadata
    tags TEXT[], -- Array of tag strings
    due_date DATE,

    -- Audit fields
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_sprint_id ON stories(sprint_id);
CREATE INDEX IF NOT EXISTS idx_stories_column_id ON stories(column_id);
CREATE INDEX IF NOT EXISTS idx_stories_assignee ON stories(assignee);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_position ON stories(sprint_id, column_id, position);

-- Add RLS policies
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view stories for sprints in their organization
CREATE POLICY "Users can view own org stories" ON stories
    FOR SELECT
    USING (
        sprint_id IN (
            SELECT s.id FROM sprints s
            JOIN profiles p ON s.org_slug = p.org_id
            WHERE p.id = auth.uid()
        )
    );

-- Policy: Users can insert stories for sprints in their organization
CREATE POLICY "Users can insert own org stories" ON stories
    FOR INSERT
    WITH CHECK (
        sprint_id IN (
            SELECT s.id FROM sprints s
            JOIN profiles p ON s.org_slug = p.org_id
            WHERE p.id = auth.uid()
        )
    );

-- Policy: Users can update stories for sprints in their organization
CREATE POLICY "Users can update own org stories" ON stories
    FOR UPDATE
    USING (
        sprint_id IN (
            SELECT s.id FROM sprints s
            JOIN profiles p ON s.org_slug = p.org_id
            WHERE p.id = auth.uid()
        )
    );

-- Policy: Users can delete stories for sprints in their organization
CREATE POLICY "Users can delete own org stories" ON stories
    FOR DELETE
    USING (
        sprint_id IN (
            SELECT s.id FROM sprints s
            JOIN profiles p ON s.org_slug = p.org_id
            WHERE p.id = auth.uid()
        )
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_stories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_updated_at_trigger
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_stories_updated_at();

-- Add comment for documentation
COMMENT ON TABLE stories IS 'Stores user stories and tasks for sprint boards with positioning and metadata';
COMMENT ON COLUMN stories.column_id IS 'The board column this story belongs to (e.g., backlog, todo, in_progress, done)';
COMMENT ON COLUMN stories.position IS 'Position within the column for drag-and-drop ordering';
