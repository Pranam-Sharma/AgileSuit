-- Add identified_risks JSONB column to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS identified_risks JSONB DEFAULT '[]'::jsonb;

-- Convert acceptance_criteria to JSONB if it exists as TEXT, or add it as JSONB
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'acceptance_criteria' AND data_type = 'text') THEN
        ALTER TABLE stories ALTER COLUMN acceptance_criteria TYPE JSONB USING to_jsonb(acceptance_criteria);
        ALTER TABLE stories ALTER COLUMN acceptance_criteria SET DEFAULT '[]'::jsonb;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'acceptance_criteria') THEN
        ALTER TABLE stories ADD COLUMN acceptance_criteria JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN stories.identified_risks IS 'JSON array of identified risks with text and severity';
COMMENT ON COLUMN stories.acceptance_criteria IS 'JSON array of acceptance criteria items';
