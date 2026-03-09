-- ============================================
-- DEBUG RLS POLICY ISSUE
-- ============================================
-- Run this to diagnose why RLS policies are failing

-- Step 1: Check your current user ID
SELECT auth.uid() as "Your User ID";

-- Step 2: Check which sprints you own
SELECT
    id as sprint_id,
    name as sprint_name,
    created_by,
    CASE
        WHEN created_by = auth.uid() THEN '✅ YOU OWN THIS'
        ELSE '❌ NOT YOUR SPRINT'
    END as ownership
FROM sprints
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Try to insert a test story (this will fail if RLS is blocking)
-- IMPORTANT: Replace 'YOUR_SPRINT_ID' with an actual sprint ID from Step 2 that you own
--
-- INSERT INTO stories (sprint_id, title, column_id, priority, status, position)
-- VALUES (
--   'YOUR_SPRINT_ID',
--   'Test Story - RLS Debug',
--   'todo',
--   'medium',
--   'todo',
--   0
-- );

-- Step 4: If Step 3 fails, check if the RLS policy can find your sprint
-- Replace 'YOUR_SPRINT_ID' below
-- SELECT EXISTS (
--     SELECT 1 FROM sprints s
--     WHERE s.id = 'YOUR_SPRINT_ID'
--     AND s.created_by = auth.uid()
-- ) as "Can you access this sprint?";
