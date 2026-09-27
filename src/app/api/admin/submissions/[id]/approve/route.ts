import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id;
    const body = await req.json();

    const {
      title_si,
      title_en,
      artist,
      key,
      tempo_bpm,
      time_signature,
      strum_pattern,
      tags,
      content_chordpro,
      content_singlish,
    } = body;

    if (!title_en || !artist || !content_chordpro) {
      return NextResponse.json(
        { error: 'title_en, artist, and content_chordpro are required to publish a song.' },
        { status: 400 }
      );
    }

    const songId = generateSlug(title_en) || `song-${Date.now()}`;
    const supabase = getAdminSupabaseClient();

    // 1. Upsert into public.songs
    const songRecord = {
      id: songId,
      title_si: title_si || title_en,
      title_en,
      artist,
      key: key || 'C',
      tempo_bpm: Number(tempo_bpm) || 90,
      time_signature: time_signature || '4/4',
      strum_pattern: strum_pattern || 'pop_4_4',
      tags: Array.isArray(tags) ? tags : ['Classics'],
      content_chordpro,
      content_singlish: content_singlish || content_chordpro,
    };

    const { error: songError } = await supabase
      .from('songs')
      .upsert(songRecord);

    if (songError) {
      console.error('Failed to upsert into songs:', songError);
      return NextResponse.json({ error: songError.message }, { status: 500 });
    }

    // 2. Mark submission as approved
    const { error: submissionError } = await supabase
      .from('song_submissions')
      .update({
        status: 'approved',
        title_si: songRecord.title_si,
        title_en: songRecord.title_en,
        artist: songRecord.artist,
        key: songRecord.key,
        tempo_bpm: songRecord.tempo_bpm,
        time_signature: songRecord.time_signature,
        strum_pattern: songRecord.strum_pattern,
        tags: songRecord.tags,
        content_chordpro: songRecord.content_chordpro,
        content_singlish: songRecord.content_singlish,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (submissionError) {
      console.warn('Submission status update warning:', submissionError);
    }

    return NextResponse.json({
      success: true,
      songId,
      message: `Song '${title_en}' published successfully to public.songs!`,
    });
  } catch (err) {
    console.error('Approve error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
