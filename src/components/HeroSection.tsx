'use client';

import React from 'react';
import { Search, Radio, Music, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onSearchInput: (query: string) => void;
  onSelectCategory?: (category: string) => void;
  onOpenPaduru: () => void;
  onScrollToCatalog: () => void;
  activeSongTitle?: string;
  onOpenActiveSong?: () => void;
  useSinglish?: boolean;
}

export function HeroSection({
  onSearchInput,
  onOpenPaduru,
  onScrollToCatalog,
  activeSongTitle,
  onOpenActiveSong,
  useSinglish = false,
}: HeroSectionProps) {
  return (
    <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-16 text-center px-4 overflow-hidden">
      {/* Soft background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-purple-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Simple Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-medium shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>500+ Sinhala Guitar Chords &amp; Lyrics</span>
        </div>

        {/* Clean Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-tight">
          {useSinglish ? 'Search. Strum.' : 'සොයන්න. වයන්න.'}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-violet-600 font-sinhala">
            {useSinglish ? 'Sing.' : 'ගයන්න.'}
          </span>
        </h1>

        {/* Short Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          Clean guitar chords, lyrics in Sinhala and Singlish, smart mic auto-scrolling, and real-time Paduru Jam rooms for your sing-alongs.
        </p>

        {/* Prominent Search Bar */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-purple-600 absolute left-4 pointer-events-none" />
            <input
              type="text"
              onChange={(e) => {
                onSearchInput(e.target.value);
                onScrollToCatalog();
              }}
              placeholder="Search 500+ songs, artists, or lyrics (e.g. Clarence, Baila, G Major)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full text-sm bg-white border border-purple-200/90 shadow-sm focus:border-purple-600 focus:ring-4 focus:ring-purple-100 outline-none text-slate-800 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <button
            type="button"
            onClick={onScrollToCatalog}
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Music className="w-3.5 h-3.5" />
            <span>Browse 500+ Songs</span>
          </button>

          {activeSongTitle && onOpenActiveSong && (
            <button
              type="button"
              onClick={onOpenActiveSong}
              className="px-4 py-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Now Playing: {activeSongTitle}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPaduru}
            className="px-4 py-2 rounded-full bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-purple-600" />
            <span>Paduru Jam Room</span>
          </button>
        </div>
      </div>
    </section>
  );
}
