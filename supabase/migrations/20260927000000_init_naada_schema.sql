-- ==============================================================================
-- Migration: 20260927000000_init_naada_schema.sql
-- Description: Naada (නාද) Core Schema, RLS, Realtime & Seed Data
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Songs Table
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
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Jam Rooms Table for Synchronized Jam Rooms
CREATE TABLE IF NOT EXISTS public.jam_rooms (
  room_code VARCHAR(10) PRIMARY KEY,
  host_id TEXT NOT NULL,
  current_song_id TEXT REFERENCES public.songs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jam_rooms ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Allow anyone to read songs
DROP POLICY IF EXISTS "Allow public read on songs" ON public.songs;
CREATE POLICY "Allow public read on songs"
  ON public.songs FOR SELECT
  USING (true);

-- Allow public read/write on jam_rooms so party participants can join without login
DROP POLICY IF EXISTS "Allow public read on jam_rooms" ON public.jam_rooms;
CREATE POLICY "Allow public read on jam_rooms"
  ON public.jam_rooms FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert on jam_rooms" ON public.jam_rooms;
CREATE POLICY "Allow public insert on jam_rooms"
  ON public.jam_rooms FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on jam_rooms" ON public.jam_rooms;
CREATE POLICY "Allow public update on jam_rooms"
  ON public.jam_rooms FOR UPDATE
  USING (true);

-- 6. Enable Supabase Realtime Publication for Jam Rooms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'jam_rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.jam_rooms;
  END IF;
END $$;

-- 7. Seed Songs Catalog
INSERT INTO public.songs (id, title_si, title_en, artist, key, tempo_bpm, time_signature, strum_pattern, tags, content_chordpro, content_singlish)
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
  ARRAY['Baila', 'Golden 70s', 'Clarence'],
  '[Chorus]
[G]ගමෙන් ලියුමක් ඇවිල්ලා මගේ නම [C]ලියලා
[D]ගමේ සුවඳයි ඒ ලියුමේ [G]ගැවිලා
[G]ගමෙන් ලියුමක් ඇවිල්ලා මගේ නම [C]ලියලා
[D7]ගමේ සුවඳයි ඒ ලියුමේ [G]ගැවිලා

[Verse 1]
[G]අම්මා ලියලා තියෙන්නේ [C]සනීපෙන් දෝ [G]අහලා
[G]තාත්තා කුඹුරට ගිහින්ලු [D]උදේ පාන්දර [G]නැගිටලා
[Em]නංගී පාසල් යනවලු [Am]හොඳින් ඉගෙන [D]ගන්නවාලු
[D]මල්ලි එළදෙන බලාගන්න [G]පිට්ටනියට යනවාලු

[Verse 2]
[G]ගමේ වැවේ දිය පිරිලා [C]නෙළුම් මල් පි[G]පිලා
[G]අලුත් අවුරුදු එනවාලු [D]ගමට සතුට [G]ගෙනැල්ලා
[Em]මටත් ඉක්මනින්ම ගමට [Am]එන්න කියලා [D]ලියලා
[D]ගමේ අය මා එනතුරු [G]මඟ බලා හිඳිනවාලු',
  '[Chorus]
[G]Gamen liyumak awilla mage nama [C]liyala
[D]Game suwandai e liyume [G]gawila
[G]Gamen liyumak awilla mage nama [C]liyala
[D7]Game suwandai e liyume [G]gawila

[Verse 1]
[G]Amma liyala thiyenne [C]saneependo [G]ahala
[G]Thaththa kumburata gihinlu [D]ude paandara [G]nagithala
[Em]Nangi paasal yanawalu [Am]hondin igena [D]gannawalu
[D]Malli eladena balaaganna [G]pittaniyata yanawalu

[Verse 2]
[G]Game wawe diya pirila [C]nelum mal pi[G]pila
[G]Aluth awurudu enawalu [D]gamata sathuta [G]genalla
[Em]Matath ikmaninma gamata [Am]enna kiyala [D]liyala
[D]Game aya ma enathuru [G]maga balaa hindinawalu'
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
  ARRAY['Pop Ballad', 'Love', 'Milton'],
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
[F]මුමුණන්නේ අපේ ආ[G]දරේ

[Verse 2]
[C]ජීවිතයේ දුක් කරදර [Em]මැකීලා
[F]සැනසුම ඔබ ගෙනාවා [G]සොයාලා
[Am]කිසිදාක වෙන්වී [Em]නොයා
[F]සිටිමු අපි සතුටින් [G]සදා',
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
[F]Mumunanne ape aa[G]dare

[Verse 2]
[C]Jeewithe duk karadara [Em]makeela
[F]Sanasuma oba genawa [G]soyala
[Am]Kisidaaka wenwee [Em]noya
[F]Sitimu api sathutin [G]sada'
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
  ARRAY['Sarala Gee', 'Acoustic', 'Kasun'],
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
[A7]ඔබේ ලොවින් මට [Dm]යන්නට

[Verse 2]
[Dm]මගේ හදවත [Gm]ගැහෙන රාවය
[C]ඔබට නෑසෙන [F]තරම් ඈතයි
[Bb]නමුදු සිතුවිලි [Gm]ඔබේ නාමෙන්
[A7]මියෙන තුරා පව[Dm]තී',
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
[A7]Obe lowin mata [Dm]yannata

[Verse 2]
[Dm]Mage hadawatha [Gm]gahena raawaya
[C]Obata naasena [F]tharam aathai
[Bb]Namudu sithuwili [Gm]obe naamen
[A7]Miyena thuraa pawa[Dm]thee'
),
(
  'dawasak-pala-nathi',
  'දවසක් පැල නැති හේනේ',
  'Dawasak Pala Nathi Hene',
  'Gunadasa Kapuge',
  'Am',
  82,
  '4/4',
  'sarala_3_4',
  ARRAY['Classical', 'Acoustic', 'Kapuge'],
  '[Chorus]
[Am]දවසක් පැල නැති හේනේ [G]අකාල මහ වැහි වැටුනා
[F]තුරුලේ හංගාගෙන මා [G]ඔබ තෙමුනා [Am]අම්මේ
[Am]පැල්පත සාදා දුන්නේ [G]අපට සෙවණ සලසන්නයි
[F]කඳුලින් දෙනෙතින් දුටුවේ [G]මගෙ ලොව දිනු[Am]මයි

[Verse 1]
[Am]කුසගින්නේ හඬනා විට [Em]බත් පත මා හට දුන්නේ
[F]ඔබ නොකා හිඳිමින් [G]මට සෙනෙහස දුන්නේ
[Am]අම්මේ ඔබ දෙවියෙක් සේ [Em]මා හද තුළ වැජඹෙන්නේ
[F]මේ භවයේ මතු භවයේ [G]ඔබ මගෙ අම්[Am]මා',
  '[Chorus]
[Am]Dawasak pala nathi hene [G]akaala maha wahi watuna
[F]Thurule hangaagena ma [G]oba themuna [Am]amme
[Am]Palpatha saada dunne [G]apata sewana salasannai
[F]Kandulin denethin dutuwe [G]mage lowa dinu[Am]mai

[Verse 1]
[Am]Kusaginne handana wita [Em]bath patha ma hata dunne
[F]Oba nokaa hindimin [G]mata senehasa dunne
[Am]Amme oba dewiyek se [Em]ma hada thula wajambenne
[F]Me bhawaye mathu bhawaye [G]oba mage am[Am]ma'
)
ON CONFLICT (id) DO UPDATE SET
  title_si = EXCLUDED.title_si,
  title_en = EXCLUDED.title_en,
  artist = EXCLUDED.artist,
  content_chordpro = EXCLUDED.content_chordpro,
  content_singlish = EXCLUDED.content_singlish,
  tags = EXCLUDED.tags;
