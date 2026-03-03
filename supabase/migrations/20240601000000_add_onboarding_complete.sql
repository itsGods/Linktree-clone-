-- Add onboarding_complete column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Update existing profiles to have onboarding_complete = true if they have a username
UPDATE profiles 
SET onboarding_complete = TRUE 
WHERE username IS NOT NULL;
