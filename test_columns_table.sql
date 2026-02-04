-- Test query to check if board_columns table exists
-- Run this in Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'board_columns'
) as table_exists;

-- If it exists, show the structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'board_columns'
ORDER BY ordinal_position;

-- Show any existing data
SELECT * FROM board_columns LIMIT 5;
