-- Migration: Add status field to sprints table
-- Description: Adds sprint lifecycle status tracking with enum constraint
-- Author: Task 4.1 - Sprint Management Enhancement
-- Date: 2026-02-05

-- Create enum type for sprint status
CREATE TYPE sprint_status AS ENUM ('planning', 'active', 'completed', 'archived');

-- Add status column to sprints table
ALTER TABLE sprints
ADD COLUMN status sprint_status NOT NULL DEFAULT 'planning';

-- Create index for efficient filtering by status
CREATE INDEX idx_sprints_status ON sprints(status);

-- Update existing sprints to have appropriate status based on dates
-- Logic: If end_date has passed, mark as completed; if between dates, mark as active
UPDATE sprints
SET status = CASE
    WHEN end_date IS NOT NULL AND end_date < CURRENT_DATE THEN 'completed'::sprint_status
    WHEN start_date IS NOT NULL AND end_date IS NOT NULL
         AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN 'active'::sprint_status
    ELSE 'planning'::sprint_status
END;

-- Add comment to document the status field
COMMENT ON COLUMN sprints.status IS 'Sprint lifecycle status: planning (initial), active (in progress), completed (finished), archived (historical)';
