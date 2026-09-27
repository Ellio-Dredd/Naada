'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Song } from '@/types';
import { Search, X, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  onSelectSong: (songId: string) => void;
  currentSongId: string;
}

export function SearchModal({
  isOpen,
  onClose,
  songs,
  onSelectSong,
  currentSongId,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSongs = songs.filter((s) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      s.title_si.toLowerCase().includes(q) ||
      s.title_en.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.key.toLowerCase().includes(q) ||
      s.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/30 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl shadow-2xl bg-white border border-purple-100 overflow-hidden flex flex-col max-h-[80vh] shadow-purple-900/10">
        {/* Command Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-purple-100 gap-3">
          <Search className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type song title, artist, key (e.g. Clarence, Baila, Dm)..."
            className="w-full text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none font-sans"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-purple-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-purple-50">
          {filteredSongs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              No matching songs found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredSongs.slice(0, 30).map((song) => {
              const isSelected = song.id === currentSongId;
              return (
                <button
                  key={song.id}
                  onClick={() => {
                    onSelectSong(song.id);
                    onClose();
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-purple-50/60 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {song.key}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm font-sinhala truncate">
                          {song.title_si}
                        </span>
                        <span className={`text-xs truncate ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                          ({song.title_en})
                        </span>
                      </div>
                      <div className={`flex items-center gap-3 text-[11px] mt-0.5 font-mono ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                        <span>{song.artist}</span>
                        <span>•</span>
                        <span>{song.time_signature}</span>
                        <span>•</span>
                        <span>{song.tempo_bpm} BPM</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 flex-shrink-0 ${
                      isSelected ? 'text-white' : 'text-purple-300'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
