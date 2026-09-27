'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Song } from '@/types';
import { Search, Music, Play, Sparkles, ChevronLeft, ChevronRight, X, ArrowUpDown } from 'lucide-react';
import { getCapoAdvice } from '@/lib/chordpro';
import { CatalogSkeleton } from '@/components/CatalogSkeleton';

interface CatalogSectionProps {
  songs: Song[];
  currentSongId: string;
  onSelectSong: (songId: string) => void;
  initialSearchQuery?: string;
  onClearInitialSearch?: () => void;
  isLoading?: boolean;
  useSinglish?: boolean;
}

const PAGE_SIZE = 18;

const ALPHABET_LIST = ['All', 'A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'V', 'W', 'Y'];

export function CatalogSection({
  songs,
  currentSongId,
  onSelectSong,
  initialSearchQuery = '',
  onClearInitialSearch,
  isLoading = false,
  useSinglish = false,
}: CatalogSectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'tempo'>('title');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync external search query from hero if provided
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
      setCurrentPage(1);
    }
  }, [initialSearchQuery]);

  // Reset to page 1 whenever search, filter, or letter changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    if (onClearInitialSearch && !val) {
      onClearInitialSearch();
    }
  };

  const handleFilterChange = (catId: string) => {
    setSelectedFilter(catId);
    setCurrentPage(1);
  };

  const handleLetterChange = (letter: string) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  // Category filter tabs
  const categories = [
    { id: 'all', label: 'All Songs (සියල්ල)' },
    { id: 'baila_6_8', label: 'Baila (බයිලා)' },
    { id: 'pop_4_4', label: 'Pop & 70s' },
    { id: 'sarala_3_4', label: 'Sarala Gee (සරල ගී)' },
  ];

  // 1. Filtered songs based on search, category, and letter
  const filteredSongs = useMemo(() => {
    return songs.filter((s) => {
      // Category filter
      if (selectedFilter !== 'all' && s.strum_pattern !== selectedFilter) {
        return false;
      }

      // Alphabet filter (checks first letter of English title or artist)
      if (selectedLetter !== 'All') {
        const titleFirst = (s.title_en || '').trim().charAt(0).toUpperCase();
        const artistFirst = (s.artist || '').trim().charAt(0).toUpperCase();
        if (titleFirst !== selectedLetter && artistFirst !== selectedLetter) {
          return false;
        }
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          s.title_si.toLowerCase().includes(q) ||
          s.title_en.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.key.toLowerCase().includes(q) ||
          s.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [songs, selectedFilter, selectedLetter, searchQuery]);

  // 2. Sorted songs
  const sortedSongs = useMemo(() => {
    const list = [...filteredSongs];
    if (sortBy === 'title') {
      return list.sort((a, b) => a.title_en.localeCompare(b.title_en));
    }
    if (sortBy === 'artist') {
      return list.sort((a, b) => a.artist.localeCompare(b.artist));
    }
    if (sortBy === 'tempo') {
      return list.sort((a, b) => b.tempo_bpm - a.tempo_bpm);
    }
    return list;
  }, [filteredSongs, sortBy]);

  // 3. Paginated slice for smooth 60fps rendering of 500+ songs
  const totalPages = Math.max(1, Math.ceil(sortedSongs.length / PAGE_SIZE));
  const paginatedSongs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedSongs.slice(start, start + PAGE_SIZE);
  }, [sortedSongs, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, sortedSongs.length);

  return (
    <section id="catalog-section" className="py-12 px-4 max-w-6xl mx-auto w-full scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-widest">
              Song Directory
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Sinhala Song Catalog{' '}
            <span className="text-purple-600 font-sinhala font-bold lang-switch-content">
              {useSinglish ? 'Song Collection' : 'ගීත එකතුව'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tap any song to view chords with instant key transpose and smart auto-scrolling.
          </p>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* Live Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search title, artist, key..."
              className="w-full pl-9 pr-8 py-2 rounded-full text-xs bg-white border border-purple-200 focus:border-purple-600 outline-none text-slate-800 placeholder-slate-400 shadow-2xs transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-purple-200 rounded-full px-3 py-1.5 text-xs text-slate-600 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="title">Title (A-Z)</option>
              <option value="artist">Artist</option>
              <option value="tempo">Tempo (Fastest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-3">
        {categories.map((cat) => {
          const isActive = selectedFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleFilterChange(cat.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white hover:bg-purple-50 text-slate-600 border border-purple-200/80 shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Alphabet Quick Jump Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-6 scrollbar-none text-[11px] font-mono font-medium">
        <span className="text-slate-400 uppercase text-[10px] mr-1 flex-shrink-0">Jump:</span>
        {ALPHABET_LIST.map((letter) => {
          const isSelected = selectedLetter === letter;
          return (
            <button
              key={letter}
              onClick={() => handleLetterChange(letter)}
              className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-purple-700 hover:bg-purple-100/60'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{sortedSongs.length > 0 ? startIndex : 0}–{endIndex}</strong> of{' '}
          <strong className="text-purple-700 font-semibold">{sortedSongs.length}</strong> songs
          {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
        </span>
        {totalPages > 1 && (
          <span className="font-mono text-[11px]">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <CatalogSkeleton count={12} />
      ) : sortedSongs.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-purple-50/40 rounded-3xl border border-purple-100 animate-fade-in">
          <Music className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No songs found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try searching with different keywords or clear your filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
              setSelectedLetter('All');
            }}
            className="mt-4 px-4 py-2 rounded-full bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-2xs transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* 500+ Responsive Song Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedSongs.map((song) => {
            const isActive = song.id === currentSongId;
            const capoAdvice = getCapoAdvice(song.key, 0);

            return (
              <div
                key={song.id}
                onClick={() => onSelectSong(song.id)}
                className={`group p-4 rounded-2xl border transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-md active:scale-[0.985] ${
                  isActive
                    ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-200 shadow-xs'
                    : 'bg-white hover:bg-purple-50/40 border-purple-100/90 hover:border-purple-200 shadow-2xs'
                }`}
              >
                <div>
                  {/* Top Row: Key & Tempo */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 transition-colors group-hover:bg-purple-200">
                      Key {song.key}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {song.tempo_bpm} BPM
                    </span>
                  </div>

                  {/* Song Title */}
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-900 transition-colors font-sinhala leading-snug lang-switch-content">
                    {useSinglish ? song.title_en : song.title_si}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                    <span className="lang-switch-content">{song.artist}{' '}
                      <span className="text-slate-400 font-mono text-[11px]">
                        • {useSinglish ? song.title_si : song.title_en}
                      </span>
                    </span>
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 mt-3 border-t border-purple-50 flex items-center justify-between text-xs">
                  {capoAdvice.capoFret > 0 ? (
                    <span className="text-[11px] text-purple-600 font-medium truncate">
                      Capo {capoAdvice.capoFret}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">No Capo</span>
                  )}

                  <div className="flex items-center gap-1 font-semibold text-purple-700 group-hover:text-purple-900 transition-colors">
                    <span>{isActive ? 'Active' : 'Play'}</span>
                    <Play className={`w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 ${isActive ? 'fill-current' : ''}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-purple-100">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="text-slate-400 text-xs px-1">...</span>}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-purple-50 border border-purple-100'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
}
