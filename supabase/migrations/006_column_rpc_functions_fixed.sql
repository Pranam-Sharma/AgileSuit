-- RPC Functions to bypass PostgREST schema cache issues
-- These functions allow direct SQL access to board_columns table

-- Function to get columns for a sprint
CREATE OR REPLACE FUNCTION get_sprint_columns(p_sprint_id UUID)
RETURNS TABLE (
    id TEXT,
    sprint_id UUID,
    title TEXT,
    gradient TEXT,
    col_position INTEGER,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_by UUID,
    updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        bc.id,
        bc.sprint_id,
        bc.title,
        bc.gradient,
        bc.position as col_position,
        bc.created_by,
        bc.created_at,
        bc.updated_by,
        bc.updated_at
    FROM board_columns bc
    WHERE bc.sprint_id = p_sprint_id
    ORDER BY bc.position ASC;
END;
$$;

-- Function to create a new column
CREATE OR REPLACE FUNCTION create_sprint_column(
    p_id TEXT,
    p_sprint_id UUID,
    p_title TEXT,
    p_gradient TEXT,
    p_position INTEGER
)
RETURNS TABLE (
    id TEXT,
    sprint_id UUID,
    title TEXT,
    gradient TEXT,
    col_position INTEGER,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_by UUID,
    updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO board_columns (id, sprint_id, title, gradient, position, created_by, updated_by)
    VALUES (p_id, p_sprint_id, p_title, p_gradient, p_position, auth.uid(), auth.uid())
    RETURNING
        board_columns.id,
        board_columns.sprint_id,
        board_columns.title,
        board_columns.gradient,
        board_columns.position as col_position,
        board_columns.created_by,
        board_columns.created_at,
        board_columns.updated_by,
        board_columns.updated_at;
END;
$$;

-- Function to update a column
CREATE OR REPLACE FUNCTION update_sprint_column(
    p_id TEXT,
    p_title TEXT DEFAULT NULL,
    p_gradient TEXT DEFAULT NULL,
    p_position INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id TEXT,
    sprint_id UUID,
    title TEXT,
    gradient TEXT,
    col_position INTEGER,
    created_by UUID,
    created_at TIMESTAMPTZ,
    updated_by UUID,
    updated_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE board_columns
    SET
        title = COALESCE(p_title, board_columns.title),
        gradient = COALESCE(p_gradient, board_columns.gradient),
        position = COALESCE(p_position, board_columns.position),
        updated_by = auth.uid(),
        updated_at = NOW()
    WHERE board_columns.id = p_id
    RETURNING
        board_columns.id,
        board_columns.sprint_id,
        board_columns.title,
        board_columns.gradient,
        board_columns.position as col_position,
        board_columns.created_by,
        board_columns.created_at,
        board_columns.updated_by,
        board_columns.updated_at;
END;
$$;

-- Function to delete a column
CREATE OR REPLACE FUNCTION delete_sprint_column(p_id TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_story_count INTEGER;
BEGIN
    -- Check if column has stories
    SELECT COUNT(*) INTO v_story_count
    FROM stories
    WHERE column_id = p_id;

    IF v_story_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete column with stories. Please move or delete all stories first.';
    END IF;

    -- Delete the column
    DELETE FROM board_columns WHERE id = p_id;

    RETURN TRUE;
END;
$$;

-- Function to initialize default columns
CREATE OR REPLACE FUNCTION init_default_columns(p_sprint_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if columns already exist
    IF EXISTS (SELECT 1 FROM board_columns WHERE sprint_id = p_sprint_id) THEN
        RETURN FALSE;
    END IF;

    -- Insert default columns
    INSERT INTO board_columns (id, sprint_id, title, gradient, position, created_by, updated_by)
    VALUES
        ('backlog', p_sprint_id, 'Backlog', 'slate', 0, auth.uid(), auth.uid()),
        ('todo', p_sprint_id, 'To Do', 'blue', 1, auth.uid(), auth.uid()),
        ('in-progress', p_sprint_id, 'In Progress', 'orange', 2, auth.uid(), auth.uid()),
        ('review', p_sprint_id, 'In Review', 'purple', 3, auth.uid(), auth.uid()),
        ('done', p_sprint_id, 'Done', 'green', 4, auth.uid(), auth.uid());

    RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_sprint_columns(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_sprint_column(TEXT, UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_sprint_column(TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_sprint_column(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION init_default_columns(UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_sprint_columns(UUID) IS 'Get all columns for a sprint (bypasses PostgREST cache)';
COMMENT ON FUNCTION create_sprint_column(TEXT, UUID, TEXT, TEXT, INTEGER) IS 'Create a new column (bypasses PostgREST cache)';
COMMENT ON FUNCTION update_sprint_column(TEXT, TEXT, TEXT, INTEGER) IS 'Update a column (bypasses PostgREST cache)';
COMMENT ON FUNCTION delete_sprint_column(TEXT) IS 'Delete a column (bypasses PostgREST cache)';
COMMENT ON FUNCTION init_default_columns(UUID) IS 'Initialize default columns for a new sprint (bypasses PostgREST cache)';
