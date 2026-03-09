-- Mirror migration used by Back-End/scripts/006_unify_share_into_posts.sql
-- Keeps "share" unified as post_type='share' and preserves compatibility via view.

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

UPDATE public.posts SET post_type = 'template' WHERE post_type IS NULL;
UPDATE public.posts SET content = '' WHERE content IS NULL;

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
