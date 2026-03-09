-- Sprint Planning Table
-- Stores all planning data for a sprint in a flexible JSONB structure
-- This allows for easy extensibility without schema changes

CREATE TABLE IF NOT EXISTS sprint_planning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
    org_slug TEXT NOT NULL,

    -- General Info
    start_date DATE,
    end_date DATE,
    sprint_days INTEGER DEFAULT 0,

    -- Team Composition (JSONB array of team members)
    team_members JSONB DEFAULT '[]'::jsonb,

    -- Project Priorities (JSONB array of project objects)
    -- Structure: [{id, name, code, priority, allocation, color, icon}]
    projects JSONB DEFAULT '[]'::jsonb,

    -- Platform Metrics (JSONB array of platform objects)
    -- Structure: [{id, name, members[], total_story_points, allocations[], target_improvement, target_velocity, holidays[], developer_leaves[]}]
    platforms JSONB DEFAULT '[]'::jsonb,

    -- Sprint Goals (JSONB array of goal objects)
    -- Structure: [{id, description, status, remark, order}]
    goals JSONB DEFAULT '[]'::jsonb,

    -- Milestones (JSONB array of milestone objects with nested phases)
    -- Structure: [{id, name, start_date, end_date, status, description, phases: [{id, name, pic, start_date, due_date, status, remarks}]}]
    milestones JSONB DEFAULT '[]'::jsonb,

    -- Sprint Demo Items (JSONB array of demo objects)
    -- Structure: [{id, topic, presenter, due_date, due_time, status, attendees, description, duration}]
    demo_items JSONB DEFAULT '[]'::jsonb,

    -- Checklist State (JSONB object with boolean values)
    -- Structure: {dates: true, members: false, points: true, ...}
    checklist JSONB DEFAULT '{}'::jsonb,

    -- Audit fields
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one planning record per sprint
    CONSTRAINT unique_sprint_planning UNIQUE (sprint_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sprint_planning_sprint_id ON sprint_planning(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_planning_org_slug ON sprint_planning(org_slug);

-- Add RLS policies (optional - currently using admin client)
ALTER TABLE sprint_planning ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see planning for their organization's sprints
CREATE POLICY "Users can view own org sprint planning" ON sprint_planning
    FOR SELECT
    USING (
        org_slug IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can insert planning for their organization's sprints
CREATE POLICY "Users can insert own org sprint planning" ON sprint_planning
    FOR INSERT
    WITH CHECK (
        org_slug IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can update planning for their organization's sprints
CREATE POLICY "Users can update own org sprint planning" ON sprint_planning
    FOR UPDATE
    USING (
        org_slug IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Policy: Users can delete planning for their organization's sprints
CREATE POLICY "Users can delete own org sprint planning" ON sprint_planning
    FOR DELETE
    USING (
        org_slug IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Add comment for documentation
COMMENT ON TABLE sprint_planning IS 'Stores sprint planning data including goals, milestones, demos, and team configuration';
