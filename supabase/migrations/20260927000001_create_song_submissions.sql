-- ==============================================================================
-- Migration: 20260927000001_create_song_submissions.sql
-- Description: Community Chord Submissions & Admin Review Workflow
-- ==============================================================================

-- 1. Create Song Submissions Table
CREATE TABLE IF NOT EXISTS public.song_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_raw TEXT,
  artist_raw TEXT,
  raw_content TEXT NOT NULL,
  title_si TEXT,
  title_en TEXT,
  artist TEXT,
  key TEXT DEFAULT 'C',
  tempo_bpm INTEGER DEFAULT 90,
  time_signature TEXT DEFAULT '4/4',
  strum_pattern TEXT DEFAULT 'pop_4_4',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  content_chordpro TEXT,
  content_singlish TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.song_submissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone can view submissions (or check status)
DROP POLICY IF EXISTS "Allow public read on song_submissions" ON public.song_submissions;
CREATE POLICY "Allow public read on song_submissions"
  ON public.song_submissions FOR SELECT
  USING (true);

-- Anyone can submit a song
DROP POLICY IF EXISTS "Allow public insert on song_submissions" ON public.song_submissions;
CREATE POLICY "Allow public insert on song_submissions"
  ON public.song_submissions FOR INSERT
  WITH CHECK (true);

-- Allow updates (approval/rejection)
DROP POLICY IF EXISTS "Allow public update on song_submissions" ON public.song_submissions;
CREATE POLICY "Allow public update on song_submissions"
  ON public.song_submissions FOR UPDATE
  USING (true);

-- Allow public insert on songs table (for approved submissions or service key upsert)
DROP POLICY IF EXISTS "Allow public insert on songs" ON public.songs;
CREATE POLICY "Allow public insert on songs"
  ON public.songs FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on songs" ON public.songs;
CREATE POLICY "Allow public update on songs"
  ON public.songs FOR UPDATE
  USING (true);

-- 4. Enable Supabase Realtime Publication for Submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'song_submissions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.song_submissions;
  END IF;
END $$;
