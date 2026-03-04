-- SoundShare Database Schema
-- Creates all tables for the SoundShare social music platform

-- Users (simulated, no auth)
create table if not exists public.users (
  id text primary key,
  username text not null unique,
  email text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  bio text
);

-- Artists
create table if not exists public.artists (
  id text primary key,
  name text not null,
  verified boolean not null default false
);

-- Songs
create table if not exists public.songs (
  id text primary key,
  title text not null,
  artist_id text not null references public.artists(id),
  genre text not null,
  provider text not null,
  cover_image_url text,
  created_at timestamptz not null default now(),
  duration integer not null default 0
);

-- Shares
create table if not exists public.shares (
  id text primary key,
  user_id text not null references public.users(id),
  song_id text not null references public.songs(id),
  caption_text text not null,
  visibility text not null default 'public' check (visibility in ('public', 'friends')),
  created_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted'))
);

-- Reactions
create table if not exists public.reactions (
  id text primary key,
  target_type text not null check (target_type in ('song', 'share', 'comment')),
  target_id text not null,
  user_id text not null references public.users(id),
  type text not null check (type in ('like', 'love')),
  created_at timestamptz not null default now(),
  unique (target_type, target_id, user_id, type)
);

-- Comments
create table if not exists public.comments (
  id text primary key,
  song_id text not null references public.songs(id),
  user_id text not null references public.users(id),
  content text not null,
  created_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted'))
);

-- Reports
create table if not exists public.reports (
  id text primary key,
  target_type text not null check (target_type in ('share', 'comment')),
  target_id text not null,
  user_id text not null references public.users(id),
  reason text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'resolved'))
);

-- Listening Rooms
create table if not exists public.listening_rooms (
  id text primary key,
  name text not null,
  host_user_id text not null references public.users(id),
  current_song_id text not null references public.songs(id),
  status text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default now()
);

-- Room Members
create table if not exists public.room_members (
  room_id text not null references public.listening_rooms(id) on delete cascade,
  user_id text not null references public.users(id),
  joined_at timestamptz not null default now(),
  is_host boolean not null default false,
  primary key (room_id, user_id)
);

-- Playback States
create table if not exists public.playback_states (
  room_id text primary key references public.listening_rooms(id) on delete cascade,
  current_song_id text not null references public.songs(id),
  is_playing boolean not null default false,
  position_seconds integer not null default 0,
  last_updated_at timestamptz not null default now(),
  last_updated_by text not null references public.users(id)
);

-- Room Activities
create table if not exists public.room_activities (
  id text primary key,
  room_id text not null references public.listening_rooms(id) on delete cascade,
  user_id text not null references public.users(id),
  action text not null check (action in ('joined', 'left', 'played', 'paused', 'seeked')),
  timestamp timestamptz not null default now(),
  details text
);

-- Enable RLS on all tables (public access for simulation)
alter table public.users enable row level security;
alter table public.artists enable row level security;
alter table public.songs enable row level security;
alter table public.shares enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.listening_rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.playback_states enable row level security;
alter table public.room_activities enable row level security;

-- Public read/write policies for simulation (no auth required)
create policy "public_access" on public.users for all using (true) with check (true);
create policy "public_access" on public.artists for all using (true) with check (true);
create policy "public_access" on public.songs for all using (true) with check (true);
create policy "public_access" on public.shares for all using (true) with check (true);
create policy "public_access" on public.reactions for all using (true) with check (true);
create policy "public_access" on public.comments for all using (true) with check (true);
create policy "public_access" on public.reports for all using (true) with check (true);
create policy "public_access" on public.listening_rooms for all using (true) with check (true);
create policy "public_access" on public.room_members for all using (true) with check (true);
create policy "public_access" on public.playback_states for all using (true) with check (true);
create policy "public_access" on public.room_activities for all using (true) with check (true);
