-- SoundShare Database Schema - Tables only

-- Genres
create table if not exists public.genres (
  id text primary key,
  name text not null unique,
  description varchar(150) not null,
  created_at timestamptz not null default now()
);

-- Users
create table if not exists public.users (
  id text primary key,
  username text not null unique,
  email text not null unique,
  role text not null default 'user',
  bio text,
  first_name text not null default '',
  last_name text not null default '',
  privacity text not null default 'public' check (privacity in ('public', 'private')),
  img text,
  fav_genres text references public.genres(id),
  fav_song text unique,
  mood text not null default ''
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
  genre_id text not null references public.genres(id),
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
  visibility text not null default 'public',
  created_at timestamptz not null default now(),
  status text not null default 'active'
);

-- Reactions
create table if not exists public.reactions (
  id text primary key,
  target_type text not null,
  target_id text not null,
  user_id text not null references public.users(id),
  type text not null,
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
  status text not null default 'active'
);

-- Reports
create table if not exists public.reports (
  id text primary key,
  target_type text not null,
  target_id text not null,
  user_id text not null references public.users(id),
  reason text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending'
);

-- Listening Rooms
create table if not exists public.listening_rooms (
  id text primary key,
  name text not null,
  host_user_id text not null references public.users(id),
  current_song_id text not null references public.songs(id),
  status text not null default 'active',
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
  action text not null,
  timestamp timestamptz not null default now(),
  details text
);

-- User favorite genres (supports selecting multiple genres)
create table if not exists public.user_favorite_genres (
  user_id text not null references public.users(id) on delete cascade,
  genre_id text not null references public.genres(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, genre_id)
);

-- Optional favorite song relationship
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_fav_song_fkey'
  ) then
    alter table public.users
      add constraint users_fav_song_fkey
      foreign key (fav_song) references public.songs(id);
  end if;
end $$;
