-- ============================================
-- FIX RLS POLICIES FOR STORIES TABLE
-- ============================================
-- Run this in Supabase SQL Editor to fix the permission error
-- This will allow users to create/view/edit/delete stories

-- Step 1: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own org stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own org stories" ON stories;
DROP POLICY IF EXISTS "Users can update own org stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own org stories" ON stories;

-- Step 2: Create new simplified policies
-- These check if the user created the sprint (simpler than org-based checks)

CREATE POLICY "Users can view own org stories" ON stories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert own org stories" ON stories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update own org stories" ON stories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND s.created_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete own org stories" ON stories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND s.created_by = auth.uid()
        )
    );

-- Step 3: Verify the policies were created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'stories';
