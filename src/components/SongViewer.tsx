'use client';

import React, { useMemo, useState } from 'react';
import { Song } from '@/types';
import { parseChordPro, getCapoAdvice, transposeChord } from '@/lib/chordpro';
import { ChordDiagramModal } from '@/components/ChordDiagramModal';
import { MiniChordTooltip } from '@/components/MiniChordTooltip';
import { Sparkles, ArrowLeft, Mic2, Music2, Minus, Plus } from 'lucide-react';

interface SongViewerProps {
  song: Song;
  semitones: number;
  useSinglish: boolean;
  viewMode: 'musician' | 'singer';
  fontScale?: number;
  onTranspose?: (delta: number) => void;
  onToggleSinglish?: () => void;
  onToggleViewMode?: () => void;
  onBackToCatalog?: () => void;
}

export function SongViewer({
  song,
  semitones,
  useSinglish,
  viewMode,
  fontScale = 1,
  onTranspose,
  onToggleSinglish,
  onToggleViewMode,
  onBackToCatalog,
}: SongViewerProps) {
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  // Content selection: Sinhala Unicode or Romanized Singlish
  const rawContent = useSinglish ? song.content_singlish : song.content_chordpro;

  // Parsed structured lines with transposed chords
  const parsedLines = useMemo(() => {
    return parseChordPro(rawContent, semitones);
  }, [rawContent, semitones]);

  // Capo advice based on original key and semitones
  const capoAdvice = useMemo(() => {
    return getCapoAdvice(song.key, semitones);
  }, [song.key, semitones]);

  const currentKey = transposeChord(song.key, semitones);

  // Dynamic font sizing multiplier
  const chordFontSize = `${Math.round(12.5 * fontScale)}px`;
  const lyricFontSize = `${Math.round(15 * fontScale)}px`;
  const singerLyricFontSize = `${Math.round(20 * fontScale)}px`;

  return (
    <article className="w-full max-w-3xl mx-auto px-2 sm:px-6 pt-2 pb-44 animate-fade-in">
      {/* Clean, Non-Technical Header */}
      <header className="mb-8 pb-6 border-b border-purple-100">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {onBackToCatalog && (
            <button
              type="button"
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 active:scale-95 text-purple-700 text-xs font-semibold transition-all shadow-2xs group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>All Songs (500+)</span>
            </button>
          )}

          {/* View Mode & Language Toggles */}
          <div className="flex items-center gap-2 ml-auto">
            {onToggleSinglish && (
              <button
                type="button"
                onClick={onToggleSinglish}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  useSinglish
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : 'bg-white hover:bg-purple-50 text-slate-700 border-purple-200'
                }`}
              >
                {useSinglish ? 'English Lyrics' : 'සිංහල පද'}
              </button>
            )}

            {onToggleViewMode && (
              <button
                type="button"
                onClick={onToggleViewMode}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  viewMode === 'singer'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : 'bg-white hover:bg-purple-50 text-slate-700 border-purple-200'
                }`}
              >
                {viewMode === 'singer' ? (
                  <>
                    <Mic2 className="w-3 h-3" />
                    <span>Singer Mode</span>
                  </>
                ) : (
                  <>
                    <Music2 className="w-3 h-3" />
                    <span>Chords &amp; Lyrics</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Title & Artist */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight font-sinhala">
            <span key={`title-${song.id}-${useSinglish}`} className="animate-lang-fade">
              {useSinglish ? song.title_en : song.title_si}
            </span>
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
            <span className="text-base sm:text-lg text-slate-600 font-medium">
              {song.artist}
            </span>
            <span className="text-xs text-purple-600/70 font-mono">
              / {useSinglish ? song.title_si : song.title_en}
            </span>
          </div>
        </div>

        {/* Key, Tempo & Capo Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <div className="inline-flex items-center bg-purple-50/80 border border-purple-200/80 rounded-xl px-2.5 py-1 text-xs font-medium text-slate-700">
            <span className="text-slate-500 mr-1.5">Key:</span>
            <strong className="text-purple-700 font-bold font-mono mr-2">{currentKey}</strong>
            {onTranspose && (
              <div className="flex items-center gap-1 border-l border-purple-200 pl-2">
                <button
                  type="button"
                  onClick={() => onTranspose(-1)}
                  className="w-5 h-5 flex items-center justify-center rounded-md bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors"
                  title="Down 1 semitone"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onTranspose(1)}
                  className="w-5 h-5 flex items-center justify-center rounded-md bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 transition-colors"
                  title="Up 1 semitone"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <span className="inline-flex items-center bg-white border border-purple-100 rounded-xl px-2.5 py-1 text-xs text-slate-600 font-medium shadow-2xs">
            Tempo: <strong className="ml-1 text-slate-800 font-mono">{song.tempo_bpm} BPM</strong>
          </span>

          {capoAdvice.capoFret > 0 && viewMode === 'musician' && (
            <span className="inline-flex items-center gap-1.5 bg-purple-100/70 border border-purple-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-purple-900 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Capo Fret {capoAdvice.capoFret} ({capoAdvice.playKey} shapes)</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Chord Manuscript Sheet */}
      <div
        key={`lyrics-${song.id}-${useSinglish}`}
        className={`animate-fade-in transition-all duration-300 ${
          viewMode === 'singer' ? 'text-center space-y-7' : 'space-y-3.5'
        }`}
      >
        {parsedLines.map((line, lineIndex) => {
          if (line.type === 'section') {
            return (
              <div key={`sec-${lineIndex}`} className="pt-4 pb-1 flex items-center gap-3">
                <span className="font-mono text-xs font-bold tracking-wider uppercase text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 flex-shrink-0">
                  {line.content}
                </span>
                <div className="h-px bg-purple-100 flex-1" />
              </div>
            );
          }

          if (line.type === 'empty') {
            return <div key={`empty-${lineIndex}`} className="h-2" />;
          }

          if (viewMode === 'singer') {
            const fullLyric = line.chunks?.map((c) => c.lyric).join('') || '';
            return (
              <p
                key={`singer-${lineIndex}`}
                style={{ fontSize: singerLyricFontSize }}
                className={`font-medium text-slate-800 leading-normal font-sinhala ${useSinglish ? 'font-sans' : ''}`}
              >
                {fullLyric}
              </p>
            );
          }

          return (
            <div key={`musician-${lineIndex}`} className="flex flex-wrap items-end gap-x-0 leading-none">
              {line.chunks?.map((chunk, chunkIndex) => (
                <div key={`chunk-${lineIndex}-${chunkIndex}`} className="flex flex-col flex-shrink-0 min-w-0">
                  <div className="h-5 flex items-end mb-0.5 relative group/chord">
                    {chunk.chord ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedChord(chunk.chord || null)}
                          style={{ fontSize: chordFontSize }}
                          className="font-mono font-bold text-purple-700 bg-purple-50 hover:bg-purple-600 hover:text-white px-1.5 py-0 rounded transition-all cursor-pointer shadow-2xs border border-purple-100 hover:border-purple-600 hover:scale-105 leading-tight"
                          title={`Click for full ${chunk.chord} diagram`}
                        >
                          {chunk.chord}
                        </button>
                        <MiniChordTooltip chord={chunk.chord} />
                      </>
                    ) : (
                      <span className="opacity-0 select-none text-[11px]">&nbsp;</span>
                    )}
                  </div>
                  <div
                    style={{ fontSize: lyricFontSize }}
                    className={`font-normal text-slate-800 leading-snug font-sinhala whitespace-pre select-text transition-colors ${useSinglish ? 'font-sans' : ''}`}
                  >
                    {chunk.lyric}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {selectedChord && (
        <ChordDiagramModal chord={selectedChord} onClose={() => setSelectedChord(null)} />
      )}
    </article>
  );
}
