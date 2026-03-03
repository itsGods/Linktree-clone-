-- Add SEO fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS og_image_url text,
ADD COLUMN IF NOT EXISTS og_template_style text DEFAULT 'default';

-- Add check constraint for template style if needed, or handle in app logic
-- ALTER TABLE profiles ADD CONSTRAINT check_og_template_style CHECK (og_template_style IN ('default', 'minimal', 'dark', 'gradient', 'glass'));
