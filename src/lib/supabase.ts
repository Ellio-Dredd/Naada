import { createClient } from '@supabase/supabase-js';
import { Song, SongSubmission } from '@/types';
import { SEED_SONGS } from '@/data/songs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkvgmdzqzcavubksubpc.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_sh9Kv6-9rlFLqifxQuGAfw__5ElQNrg';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Server/admin client with service role capabilities
 */
export function getAdminSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Fetch songs from live Supabase database with optimistic fallback to local seed data
 */
export async function fetchSongsFromSupabase(): Promise<Song[]> {
  if (!supabase) {
    return SEED_SONGS;
  }

  try {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('title_en', { ascending: true });

    if (error || !data || data.length === 0) {
      return SEED_SONGS;
    }

    return data as Song[];
  } catch {
    return SEED_SONGS;
  }
}

/**
 * Fetch song submissions for admin review
 */
export async function fetchSongSubmissions(status?: string): Promise<SongSubmission[]> {
  if (!supabase) return [];

  let query = supabase
    .from('song_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching song submissions:', error);
    return [];
  }

  return (data || []) as SongSubmission[];
}
