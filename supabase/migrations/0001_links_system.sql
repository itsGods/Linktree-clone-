-- Create enums
CREATE TYPE link_type AS ENUM (
  'classic',
  'header',
  'text_block',
  'image',
  'video',
  'music',
  'commerce',
  'email_collector',
  'contact',
  'map'
);

CREATE TYPE highlight_animation AS ENUM (
  'none',
  'shake',
  'pulse',
  'bounce',
  'glow'
);

CREATE TYPE link_layout AS ENUM (
  'classic',
  'featured',
  'thumbnail_left',
  'thumbnail_right'
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type link_type NOT NULL DEFAULT 'classic',
  title text,
  url text,
  thumbnail_url text,
  icon text,
  position integer NOT NULL,
  is_active boolean DEFAULT true,
  is_highlighted boolean DEFAULT false,
  highlight_animation highlight_animation DEFAULT 'none',
  layout link_layout DEFAULT 'classic',
  schedule_start timestamptz,
  schedule_end timestamptz,
  click_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_links_profile ON links(profile_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(profile_id, position);
CREATE INDEX IF NOT EXISTS idx_links_active ON links(profile_id) WHERE is_active = true;

-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public Read Policy
CREATE POLICY "Public links are viewable by everyone" 
ON links FOR SELECT 
USING (
  is_active = true AND
  (schedule_start IS NULL OR schedule_start <= now()) AND
  (schedule_end IS NULL OR schedule_end >= now())
);

-- Owner Policies
CREATE POLICY "Users can view their own links" 
ON links FOR SELECT 
USING (
  auth.uid() = profile_id
);

CREATE POLICY "Users can insert their own links" 
ON links FOR INSERT 
WITH CHECK (
  auth.uid() = profile_id
);

CREATE POLICY "Users can update their own links" 
ON links FOR UPDATE 
USING (
  auth.uid() = profile_id
);

CREATE POLICY "Users can delete their own links" 
ON links FOR DELETE 
USING (
  auth.uid() = profile_id
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'click', 'view'
  user_agent text,
  ip_address text, -- Consider privacy implications
  country text,
  city text,
  device text,
  browser text,
  os text,
  referer text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_link ON analytics_events(link_id);
CREATE INDEX IF NOT EXISTS idx_analytics_profile ON analytics_events(profile_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Only owner can view analytics
CREATE POLICY "Users can view their own analytics" 
ON analytics_events FOR SELECT 
USING (
  auth.uid() = profile_id
);

-- Public can insert analytics (via API)
-- We'll handle this via service role in the API route usually, but for RLS:
CREATE POLICY "Public can insert analytics"
ON analytics_events FOR INSERT
WITH CHECK (true);

-- RPC for incrementing click count
CREATE OR REPLACE FUNCTION increment_click_count(link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE links
  SET click_count = click_count + 1
  WHERE id = link_id;
END;
$$;

-- Storage bucket for thumbnails
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for thumbnails
CREATE POLICY "Thumbnail images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'thumbnails' );

CREATE POLICY "Anyone can upload a thumbnail"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'thumbnails' AND auth.uid() = owner );

CREATE POLICY "Anyone can update their own thumbnail"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'thumbnails' AND auth.uid() = owner );

CREATE POLICY "Anyone can delete their own thumbnail"
ON storage.objects FOR DELETE
USING ( bucket_id = 'thumbnails' AND auth.uid() = owner );
