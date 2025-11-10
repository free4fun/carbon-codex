-- Add image_url to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;