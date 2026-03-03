-- Create enums
CREATE TYPE background_type AS ENUM (
  'solid',
  'gradient',
  'image',
  'video',
  'animated'
);

CREATE TYPE card_style AS ENUM (
  'fill',
  'outline',
  'soft_shadow',
  'hard_shadow',
  'glass'
);

CREATE TYPE avatar_shape AS ENUM (
  'circle',
  'rounded',
  'square'
);

CREATE TYPE hover_animation AS ENUM (
  'none',
  'scale',
  'lift',
  'glow',
  'fill'
);

CREATE TYPE social_icon_style AS ENUM (
  'filled',
  'outline',
  'brand'
);

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_premium boolean DEFAULT false,
  is_system boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  
  -- Background
  background_type background_type DEFAULT 'solid',
  background_value text DEFAULT '#ffffff', -- Color hex or css value
  gradient_start text,
  gradient_end text,
  gradient_direction text, -- 'to right', 'to bottom right', etc.
  background_image_url text,
  background_video_url text,
  
  -- Card
  card_style card_style DEFAULT 'fill',
  card_color text DEFAULT '#ffffff',
  card_text_color text DEFAULT '#000000',
  card_border_radius text DEFAULT 'md', -- 'none', 'sm', 'md', 'lg', 'full'
  card_shadow_color text DEFAULT 'rgba(0,0,0,0.1)',
  
  -- Typography
  font_family text DEFAULT 'Inter',
  font_color text DEFAULT '#000000',
  profile_title_color text DEFAULT '#000000',
  bio_color text DEFAULT '#666666',
  
  -- Interactions
  button_hover_animation hover_animation DEFAULT 'scale',
  social_icon_style social_icon_style DEFAULT 'filled',
  avatar_shape avatar_shape DEFAULT 'circle',
  
  -- Advanced
  hide_branding boolean DEFAULT false,
  custom_css text,
  
  created_at timestamptz DEFAULT now()
);

-- Add columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme_id uuid REFERENCES themes(id),
ADD COLUMN IF NOT EXISTS custom_appearance jsonb DEFAULT '{}'::jsonb;

-- RLS Policies for Themes
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System themes are viewable by everyone" 
ON themes FOR SELECT 
USING (is_system = true);

CREATE POLICY "Users can view their own themes" 
ON themes FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Users can create their own themes" 
ON themes FOR INSERT 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own themes" 
ON themes FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own themes" 
ON themes FOR DELETE 
USING (created_by = auth.uid());

-- Storage bucket for backgrounds
INSERT INTO storage.buckets (id, name, public) 
VALUES ('backgrounds', 'backgrounds', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for backgrounds
CREATE POLICY "Background images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'backgrounds' );

CREATE POLICY "Anyone can upload a background"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'backgrounds' AND auth.uid() = owner );

CREATE POLICY "Anyone can update their own background"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'backgrounds' AND auth.uid() = owner );

CREATE POLICY "Anyone can delete their own background"
ON storage.objects FOR DELETE
USING ( bucket_id = 'backgrounds' AND auth.uid() = owner );

-- Insert some default system themes
INSERT INTO themes (name, is_system, background_type, background_value, card_style, card_color, card_text_color, font_family)
VALUES 
('Clean White', true, 'solid', '#ffffff', 'soft_shadow', '#ffffff', '#000000', 'Inter'),
('Dark Mode', true, 'solid', '#1a1a1a', 'fill', '#2d2d2d', '#ffffff', 'Inter'),
('Blue Gradient', true, 'gradient', null, 'glass', 'rgba(255,255,255,0.2)', '#ffffff', 'Poppins');

-- Update Blue Gradient specific fields
UPDATE themes 
SET gradient_start = '#4facfe', gradient_end = '#00f2fe', gradient_direction = 'to right'
WHERE name = 'Blue Gradient';
