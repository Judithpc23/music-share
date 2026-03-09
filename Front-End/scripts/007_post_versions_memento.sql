-- Stores post edit snapshots for undo (Memento)
CREATE TABLE IF NOT EXISTS public.post_versions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_versions_post_created
  ON public.post_versions (post_id, created_at DESC);

ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'post_versions'
      AND policyname = 'public_access'
  ) THEN
    CREATE POLICY "public_access"
      ON public.post_versions
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
