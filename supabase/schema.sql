-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. Profiles Table
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  theme_id uuid, -- FK added later after themes table creation
  custom_appearance jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- -----------------------------------------------------------------------------
-- 2. Themes Table
-- -----------------------------------------------------------------------------
create table public.themes (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  is_system boolean default false,
  is_premium boolean default false,
  created_by uuid references auth.users(id),
  
  -- Theme Properties
  background_type text default 'solid',
  background_value text,
  gradient_start text,
  gradient_end text,
  gradient_direction text,
  background_image_url text,
  background_video_url text,
  
  card_style text default 'fill',
  card_color text,
  card_text_color text,
  card_border_radius text,
  card_shadow_color text,
  
  font_family text default 'Inter',
  font_color text,
  profile_title_color text,
  bio_color text,
  
  button_hover_animation text default 'none',
  social_icon_style text default 'filled',
  avatar_shape text default 'circle',
  
  hide_branding boolean default false,
  custom_css text,
  
  created_at timestamptz default now()
);

-- Add FK to profiles
alter table public.profiles 
  add constraint profiles_theme_id_fkey 
  foreign key (theme_id) references public.themes(id);

-- RLS for Themes
alter table public.themes enable row level security;

create policy "System themes are viewable by everyone."
  on public.themes for select
  using ( is_system = true );

create policy "Users can view their own custom themes."
  on public.themes for select
  using ( auth.uid() = created_by );

create policy "Users can create their own themes."
  on public.themes for insert
  with check ( auth.uid() = created_by );

create policy "Users can update their own themes."
  on public.themes for update
  using ( auth.uid() = created_by );

create policy "Users can delete their own themes."
  on public.themes for delete
  using ( auth.uid() = created_by );

-- -----------------------------------------------------------------------------
-- 3. Links Table
-- -----------------------------------------------------------------------------
create table public.links (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  type text not null default 'classic',
  title text,
  url text,
  thumbnail_url text,
  icon text,
  position integer default 0,
  is_active boolean default true,
  is_highlighted boolean default false,
  highlight_animation text default 'none',
  layout text default 'classic',
  schedule_start timestamptz,
  schedule_end timestamptz,
  click_count integer default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Links
alter table public.links enable row level security;

create policy "Public links are viewable by everyone."
  on public.links for select
  using ( true );

create policy "Users can insert their own links."
  on public.links for insert
  with check ( auth.uid() = profile_id );

create policy "Users can update their own links."
  on public.links for update
  using ( auth.uid() = profile_id );

create policy "Users can delete their own links."
  on public.links for delete
  using ( auth.uid() = profile_id );

-- -----------------------------------------------------------------------------
-- 4. Analytics Events Table
-- -----------------------------------------------------------------------------
create table public.analytics_events (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  link_id uuid references public.links(id) on delete set null,
  event_type text not null, -- 'page_view', 'link_click', etc.
  referrer text,
  country text,
  city text,
  region text,
  device_type text,
  browser text,
  os text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  ip_hash text,
  created_at timestamptz default now()
);

-- RLS for Analytics
alter table public.analytics_events enable row level security;

-- Allow anonymous inserts for tracking (public pages)
create policy "Anyone can insert analytics events."
  on public.analytics_events for insert
  with check ( true );

-- Only owners can view their analytics
create policy "Users can view their own analytics."
  on public.analytics_events for select
  using ( auth.uid() = profile_id );

-- -----------------------------------------------------------------------------
-- 5. Functions & Triggers
-- -----------------------------------------------------------------------------

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger for profiles
create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute procedure update_updated_at_column();

-- Trigger for links
create trigger update_links_updated_at
    before update on public.links
    for each row execute procedure update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 6. Indexes for Performance
-- -----------------------------------------------------------------------------
create index idx_links_profile_id on public.links(profile_id);
create index idx_links_position on public.links(position);
create index idx_analytics_profile_id on public.analytics_events(profile_id);
create index idx_analytics_link_id on public.analytics_events(link_id);
create index idx_analytics_created_at on public.analytics_events(created_at);
create index idx_profiles_username on public.profiles(username);

-- -----------------------------------------------------------------------------
-- 8. Trigger to Increment Click Count
-- -----------------------------------------------------------------------------
create or replace function increment_link_click_count()
returns trigger as $$
begin
  if new.event_type = 'link_click' and new.link_id is not null then
    update public.links
    set click_count = click_count + 1
    where id = new.link_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_analytics_event_created
  after insert on public.analytics_events
  for each row execute procedure increment_link_click_count();

