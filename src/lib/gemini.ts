/**
 * Gemini Normalization Utility for Sinhala Chords & Lyrics
 * Converts raw chord text / lyrics into structured ChordPro format.
 */

export interface NormalizedSongData {
  title_si: string;
  title_en: string;
  artist: string;
  key: string;
  tempo_bpm: number;
  time_signature: string;
  strum_pattern: 'baila_6_8' | 'calypso_4_4' | 'sarala_3_4' | 'pop_4_4';
  tags: string[];
  content_chordpro: string;
  content_singlish: string;
}

export async function normalizeChordTextWithGemini(rawText: string): Promise<NormalizedSongData> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  const prompt = `
You are an expert music archivist and transcriptionist specializing in Sri Lankan Sinhala music and guitar chords.
Convert the following raw song data into structured ChordPro format.

Respond ONLY with a valid JSON object matching this schema:
{
  "title_si": "Title in Sinhala unicode, e.g. 'දිල්හානි'",
  "title_en": "Title in English/Singlish, e.g. 'Dilhani'",
  "artist": "Artist name, e.g. 'Clarence Wijewardena'",
  "key": "Root key (e.g. C, G, Am, Dm, Em, F, D)",
  "tempo_bpm": 120, // integer between 55 and 160
  "time_signature": "4/4" or "6/8" or "3/4",
  "strum_pattern": "Must be strictly one of: 'baila_6_8', 'pop_4_4', 'sarala_3_4', 'calypso_4_4'",
  "tags": ["Array of 2-4 relevant tags like 'Baila', 'Golden 70s'"],
  "content_chordpro": "Strict ChordPro format with chords inside brackets right before syllable: [G]දිල්හානි දුවේ [C]ඔබේ සිනාවේ...",
  "content_singlish": "Strict ChordPro format with Romanized phonetics: [G]Dilhani duwe [C]obe sinawe..."
}

Rules:
1. Embed chords inline inside square brackets right before the target syllable (e.g. [G]මල් [C]පිපීලා).
2. Do NOT leave floating chords on lines above lyrics.
3. Keep section markers like [Chorus], [Verse 1], [Verse 2], [Interlude].
4. Set strum_pattern strictly to one of:
   - 'baila_6_8': Fast 6/8 baila (Clarence, Moonstones, Golden 70s)
   - 'calypso_4_4': 4/4 syncopated island rhythm
   - 'sarala_3_4': 3/4 waltz / classical Sarala Gee ballads (Kasun Kalhara, Kapuge, Victor)
   - 'pop_4_4': 4/4 pop ballads (Milton Mallawarachchi, HR Jothipala)
5. Ensure content_singlish mirrors content_chordpro line-by-line.

Raw Song Text:
${rawText}
`;

  const models = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash-lite',
  ];
  let lastError: unknown = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(textResponse) as NormalizedSongData;
      return parsed;
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw new Error(`Failed to normalize song with Gemini: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}
