import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase';
import { normalizeChordTextWithGemini, NormalizedSongData } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { raw_content, title_raw, artist_raw, submitted_by, notes } = body;

    if (!raw_content || typeof raw_content !== 'string' || !raw_content.trim()) {
      return NextResponse.json(
        { error: 'Song lyrics/chords content is required' },
        { status: 400 }
      );
    }

    let aiData: NormalizedSongData | null = null;
    let aiError: string | null = null;

    // Attempt automated AI drafting if GEMINI_API_KEY is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const payloadToNormalize = `Title: ${title_raw || ''}\nArtist: ${artist_raw || ''}\n\n${raw_content}`;
        aiData = await normalizeChordTextWithGemini(payloadToNormalize);
      } catch (err) {
        aiError = err instanceof Error ? err.message : String(err);
        console.warn('AI drafting during submission skipped:', aiError);
      }
    }

    const supabase = getAdminSupabaseClient();

    const submissionPayload = {
      title_raw: title_raw || null,
      artist_raw: artist_raw || null,
      raw_content: raw_content.trim(),
      title_si: aiData?.title_si || title_raw || null,
      title_en: aiData?.title_en || title_raw || null,
      artist: aiData?.artist || artist_raw || null,
      key: aiData?.key || 'C',
      tempo_bpm: aiData?.tempo_bpm || 90,
      time_signature: aiData?.time_signature || '4/4',
      strum_pattern: aiData?.strum_pattern || 'pop_4_4',
      tags: aiData?.tags || ['Community'],
      content_chordpro: aiData?.content_chordpro || null,
      content_singlish: aiData?.content_singlish || null,
      status: 'pending',
      submitted_by: submitted_by || 'Anonymous Contributor',
      notes: notes || null,
    };

    const { data, error } = await supabase
      .from('song_submissions')
      .insert(submissionPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase submission insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      submission: data,
      aiDrafted: Boolean(aiData),
    });
  } catch (err) {
    console.error('Submission error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
