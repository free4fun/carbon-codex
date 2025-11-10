-- Add social links to authors
ALTER TABLE authors
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS x_url text;

-- Add read minutes to posts
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS read_minutes integer;

-- Backfill read_minutes with 0 where null
UPDATE posts SET read_minutes = 0 WHERE read_minutes IS NULL;
