-- Naada (නාද) Supabase PostgreSQL Schema & Seed Data
-- Modern Sinhala Guitar Chords & Jam PWA

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Songs Table
CREATE TABLE IF NOT EXISTS public.songs (
  id TEXT PRIMARY KEY,
  title_si TEXT NOT NULL,
  title_en TEXT NOT NULL,
  artist TEXT NOT NULL,
  key TEXT NOT NULL DEFAULT 'C',
  tempo_bpm INTEGER NOT NULL DEFAULT 90,
  time_signature TEXT NOT NULL DEFAULT '4/4',
  strum_pattern TEXT NOT NULL DEFAULT 'pop_4_4',
  content_chordpro TEXT NOT NULL,
  content_singlish TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Jam Rooms Table for Multi-Device Realtime Sync
CREATE TABLE IF NOT EXISTS public.jam_rooms (
  room_code VARCHAR(10) PRIMARY KEY,
  host_id TEXT NOT NULL,
  current_song_id TEXT REFERENCES public.songs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jam_rooms ENABLE ROW LEVEL SECURITY;

-- Allow public read access on songs
CREATE POLICY "Allow public read on songs"
  ON public.songs FOR SELECT
  USING (true);

-- Allow public read and write on jam_rooms for real-time collaboration
CREATE POLICY "Allow public access on jam_rooms"
  ON public.jam_rooms FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Supabase Realtime broadcast for jam_rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.jam_rooms;

-- 3. Seed Songs Mock Data
INSERT INTO public.songs (id, title_si, title_en, artist, key, tempo_bpm, time_signature, strum_pattern, content_chordpro, content_singlish)
VALUES
(
  'gamen-liyumak',
  'ගමෙන් ලියුමක්',
  'Gamen Liyumak',
  'Clarence Wijewardena',
  'G',
  124,
  '6/8',
  'baila_6_8',
  '[Chorus]
[G]ගමෙන් ලියුමක් ඇවිල්ලා මගේ නම [C]ලියලා
[D]ගමේ සුවඳයි ඒ ලියුමේ [G]ගැවිලා
[G]ගමෙන් ලියුමක් ඇවිල්ලා මගේ නම [C]ලියලා
[D7]ගමේ සුවඳයි ඒ ලියුමේ [G]ගැවිලා

[Verse 1]
[G]අම්මා ලියලා තියෙන්නේ [C]සනීපෙන් දෝ [G]අහලා
[G]තාත්තා කුඹුරට ගිහින්ලු [D]උදේ පාන්දර [G]නැගිටලා
[Em]නංගී පාසල් යනවලු [Am]හොඳින් ඉගෙන [D]ගන්නවාලු
[D]මල්ලි එළදෙන බලාගන්න [G]පිට්ටනියට යනවාලු',
  '[Chorus]
[G]Gamen liyumak awilla mage nama [C]liyala
[D]Game suwandai e liyume [G]gawila
[G]Gamen liyumak awilla mage nama [C]liyala
[D7]Game suwandai e liyume [G]gawila

[Verse 1]
[G]Amma liyala thiyenne [C]saneependo [G]ahala
[G]Thaththa kumburata gihinlu [D]ude paandara [G]nagithala
[Em]Nangi paasal yanawalu [Am]hondin igena [D]gannawalu
[D]Malli eladena balaaganna [G]pittaniyata yanawalu'
),
(
  'ran-kuduwe',
  'රන් කූඩුවේ',
  'Ran Kuduwe',
  'Milton Mallawarachchi',
  'C',
  88,
  '4/4',
  'pop_4_4',
  '[Chorus]
[C]රන් කූඩුවේ [Am]සිරකරලා
[F]තබා නෑ ඔබේ ආ[G]දරේ
[C]පෙම් චේතනා [Am]මල් පිපිලා
[F]සුවඳයි මගේ ජී[G]විතේ
[F]සදාකාලිකයි [G]මේ ප්‍රේ[C]මේ

[Verse 1]
[C]තරු එළියේ නිල් දිය මත [Em]දිලෙන්නේ
[F]ඔබේ දෙනෙතේ කැළුමයි [G]දැනෙන්නේ
[Am]සඳ පානේ සීතල [Em]සුළඟේ
[F]මුමුණන්නේ අපේ ආ[G]දරේ',
  '[Chorus]
[C]Ran kuduwe [Am]sirakarala
[F]Thaba na obe aa[G]dare
[C]Pem chethana [Am]mal pipila
[F]Suwandai mage jee[G]withe
[F]Sadakaalikai [G]me pre[C]me

[Verse 1]
[C]Tharu eliye nil diya matha [Em]dilenne
[F]Obe denethe kalumai [G]danenne
[Am]Sanda paane seethala [Em]sulange
[F]Mumunanne ape aa[G]dare'
),
(
  'mal-mitak-thiyanna',
  'මල් මිටක් තියන්න',
  'Mal Mitak Thiyanna',
  'Kasun Kalhara',
  'Dm',
  78,
  '3/4',
  'sarala_3_4',
  '[Chorus]
[Dm]මල් මිටක් තියන්න [Gm]ඔබේ අතේ
[C]මට තහනම් නෑ [F]නොවේ
[Dm]එහෙත් මම දනිමි [Gm]සොඳුරියෙ
[Bb]ඔබ මගේ ලොව [A7]නොවේ
[Bb]ඔබ මගේ ලොව [A7]නො[Dm]වේ

[Verse 1]
[Dm]නෙතඟ කඳුලැලි [Gm]සඟවාගෙන
[C]සිනහවෙන් මට [F]සංග්‍රහ කර
[Bb]යන්න අවසර [Gm]දෙන්න සොඳුරියෙ
[A7]ඔබේ ලොවින් මට [Dm]යන්නට',
  '[Chorus]
[Dm]Mal mitak thiyanna [Gm]obe athe
[C]Mata thahanam na [F]nowe
[Dm]Eheth mama danimi [Gm]sonduriye
[Bb]Oba mage lowa [A7]nowe
[Bb]Oba mage lowa [A7]no[Dm]we

[Verse 1]
[Dm]Nethanga kanduleli [Gm]sangawaagena
[C]Sinahawen mata [F]sangraha kara
[Bb]Yanna awasara [Gm]denna sonduriye
[A7]Obe lowin mata [Dm]yannata'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Song Submissions Table (Community Contribution Workflow)
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

ALTER TABLE public.song_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on song_submissions"
  ON public.song_submissions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on song_submissions"
  ON public.song_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on song_submissions"
  ON public.song_submissions FOR UPDATE
  USING (true);

