import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase';
import { normalizeChordTextWithGemini } from '@/lib/gemini';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;
    const supabase = getAdminSupabaseClient();

    // Fetch submission
    const { data: submission, error: fetchErr } = await supabase
      .from('song_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchErr || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 400 }
      );
    }

    const payloadToNormalize = `Title: ${submission.title_raw || submission.title_en || ''}\nArtist: ${submission.artist_raw || submission.artist || ''}\n\n${submission.raw_content}`;
    const aiData = await normalizeChordTextWithGemini(payloadToNormalize);

    // Save drafted AI data into submission
    const { data: updated, error: updateErr } = await supabase
      .from('song_submissions')
      .update({
        title_si: aiData.title_si,
        title_en: aiData.title_en,
        artist: aiData.artist,
        key: aiData.key,
        tempo_bpm: aiData.tempo_bpm,
        time_signature: aiData.time_signature,
        strum_pattern: aiData.strum_pattern,
        tags: aiData.tags,
        content_chordpro: aiData.content_chordpro,
        content_singlish: aiData.content_singlish,
      })
      .eq('id', submissionId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
