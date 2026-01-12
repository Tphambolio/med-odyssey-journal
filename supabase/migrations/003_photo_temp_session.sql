-- Add temp_session_id to photos table for pre-save uploads
-- Photos can be uploaded before a journal is saved and linked later

ALTER TABLE photos ADD COLUMN IF NOT EXISTS temp_session_id UUID;

-- Index for efficient lookup of temporary photos
CREATE INDEX IF NOT EXISTS idx_photos_temp_session
  ON photos(temp_session_id)
  WHERE temp_session_id IS NOT NULL;

-- Function to clean up orphaned temp photos (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_orphaned_temp_photos()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM photos
    WHERE temp_session_id IS NOT NULL
      AND journal_id IS NULL
      AND created_at < NOW() - INTERVAL '24 hours'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$;
