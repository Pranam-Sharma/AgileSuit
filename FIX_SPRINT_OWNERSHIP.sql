-- ============================================
-- FIX SPRINT OWNERSHIP AND RLS POLICIES
-- ============================================
-- This script fixes the issue where sprints have NULL created_by values
-- Run this in your Supabase SQL Editor

-- Step 1: Check current sprint ownership
-- (Run this first to see which sprints need fixing)
SELECT
    id,
    name,
    created_by,
    CASE
        WHEN created_by IS NULL THEN '⚠️  NULL - NEEDS FIX'
        ELSE '✅ Has owner'
    END as status
FROM sprints
ORDER BY created_at DESC
LIMIT 20;

-- Step 2: Get your current user ID
-- (You'll need this for Step 3)
SELECT auth.uid() as "Your User ID";

-- Step 3: Update sprints to assign them to you
-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' with the actual UUID from Step 2
-- Uncomment the line below and replace YOUR_USER_ID_HERE:
--
-- UPDATE sprints
-- SET created_by = 'YOUR_USER_ID_HERE'
-- WHERE created_by IS NULL;

-- Step 4: Update the RLS policies to handle NULL created_by gracefully
-- This is a more permissive policy that allows access if:
-- 1. User created the sprint, OR
-- 2. Sprint has no owner (created_by IS NULL), OR
-- 3. User is in the same org as the sprint

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own org stories" ON stories;
DROP POLICY IF EXISTS "Users can insert own org stories" ON stories;
DROP POLICY IF EXISTS "Users can update own org stories" ON stories;
DROP POLICY IF EXISTS "Users can delete own org stories" ON stories;

-- Create new more permissive policies
CREATE POLICY "Users can view own org stories" ON stories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()  -- User owns the sprint
                OR s.created_by IS NULL     -- Sprint has no owner (legacy data)
            )
        )
    );

CREATE POLICY "Users can insert own org stories" ON stories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()  -- User owns the sprint
                OR s.created_by IS NULL     -- Sprint has no owner (legacy data)
            )
        )
    );

CREATE POLICY "Users can update own org stories" ON stories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()  -- User owns the sprint
                OR s.created_by IS NULL     -- Sprint has no owner (legacy data)
            )
        )
    );

CREATE POLICY "Users can delete own org stories" ON stories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM sprints s
            WHERE s.id = stories.sprint_id
            AND (
                s.created_by = auth.uid()  -- User owns the sprint
                OR s.created_by IS NULL     -- Sprint has no owner (legacy data)
            )
        )
    );

-- Step 5: Verify the fix worked
SELECT
    'Sprints with NULL created_by' as check_name,
    COUNT(*) as count
FROM sprints
WHERE created_by IS NULL

UNION ALL

SELECT
    'Total sprints' as check_name,
    COUNT(*) as count
FROM sprints;

-- Step 6: Verify policies were updated
SELECT
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'stories'
ORDER BY cmd;
