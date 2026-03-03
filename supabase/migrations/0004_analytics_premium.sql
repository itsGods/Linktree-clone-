-- Add subscription_tier to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';

-- Create index for subscription_tier
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier 
ON profiles(subscription_tier);

-- Update RLS policies to allow users to read their own subscription tier
CREATE POLICY "Users can read own subscription tier" 
ON profiles FOR SELECT 
USING (auth.uid() = id);
