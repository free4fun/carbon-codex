-- Add website_url column to authors table
ALTER TABLE authors ADD COLUMN IF NOT EXISTS website_url text;
