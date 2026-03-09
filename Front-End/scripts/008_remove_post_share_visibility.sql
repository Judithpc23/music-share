-- Remove per-post/share visibility controls.
-- Visibility is now derived from profile privacy + follow relationship.

-- 1) Remove old shares view first (it may depend on posts.visibility).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'shares'
      AND c.relkind IN ('v', 'm')
  ) THEN
    DROP VIEW public.shares;
  END IF;
END $$;

-- 2) If shares is still a physical table, keep it as legacy backup.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'shares'
      AND c.relkind = 'r'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'shares_legacy'
      AND c.relkind = 'r'
  ) THEN
    ALTER TABLE public.shares RENAME TO shares_legacy;
  END IF;
END $$;

-- 3) Drop visibility-related constraints/column on posts.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_visibility_check'
  ) THEN
    ALTER TABLE public.posts DROP CONSTRAINT posts_visibility_check;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_unified_shape_check'
  ) THEN
    ALTER TABLE public.posts DROP CONSTRAINT posts_unified_shape_check;
  END IF;
END $$;

ALTER TABLE public.posts DROP COLUMN IF EXISTS visibility;

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
    ALTER TABLE public.shares DROP COLUMN IF EXISTS visibility;
  END IF;
END $$;

-- 4) Recreate compatibility view with synthetic visibility.
CREATE VIEW public.shares AS
SELECT
  p.id,
  p.user_id,
  p.song_id,
  p.caption_text,
  'public'::text AS visibility,
  p.created_at,
  p.status
FROM public.posts p
WHERE p.post_type = 'share';
