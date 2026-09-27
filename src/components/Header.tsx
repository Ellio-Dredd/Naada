'use client';

import React, { useState } from 'react';
import { Search, Radio, Users, Menu, X, Music, Sparkles, Globe } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/UserMenu';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenPaduru: () => void;
  onOpenSubmit?: () => void;
  onOpenAuth: () => void;
  onScrollToCatalog: () => void;
  onScrollToSheet: () => void;
  roomCode: string | null;
  connectedCount: number;
  activeTab?: 'catalog' | 'sheet';
  activeSongTitle?: string;
  useSinglish?: boolean;
  onToggleSinglish?: () => void;
}

export function Header({
  onOpenSearch,
  onOpenPaduru,
  onOpenSubmit,
  onOpenAuth,
  onScrollToCatalog,
  onScrollToSheet,
  roomCode,
  connectedCount,
  activeTab = 'catalog',
  activeSongTitle,
  useSinglish = false,
  onToggleSinglish,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/90 border-b border-purple-100/90 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Mark & Typography */}
        <div
          onClick={onScrollToCatalog}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <Logo size={34} />
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-purple-950 transition-colors">
              Naada
            </span>
            <span className="text-sm font-bold text-purple-600 font-sinhala tracking-normal">
              නාද
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-600">

          <button
            onClick={onScrollToSheet}
            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'sheet'
                ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                : 'hover:text-purple-700'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-purple-600" />
            <span>{activeSongTitle ? `Sheet: ${activeSongTitle}` : 'Chord Sheet'}</span>
          </button>
          <button
            onClick={onOpenPaduru}
            className="hover:text-purple-700 transition-colors flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-purple-600" />
            <span>Paduru Room</span>
          </button>
        </nav>

        {/* Center/Right: Quick Search Command Bar (Cmd+K) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex-1 max-w-xs hidden sm:flex items-center justify-between px-3.5 py-1.5 rounded-full bg-purple-50/50 hover:bg-purple-50 border border-purple-100/80 hover:border-purple-200 text-slate-500 text-xs transition-all shadow-2xs group"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-slate-500 truncate">Search songs, artists...</span>
          </span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold text-purple-700 bg-white border border-purple-100 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
            aria-label="Search songs"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Language Switcher — Sliding Pill */}
          {onToggleSinglish && (
            <div
              className="hidden sm:flex relative p-0.5 rounded-full bg-purple-100/60 border border-purple-200/80 shadow-inner"
              title={`Switch language (Current: ${useSinglish ? 'English' : 'Sinhala / සිංහල'})`}
            >
              {/* Sliding background indicator */}
              <span
                aria-hidden
                className={`absolute top-0.5 bottom-0.5 rounded-full bg-purple-600 shadow-md transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  useSinglish ? 'left-1/2 right-0.5' : 'left-0.5 right-1/2'
                }`}
              />
              <button
                type="button"
                onClick={onToggleSinglish}
                className={`relative z-10 px-3 py-1 text-[11px] font-semibold rounded-full transition-colors duration-200 select-none ${
                  !useSinglish ? 'text-white font-sinhala font-bold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                සිංහල
              </button>
              <button
                type="button"
                onClick={onToggleSinglish}
                className={`relative z-10 px-3 py-1 text-[11px] font-semibold rounded-full transition-colors duration-200 select-none ${
                  useSinglish ? 'text-white font-bold' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                English
              </button>
            </div>
          )}

          {/* Mobile Compact Language Toggle — Sliding Pill */}
          {onToggleSinglish && (
            <div className="sm:hidden relative flex p-0.5 rounded-full bg-purple-100/60 border border-purple-200/80 shadow-inner">
              <span
                aria-hidden
                className={`absolute top-0.5 bottom-0.5 rounded-full bg-purple-600 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  useSinglish ? 'left-1/2 right-0.5' : 'left-0.5 right-1/2'
                }`}
              />
              <button
                type="button"
                onClick={onToggleSinglish}
                className={`relative z-10 px-2 py-0.5 text-[10px] font-bold select-none transition-colors duration-200 ${
                  !useSinglish ? 'text-white font-sinhala' : 'text-slate-500'
                }`}
              >
                සිං
              </button>
              <button
                type="button"
                onClick={onToggleSinglish}
                className={`relative z-10 px-2 py-0.5 text-[10px] font-bold select-none transition-colors duration-200 ${
                  useSinglish ? 'text-white' : 'text-slate-500'
                }`}
              >
                EN
              </button>
            </div>
          )}

          {/* User Avatar / Log In Button */}
          <UserMenu onOpenAuth={onOpenAuth} />

          {/* Paduru Sync Pill */}
          <button
            type="button"
            onClick={onOpenPaduru}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
              roomCode
                ? 'bg-gradient-to-r from-purple-700 to-violet-600 text-white shadow-purple-600/25 ring-2 ring-purple-200'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/80'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                roomCode ? 'animate-pulse text-white' : 'text-purple-600'
              }`}
            />
            <span className="hidden sm:inline font-medium">Paduru Jam</span>
            <span className="sm:hidden font-medium">Jam</span>
            {roomCode && (
              <span className="flex items-center gap-1 font-mono text-[11px] bg-purple-900/40 px-1.5 py-0.5 rounded-full text-purple-100">
                <Users className="w-3 h-3" />
                {connectedCount}
              </span>
            )}
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-slate-600 hover:text-purple-700 rounded-lg hover:bg-purple-50"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white/95 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* Mobile Language Switcher Row */}
          {onToggleSinglish && (
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-purple-50/60 border border-purple-100 mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>Lyrics Language (භාෂාව)</span>
              </span>
              <button
                type="button"
                onClick={onToggleSinglish}
                className="flex items-center p-0.5 rounded-full bg-white border border-purple-200 text-xs font-semibold shadow-2xs active:scale-95 transition-all"
              >
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
                    !useSinglish ? 'bg-purple-600 text-white font-sinhala font-bold' : 'text-slate-600'
                  }`}
                >
                  සිංහල
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs transition-all ${
                    useSinglish ? 'bg-purple-600 text-white font-bold' : 'text-slate-600'
                  }`}
                >
                  English
                </span>
              </button>
            </div>
          )}
          <button
            onClick={() => {
              onScrollToSheet();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-purple-50 text-sm font-semibold text-slate-800 flex items-center justify-between"
          >
            <span>Chord Sheet Player</span>
            <Music className="w-4 h-4 text-purple-600" />
          </button>

          <button
            onClick={() => {
              onScrollToCatalog();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-purple-50 text-sm font-semibold text-slate-800 flex items-center justify-between"
          >
            <span>Song Catalog (ගීත එකතුව)</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </button>

          <button
            onClick={() => {
              onOpenPaduru();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-xl hover:bg-purple-50 text-sm font-semibold text-slate-800 flex items-center justify-between"
          >
            <span>Paduru Party Room</span>
            <Radio className="w-4 h-4 text-purple-600" />
          </button>

          {onOpenSubmit && (
            <button
              onClick={() => {
                onOpenSubmit();
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-sm font-semibold text-purple-900 flex items-center justify-between"
            >
              <span>Submit Chords (දායක වන්න)</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
