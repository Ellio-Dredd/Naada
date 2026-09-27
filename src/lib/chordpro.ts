import { ChordChunk, ChordLine } from '@/types';

// Chromatic scales for transposition
const SHARP_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_SCALE  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Map note name to pitch index (0 - 11)
const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'B#': 0,
  'C#': 1, 'Db': 1,
  'D': 2,
  'D#': 3, 'Eb': 3,
  'E': 4, 'Fb': 4,
  'F': 5, 'E#': 5,
  'F#': 6, 'Gb': 6,
  'G': 7,
  'G#': 8, 'Ab': 8,
  'A': 9,
  'A#': 10, 'Bb': 10,
  'B': 11, 'Cb': 11,
};

// Common open/friendly guitar chord shapes preferred when using Capo
const EASY_CHORDS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];

export const CHROMATIC_KEYS_MAJOR = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
export const CHROMATIC_KEYS_MINOR = ['Am', 'Bbm', 'Bm', 'Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m'];

/**
 * Calculates semitone distance from original key to target key (-6 to +5)
 */
export function calculateSemitonesToKey(originalKey: string, targetKey: string): number {
  const getRoot = (k: string) => {
    const m = k.match(/^[A-G][#b]?/);
    return m ? m[0] : k;
  };
  const fromIndex = NOTE_TO_INDEX[getRoot(originalKey)];
  const toIndex = NOTE_TO_INDEX[getRoot(targetKey)];
  if (fromIndex === undefined || toIndex === undefined) return 0;

  let diff = toIndex - fromIndex;
  while (diff > 6) diff -= 12;
  while (diff < -6) diff += 12;
  return diff;
}

/**
 * Returns diatonic family chords for the given scale key
 */
export function getDiatonicChordsForScale(scaleKey: string): { degree: string; chord: string }[] {
  const isMinor = scaleKey.includes('m') && !scaleKey.includes('maj');
  const rootMatch = scaleKey.match(/^[A-G][#b]?/);
  const root = rootMatch ? rootMatch[0] : scaleKey;

  if (isMinor) {
    // Natural minor scale intervals: 0 (i), 2 (ii°), 3 (III), 5 (iv), 7 (v), 8 (VI), 10 (VII)
    return [
      { degree: 'i', chord: `${transposeChord(root, 0)}m` },
      { degree: 'ii°', chord: `${transposeChord(root, 2)}dim` },
      { degree: 'III', chord: transposeChord(root, 3) },
      { degree: 'iv', chord: `${transposeChord(root, 5)}m` },
      { degree: 'v', chord: `${transposeChord(root, 7)}m` },
      { degree: 'VI', chord: transposeChord(root, 8) },
      { degree: 'VII', chord: transposeChord(root, 10) },
    ];
  } else {
    // Major scale intervals: 0 (I), 2 (ii), 4 (iii), 5 (IV), 7 (V), 9 (vi), 11 (vii°)
    return [
      { degree: 'I', chord: transposeChord(root, 0) },
      { degree: 'ii', chord: `${transposeChord(root, 2)}m` },
      { degree: 'iii', chord: `${transposeChord(root, 4)}m` },
      { degree: 'IV', chord: transposeChord(root, 5) },
      { degree: 'V', chord: transposeChord(root, 7) },
      { degree: 'vi', chord: `${transposeChord(root, 9)}m` },
      { degree: 'vii°', chord: `${transposeChord(root, 11)}dim` },
    ];
  }
}

/**
 * Transpose a single chord symbol by `semitones` offset (-11 to +11)
 */
export function transposeChord(chord: string, semitones: number): string {
  if (!chord || semitones === 0) return chord;

  // Regex to extract root note (with optional # or b) and any slash chord root
  const chordRegex = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/;
  const match = chord.trim().match(chordRegex);

  if (!match) return chord;

  const [, root, quality, bassRoot] = match;

  const transposeNote = (note: string): string => {
    const currentIndex = NOTE_TO_INDEX[note];
    if (currentIndex === undefined) return note;

    let targetIndex = (currentIndex + semitones) % 12;
    if (targetIndex < 0) targetIndex += 12;

    // Use flat representation if original used flat or if natural flat key
    const prefersFlat = note.includes('b') || ['F', 'Bb', 'Eb', 'Ab'].includes(note);
    return prefersFlat ? FLAT_SCALE[targetIndex] : SHARP_SCALE[targetIndex];
  };

  const newRoot = transposeNote(root);
  const newBass = bassRoot ? `/${transposeNote(bassRoot)}` : '';

  return `${newRoot}${quality || ''}${newBass}`;
}

/**
 * Parse a ChordPro string into lines and unbreakable chunks
 * E.g., "[G]ගමෙන් ලියුමක් [C]ඇවිල්ලා"
 */
export function parseChordPro(chordProContent: string, semitones: number = 0): ChordLine[] {
  if (!chordProContent) return [];

  const rawLines = chordProContent.split(/\r?\n/);
  const parsedLines: ChordLine[] = [];

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();

    // Check for section markers like [Chorus], [Verse 1], {c: Bridge}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1).replace(/^c:\s*|^comment:\s*/i, '');
      parsedLines.push({ type: 'section', content: inner });
      continue;
    }

    if (
      (trimmed.startsWith('[Chorus') ||
        trimmed.startsWith('[Verse') ||
        trimmed.startsWith('[Intro') ||
        trimmed.startsWith('[Outro') ||
        trimmed.startsWith('[Bridge') ||
        trimmed.startsWith('[Inter')) &&
      trimmed.endsWith(']')
    ) {
      parsedLines.push({ type: 'section', content: trimmed.slice(1, -1) });
      continue;
    }

    if (!trimmed) {
      parsedLines.push({ type: 'empty' });
      continue;
    }

    // Parse inline chords and lyrics
    // Tokens: [Chord] or text
    const chunks: ChordChunk[] = [];
    const regex = /\[([A-Za-z0-9#b/+-]+)\]/g;
    let lastIndex = 0;
    let currentChord: string | undefined = undefined;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(rawLine)) !== null) {
      const matchIndex = match.index;
      // Lyric preceding this chord
      if (matchIndex > lastIndex) {
        const textSegment = rawLine.substring(lastIndex, matchIndex);
        chunks.push({
          chord: currentChord ? transposeChord(currentChord, semitones) : undefined,
          lyric: textSegment,
        });
        currentChord = undefined;
      }

      currentChord = match[1];
      lastIndex = regex.lastIndex;
    }

    // Remaining text after last chord
    if (lastIndex < rawLine.length || currentChord) {
      const remainingText = rawLine.substring(lastIndex);
      chunks.push({
        chord: currentChord ? transposeChord(currentChord, semitones) : undefined,
        lyric: remainingText || ' ', // space placeholder so chord stands above
      });
    }

    parsedLines.push({
      type: 'lyric',
      chunks: chunks.length > 0 ? chunks : [{ lyric: rawLine }],
    });
  }

  return parsedLines;
}

/**
 * Intelligent Capo Advisor
 * Returns recommendation string based on key and semitone shift
 * e.g., "Song in Eb: Capo 1st fret to play easy D shapes"
 */
export function getCapoAdvice(songKey: string, semitones: number = 0): {
  capoFret: number;
  playKey: string;
  advice: string;
} {
  const currentKey = transposeChord(songKey, semitones);
  const rootMatch = currentKey.match(/^[A-G][#b]?/);
  const currentRoot = rootMatch ? rootMatch[0] : currentKey;
  const isMinor = currentKey.includes('m') && !currentKey.includes('maj');

  // Try capos 1 through 7 and see if the transposed down key is an "easy" chord
  const easyShapes = isMinor ? ['Am', 'Em', 'Dm'] : ['C', 'G', 'D', 'A', 'E'];

  for (let fret = 1; fret <= 5; fret++) {
    // If capo is on fret F, the finger shape played is transposed down by F semitones
    const shape = transposeChord(currentKey, -fret);
    if (easyShapes.includes(shape)) {
      return {
        capoFret: fret,
        playKey: shape,
        advice: `Capo on fret ${fret} to play in ${shape} open shapes`,
      };
    }
  }

  return {
    capoFret: 0,
    playKey: currentKey,
    advice: `Standard tuning: play in ${currentKey} (no capo)`,
  };
}

/**
 * Guitar Chord Fingerings for Interactive Diagram Popup
 * [string 6 to 1: fret numbers, -1 for mute, 0 for open]
 */
export const GUITAR_CHORD_LIBRARY: Record<string, { frets: number[]; fingers?: number[]; baseFret?: number }> = {
  'C': { frets: [-1, 3, 2, 0, 1, 0] },
  'C#': { frets: [-1, 4, 3, 1, 2, 1], baseFret: 1 },
  'Db': { frets: [-1, 4, 3, 1, 2, 1], baseFret: 1 },
  'D': { frets: [-1, -1, 0, 2, 3, 2] },
  'D#': { frets: [-1, -1, 1, 3, 4, 3], baseFret: 1 },
  'Eb': { frets: [-1, -1, 1, 3, 4, 3], baseFret: 1 },
  'E': { frets: [0, 2, 2, 1, 0, 0] },
  'F': { frets: [1, 3, 3, 2, 1, 1], baseFret: 1 },
  'F#': { frets: [2, 4, 4, 3, 2, 2], baseFret: 2 },
  'Gb': { frets: [2, 4, 4, 3, 2, 2], baseFret: 2 },
  'G': { frets: [3, 2, 0, 0, 0, 3] },
  'G#': { frets: [4, 6, 6, 5, 4, 4], baseFret: 4 },
  'Ab': { frets: [4, 6, 6, 5, 4, 4], baseFret: 4 },
  'A': { frets: [-1, 0, 2, 2, 2, 0] },
  'A#': { frets: [-1, 1, 3, 3, 3, 1], baseFret: 1 },
  'Bb': { frets: [-1, 1, 3, 3, 3, 1], baseFret: 1 },
  'B': { frets: [-1, 2, 4, 4, 4, 2], baseFret: 2 },
  // Minors
  'Am': { frets: [-1, 0, 2, 2, 1, 0] },
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], baseFret: 2 },
  'Cm': { frets: [-1, 3, 5, 5, 4, 3], baseFret: 3 },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1] },
  'Em': { frets: [0, 2, 2, 0, 0, 0] },
  'Fm': { frets: [1, 3, 3, 1, 1, 1], baseFret: 1 },
  'F#m': { frets: [2, 4, 4, 2, 2, 2], baseFret: 2 },
  'Gm': { frets: [3, 5, 5, 3, 3, 3], baseFret: 3 },
  // 7ths
  'C7': { frets: [-1, 3, 2, 3, 1, 0] },
  'D7': { frets: [-1, -1, 0, 2, 1, 2] },
  'E7': { frets: [0, 2, 0, 1, 0, 0] },
  'G7': { frets: [3, 2, 0, 0, 0, 1] },
  'A7': { frets: [-1, 0, 2, 0, 2, 0] },
  'B7': { frets: [-1, 2, 1, 2, 0, 2] },
};
