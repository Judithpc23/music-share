-- Incremental migration for existing projects
-- Adds auth-related user profile fields, genre tables and song genre_id migration

create table if not exists public.genres (
  id text primary key,
  name text not null unique,
  description varchar(150) not null,
  created_at timestamptz not null default now()
);

insert into public.genres (id, name, description, created_at) values
  ('genre-electronic', 'Electronic', 'Electronic music with synthesized sounds and modern production.', now()),
  ('genre-synthwave',  'Synthwave',  'Retro-futuristic sound inspired by 80s electronic aesthetics.', now()),
  ('genre-hiphop',     'Hip-Hop',    'Rhythmic vocal-driven genre focused on beats and lyrical flow.', now()),
  ('genre-chill',      'Chill',      'Relaxed, mellow tracks designed for calm listening moments.', now()),
  ('genre-rnb',        'R&B',        'Rhythm and blues blending soulful vocals with groove-driven music.', now())
on conflict (id) do nothing;

alter table public.songs add column if not exists genre_id text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'songs'
      and column_name = 'genre'
  ) then
    update public.songs
    set genre_id = case lower(trim(genre))
      when 'electronic' then 'genre-electronic'
      when 'synthwave' then 'genre-synthwave'
      when 'hip-hop' then 'genre-hiphop'
      when 'chill' then 'genre-chill'
      when 'r&b' then 'genre-rnb'
      else genre_id
    end
    where genre_id is null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'songs_genre_id_fkey'
  ) then
    alter table public.songs
      add constraint songs_genre_id_fkey
      foreign key (genre_id) references public.genres(id);
  end if;
end $$;

update public.songs
set genre_id = 'genre-electronic'
where genre_id is null;

alter table public.songs alter column genre_id set not null;

alter table public.songs drop column if exists genre;

alter table public.users add column if not exists first_name text not null default '';
alter table public.users add column if not exists last_name text not null default '';
alter table public.users add column if not exists privacity text not null default 'public';
alter table public.users add column if not exists img text;
alter table public.users add column if not exists fav_genres text;
alter table public.users add column if not exists fav_song text;
alter table public.users add column if not exists mood text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_privacity_check'
  ) then
    alter table public.users
      add constraint users_privacity_check
      check (privacity in ('public', 'private'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_fav_genres_fkey'
  ) then
    alter table public.users
      add constraint users_fav_genres_fkey
      foreign key (fav_genres) references public.genres(id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_fav_song_key'
  ) then
    alter table public.users
      add constraint users_fav_song_key unique (fav_song);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_fav_song_fkey'
  ) then
    alter table public.users
      add constraint users_fav_song_fkey
      foreign key (fav_song) references public.songs(id);
  end if;
end $$;

create table if not exists public.user_favorite_genres (
  user_id text not null references public.users(id) on delete cascade,
  genre_id text not null references public.genres(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, genre_id)
);

alter table public.genres enable row level security;
alter table public.user_favorite_genres enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'genres'
      and policyname = 'public_access'
  ) then
    create policy "public_access"
      on public.genres
      for all
      using (true)
      with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_favorite_genres'
      and policyname = 'public_access'
  ) then
    create policy "public_access"
      on public.user_favorite_genres
      for all
      using (true)
      with check (true);
  end if;
end $$;
