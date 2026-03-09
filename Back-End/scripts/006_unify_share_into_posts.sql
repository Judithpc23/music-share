-- Unify "share" as a post type and keep backward compatibility.
-- This migration is idempotent and works whether posts/shares already exist or not.

-- 1) Ensure posts table exists with unified columns
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL DEFAULT 'template',
  content TEXT NOT NULL DEFAULT '',
  mood TEXT,
  template JSONB,
  song_id TEXT,
  caption_text TEXT,
  visibility TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS template JSONB;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS song_id TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS caption_text TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS visibility TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.posts
  ALTER COLUMN post_type SET DEFAULT 'template';

UPDATE public.posts
SET post_type = 'template'
WHERE post_type IS NULL;

UPDATE public.posts
SET content = ''
WHERE content IS NULL;

ALTER TABLE public.posts
  ALTER COLUMN content SET DEFAULT '';

-- 2) Constraints and indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_post_type_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_post_type_check
      CHECK (post_type IN ('template', 'share'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_song_id_fkey'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_song_id_fkey
      FOREIGN KEY (song_id) REFERENCES public.songs(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_visibility_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_visibility_check
      CHECK (visibility IS NULL OR visibility IN ('public', 'friends'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_status_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_status_check
      CHECK (status IS NULL OR status IN ('active', 'hidden', 'deleted'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_mood_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_mood_check
      CHECK (mood IS NULL OR mood IN ('nostalgia', 'energy', 'chill'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_unified_shape_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_unified_shape_check
      CHECK (
        (post_type = 'template' AND mood IS NOT NULL AND template IS NOT NULL)
        OR
        (post_type = 'share' AND song_id IS NOT NULL AND caption_text IS NOT NULL AND visibility IS NOT NULL AND status IS NOT NULL)
      ) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_song_id ON public.posts(song_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);

-- 3) Backfill from legacy shares table if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'shares'
  ) THEN
    INSERT INTO public.posts (
      id,
      user_id,
      post_type,
      content,
      mood,
      template,
      song_id,
      caption_text,
      visibility,
      status,
      created_at,
      updated_at
    )
    SELECT
      s.id,
      s.user_id,
      'share',
      s.caption_text,
      NULL,
      NULL,
      s.song_id,
      s.caption_text,
      s.visibility,
      s.status,
      s.created_at,
      s.created_at
    FROM public.shares s
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 4) Normalize share rows in posts
UPDATE public.posts
SET
  content = COALESCE(caption_text, content, ''),
  visibility = COALESCE(visibility, 'public'),
  status = COALESCE(status, 'active')
WHERE post_type = 'share';

-- 5) Keep compatibility: turn "shares" into a view backed by posts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'shares'
      AND c.relkind = 'r'
  ) THEN
    ALTER TABLE public.shares RENAME TO shares_legacy;
  END IF;
END $$;

CREATE OR REPLACE VIEW public.shares AS
SELECT
  p.id,
  p.user_id,
  p.song_id,
  p.caption_text,
  p.visibility,
  p.created_at,
  p.status
FROM public.posts p
WHERE p.post_type = 'share';
