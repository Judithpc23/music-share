-- Incremental migration for notifications inbox and follow relationships

create table if not exists public.user_follows (
  follower_id text not null references public.users(id) on delete cascade,
  following_id text not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  primary key (follower_id, following_id),
  constraint user_follows_not_self check (follower_id <> following_id)
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  actor_user_id text not null references public.users(id) on delete cascade,
  type text not null check (
    type in ('post', 'reaction', 'comment', 'follow_request', 'follower')
  ),
  title text not null,
  body text not null,
  target_type text check (
    target_type in ('post', 'share', 'comment', 'follow_request', 'profile')
  ),
  target_id text,
  is_read boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_follows_following_status
  on public.user_follows (following_id, status);

create index if not exists idx_user_follows_follower_status
  on public.user_follows (follower_id, status);

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notifications_user_read
  on public.notifications (user_id, is_read);

alter table public.user_follows enable row level security;
alter table public.notifications enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'user_follows'
      and policyname = 'public_access'
  ) then
    create policy "public_access"
      on public.user_follows
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
      and tablename = 'notifications'
      and policyname = 'public_access'
  ) then
    create policy "public_access"
      on public.notifications
      for all
      using (true)
      with check (true);
  end if;
end $$;
