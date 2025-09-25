-- Add settings columns to users table
-- Run this SQL in your Supabase SQL Editor

-- Add email_notifications column (defaults to true)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Add profile_public column (defaults to true)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_public BOOLEAN DEFAULT true;

-- Update existing users to have default values if they don't already
UPDATE public.users
SET
  email_notifications = true,
  profile_public = true
WHERE
  email_notifications IS NULL
  OR profile_public IS NULL;