-- Create unified posts table (template posts + share posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL DEFAULT 'template' CHECK (post_type IN ('template', 'share')),
  content TEXT NOT NULL DEFAULT '',
  mood TEXT CHECK (mood IS NULL OR mood IN ('nostalgia', 'energy', 'chill')),
  template JSONB,
  song_id TEXT REFERENCES public.songs(id),
  caption_text TEXT,
  visibility TEXT CHECK (visibility IS NULL OR visibility IN ('public', 'friends')),
  status TEXT CHECK (status IS NULL OR status IN ('active', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shape constraints by type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_template_shape_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_template_shape_check
      CHECK (
        (post_type = 'template' AND mood IS NOT NULL AND template IS NOT NULL)
        OR
        (post_type = 'share' AND song_id IS NOT NULL AND caption_text IS NOT NULL AND visibility IS NOT NULL AND status IS NOT NULL)
      );
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_mood ON public.posts(mood);
CREATE INDEX IF NOT EXISTS idx_posts_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_song_id ON public.posts(song_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Policy: Users can view all posts
CREATE POLICY "Users can view all posts" 
ON public.posts 
FOR SELECT 
USING (true);

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete their own posts" 
ON public.posts 
FOR DELETE 
USING (auth.uid()::text = user_id);
