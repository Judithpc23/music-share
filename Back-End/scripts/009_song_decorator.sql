-- Decorator support for songs: tags (artist/genre) + reaction summary
-- Also removes deprecated songs.provider field.

ALTER TABLE public.songs
  DROP COLUMN IF EXISTS provider;

DROP VIEW IF EXISTS public.song_tags;
CREATE VIEW public.song_tags AS
SELECT
  s.id AS song_id,
  'artist'::text AS tag_type,
  a.id AS tag_id,
  a.name AS tag_label
FROM public.songs s
JOIN public.artists a ON a.id = s.artist_id
UNION ALL
SELECT
  s.id AS song_id,
  'genre'::text AS tag_type,
  g.id AS tag_id,
  g.name AS tag_label
FROM public.songs s
JOIN public.genres g ON g.id = s.genre_id;

DROP VIEW IF EXISTS public.song_reaction_summary;
DO $$
DECLARE
  share_join_sql TEXT;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'posts'
  ) THEN
    share_join_sql := 'LEFT JOIN public.posts p ON p.song_id = s.id AND p.post_type = ''share'' AND p.status = ''active''';
  ELSE
    share_join_sql := 'LEFT JOIN public.shares p ON p.song_id = s.id AND p.status = ''active''';
  END IF;

  EXECUTE format(
    'CREATE VIEW public.song_reaction_summary AS
     SELECT
       s.id AS song_id,
       COALESCE(COUNT(r.id) FILTER (WHERE r.type = ''like''), 0)::int AS likes,
       COALESCE(COUNT(r.id) FILTER (WHERE r.type = ''love''), 0)::int AS loves,
       COALESCE(COUNT(DISTINCT c.id) FILTER (WHERE c.status = ''active''), 0)::int AS comments,
       COALESCE(COUNT(DISTINCT p.id), 0)::int AS shares,
       COALESCE(COUNT(r.id), 0)::int AS total_reactions
     FROM public.songs s
     LEFT JOIN public.reactions r
       ON r.target_type = ''song''
      AND r.target_id = s.id
     LEFT JOIN public.comments c
       ON c.song_id = s.id
     %s
     GROUP BY s.id',
    share_join_sql
  );
END $$;
