-- User-scoped website background preference.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS background_theme JSONB NOT NULL DEFAULT '{"type":"gradient","id":"agile-rose"}'::jsonb;

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_background_theme_shape;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_background_theme_shape
CHECK (
    jsonb_typeof(background_theme) = 'object'
    AND background_theme ? 'type'
    AND (
        (
            background_theme->>'type' = 'gradient'
            AND background_theme ? 'id'
        )
        OR (
            background_theme->>'type' = 'custom'
            AND background_theme ? 'color'
            AND background_theme->>'color' ~ '^#[0-9a-fA-F]{6}$'
        )
    )
);

DO $$
BEGIN
    CREATE POLICY "Users can update their own background theme"
    ON public.profiles
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
