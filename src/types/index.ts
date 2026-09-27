export type StrumPatternId = 'baila_6_8' | 'calypso_4_4' | 'sarala_3_4' | 'pop_4_4';

export interface StrumStroke {
  direction: 'down' | 'up' | 'rest';
  accent?: boolean;
}

export interface StrumPattern {
  id: StrumPatternId;
  name: string;
  nameSi: string;
  timeSignature: string;
  description: string;
  strokes: StrumStroke[];
  defaultBpm: number;
}

export interface Song {
  id: string;
  title_si: string;
  title_en: string;
  artist: string;
  key: string;
  tempo_bpm: number;
  time_signature: string;
  strum_pattern: StrumPatternId;
  content_chordpro: string;
  content_singlish: string;
  tags?: string[];
}

export interface ChordChunk {
  chord?: string;
  lyric: string;
}

export interface ChordLine {
  type: 'lyric' | 'section' | 'empty' | 'comment';
  content?: string; // for section headers like [Chorus] or [Verse 1]
  chunks?: ChordChunk[];
}

export interface JamRoomState {
  roomCode: string;
  isHost: boolean;
  hostId: string;
  currentSongId: string;
  scrollPercent: number;
  connectedCount: number;
  viewMode: 'musician' | 'singer';
}

export interface JamBroadcastPayload {
  type: 'song-change' | 'scroll-sync' | 'mode-change' | 'presence-ping';
  roomCode: string;
  songId?: string;
  scrollPercent?: number;
  senderId: string;
  timestamp: number;
}

export interface SongSubmission {
  id: string;
  title_raw?: string;
  artist_raw?: string;
  raw_content: string;
  title_si?: string;
  title_en?: string;
  artist?: string;
  key?: string;
  tempo_bpm?: number;
  time_signature?: string;
  strum_pattern?: StrumPatternId;
  tags?: string[];
  content_chordpro?: string;
  content_singlish?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by?: string;
  notes?: string;
  created_at: string;
  reviewed_at?: string;
}

