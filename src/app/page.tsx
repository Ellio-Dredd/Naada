'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SEED_SONGS } from '@/data/songs';
import { Song } from '@/types';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { SongViewer } from '@/components/SongViewer';
import { CatalogSection } from '@/components/CatalogSection';
import { Footer } from '@/components/Footer';
import { PerformerDock } from '@/components/PerformerDock';
import { SearchModal } from '@/components/SearchModal';
import { PaduruModal } from '@/components/PaduruModal';
import { SubmitSongModal } from '@/components/SubmitSongModal';
import { SongViewerSkeleton } from '@/components/SongViewerSkeleton';
import { useStrumPlayer } from '@/hooks/useStrumPlayer';
import { useMicAutoScroll } from '@/hooks/useMicAutoScroll';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useJamRoom } from '@/hooks/useJamRoom';
import { getCapoAdvice } from '@/lib/chordpro';
import { fetchSongsFromSupabase } from '@/lib/supabase';
import { Users, Music, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>(SEED_SONGS);
  const [currentSongId, setCurrentSongId] = useState<string>('gamen-liyumak');
  const [activeTab, setActiveTab] = useState<'catalog' | 'sheet'>('catalog');
  const [heroSearchQuery, setHeroSearchQuery] = useState<string>('');
  const [isLoadingSongs, setIsLoadingSongs] = useState<boolean>(true);
  const [isSwitchingSong, setIsSwitchingSong] = useState<boolean>(false);
  const [semitones, setSemitones] = useState<number>(0);
  const [useSinglish, setUseSinglish] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPaduruOpen, setIsPaduruOpen] = useState<boolean>(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(0.7);
  const [fontScale, setFontScale] = useState<number>(1);

  // Load songs from Supabase on mount with resilient local fallback
  useEffect(() => {
    fetchSongsFromSupabase()
      .then((data) => {
        if (data && data.length > 0) {
          setSongs(data);
        }
        setIsLoadingSongs(false);
      })
      .catch(() => {
        setIsLoadingSongs(false);
      });
  }, []);

  // Active Song
  const currentSong = useMemo(() => {
    return songs.find((s) => s.id === currentSongId) || songs[0] || SEED_SONGS[0];
  }, [songs, currentSongId]);

  // Capo Advice
  const capoAdvice = useMemo(() => {
    return getCapoAdvice(currentSong.key, semitones);
  }, [currentSong.key, semitones]);

  // 1. Web Audio Strum Synthesizer
  const {
    isPlaying: isStrumPlaying,
    bpm,
    setBpm,
    patternId,
    setPatternId,
    activeStep: activeBeatStep,
    volume: strumVolume,
    setVolume: setStrumVolume,
    togglePlay: toggleStrum,
    stopPlaying: stopStrum,
  } = useStrumPlayer(currentSong.strum_pattern, currentSong.tempo_bpm);

  // When song changes, update strum preset and BPM
  useEffect(() => {
    setPatternId(currentSong.strum_pattern);
    setBpm(currentSong.tempo_bpm);
    setSemitones(0);
  }, [currentSong, setPatternId, setBpm]);

  // 2. Realtime Jam Room Sync
  const handleRemoteSongChange = useCallback((newSongId: string) => {
    setCurrentSongId(newSongId);
    setActiveTab('sheet');
  }, []);

  const handleRemoteScrollSync = useCallback((scrollPercent: number) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const targetScrollY = (scrollPercent / 100) * totalHeight;
      window.scrollTo({
        top: targetScrollY,
        behavior: 'smooth',
      });
    }
  }, []);

  const {
    roomCode,
    isHost,
    connectedCount,
    viewMode,
    setViewMode,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastSongChange,
    broadcastScrollSync,
  } = useJamRoom(currentSongId, handleRemoteSongChange, handleRemoteScrollSync);

  // 3. Mic-Aware Smart Auto-Scroller
  const handleScrollTick = useCallback(
    (scrollPercent: number) => {
      if (isHost && roomCode) {
        broadcastScrollSync(scrollPercent);
      }
    },
    [isHost, roomCode, broadcastScrollSync]
  );

  const {
    isMicEnabled,
    isAutoScrollPlaying,
    micLevel,
    isSoundDetected,
    toggleMic,
    toggleAutoScroll,
    setIsAutoScrollPlaying,
  } = useMicAutoScroll({
    threshold: 0.025,
    silenceTimeoutMs: 1500,
    baseSpeed: scrollSpeed,
    onScrollTick: handleScrollTick,
  });

  // 4. Device Screen Wake Lock
  const {
    isLocked: isWakeLocked,
    isSupported: isWakeLockSupported,
    toggleWakeLock,
  } = useWakeLock();

  // Transpose handlers
  const handleTranspose = (delta: number) => {
    setSemitones((prev) => {
      let next = prev + delta;
      if (next > 11) next = -11;
      if (next < -11) next = 11;
      return next;
    });
  };

  const handleResetTranspose = () => {
    setSemitones(0);
  };

  // Change song and switch to sheet view with sleek transition
  const handleSelectSong = (songId: string) => {
    setIsSwitchingSong(true);
    setCurrentSongId(songId);
    setActiveTab('sheet');
    stopStrum();
    setIsAutoScrollPlaying(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (roomCode && isHost) {
      broadcastSongChange(songId);
    }
    setTimeout(() => {
      setIsSwitchingSong(false);
    }, 180);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-white lavender-glow-bg text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Sleek Top Edge Loading Progress Bar */}
      {isLoadingSongs && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-purple-100 z-50 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-500 animate-top-progress" />
        </div>
      )}

      {/* 1. App Shell Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenPaduru={() => setIsPaduruOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onScrollToCatalog={() => {
          setActiveTab('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onScrollToSheet={() => {
          setActiveTab('sheet');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeTab={activeTab}
        activeSongTitle={useSinglish ? currentSong.title_en : currentSong.title_si}
        roomCode={roomCode}
        connectedCount={connectedCount}
        useSinglish={useSinglish}
        onToggleSinglish={() => setUseSinglish((prev) => !prev)}
      />

      {/* Realtime Synced Jam Room Indicator Banner */}
      {roomCode && (
        <aside
          aria-label="Active jam session"
          className="bg-gradient-to-r from-purple-700 to-violet-700 text-white py-2 px-4 text-xs font-mono flex items-center justify-between shadow-xs sticky top-16 z-20 animate-fade-in"
        >
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                PADURU ROOM: <strong className="tracking-wider">{roomCode}</strong> — {isHost ? 'BROADCASTING AS HOST' : 'JOINED IN SYNC'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold">
                <Users className="w-3.5 h-3.5" /> {connectedCount}
              </span>
              <button
                onClick={() => setIsPaduruOpen(true)}
                className="underline hover:text-purple-200"
              >
                Settings
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* View Mode 1: Discovery & 500+ Song Catalog */}
      {activeTab === 'catalog' && (
        <div className="flex-1 animate-fade-in">
          {/* Welcoming, Search-First Hero */}
          <HeroSection
            onSearchInput={(q) => setHeroSearchQuery(q)}
            onOpenPaduru={() => setIsPaduruOpen(true)}
            onScrollToCatalog={() => {
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            activeSongTitle={useSinglish ? currentSong.title_en : currentSong.title_si}
            onOpenActiveSong={() => {
              setActiveTab('sheet');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            useSinglish={useSinglish}
          />

          {/* 500+ Scaled Song Catalog with Search, Filters, A-Z Jump & Pagination */}
          <CatalogSection
            songs={songs}
            currentSongId={currentSongId}
            onSelectSong={handleSelectSong}
            initialSearchQuery={heroSearchQuery}
            onClearInitialSearch={() => setHeroSearchQuery('')}
            isLoading={isLoadingSongs}
            useSinglish={useSinglish}
          />

          {/* Floating Pill if Song is Loaded in Memory */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-slide-up">
            <button
              onClick={() => {
                setActiveTab('sheet');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-purple-900/90 text-white text-xs font-semibold backdrop-blur-xl shadow-xl hover:bg-purple-950 transition-all hover:scale-105 active:scale-95 border border-purple-400/30"
            >
              <Music className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>Playing: <strong>{useSinglish ? currentSong.title_en : currentSong.title_si}</strong> ({currentSong.key})</span>
              <ChevronRight className="w-3.5 h-3.5 text-purple-300" />
            </button>
          </div>
        </div>
      )}

      {/* View Mode 2: Focused Distraction-Free Chord Sheet */}
      {activeTab === 'sheet' && (
        <main id="sheet-section" className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-6 pt-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-10 border border-purple-100/90 shadow-[0_4px_30px_rgba(124,58,237,0.05)]">
            {isSwitchingSong ? (
              <SongViewerSkeleton />
            ) : (
              <SongViewer
                song={currentSong}
                semitones={semitones}
                onTranspose={handleTranspose}
                useSinglish={useSinglish}
                onToggleSinglish={() => setUseSinglish((prev) => !prev)}
                viewMode={viewMode}
                onToggleViewMode={() => setViewMode((prev) => (prev === 'musician' ? 'singer' : 'musician'))}
                fontScale={fontScale}
                onBackToCatalog={() => {
                  setActiveTab('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </div>

          {/* Streamlined Performer Playback Dock */}
          <PerformerDock
            isAutoScrollPlaying={isAutoScrollPlaying}
            onToggleAutoScroll={toggleAutoScroll}
            isMicEnabled={isMicEnabled}
            onToggleMic={toggleMic}
            micLevel={micLevel}
            isSoundDetected={isSoundDetected}
            scrollSpeed={scrollSpeed}
            onSpeedChange={setScrollSpeed}
            isStrumPlaying={isStrumPlaying}
            onToggleStrum={toggleStrum}
            bpm={bpm}
            onBpmChange={setBpm}
            activePatternId={patternId}
            onSelectPattern={setPatternId}
            activeBeatStep={activeBeatStep}
            strumVolume={strumVolume}
            onVolumeChange={setStrumVolume}
            semitones={semitones}
            onTranspose={handleTranspose}
            onResetTranspose={handleResetTranspose}
            useSinglish={useSinglish}
            onToggleSinglish={() => setUseSinglish((prev) => !prev)}
            capoAdvice={capoAdvice}
            isWakeLocked={isWakeLocked}
            onToggleWakeLock={toggleWakeLock}
            isWakeLockSupported={isWakeLockSupported}
            fontScale={fontScale}
            onFontScaleChange={setFontScale}
          />
        </main>
      )}

      {/* Editorial Footer */}
      <Footer
        onSelectSong={handleSelectSong}
        onOpenPaduru={() => setIsPaduruOpen(true)}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        useSinglish={useSinglish}
      />

      {/* Search Modal (Cmd+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        songs={songs}
        onSelectSong={handleSelectSong}
        currentSongId={currentSongId}
      />

      {/* Paduru Party Jam Modal */}
      <PaduruModal
        isOpen={isPaduruOpen}
        onClose={() => setIsPaduruOpen(false)}
        roomCode={roomCode}
        isHost={isHost}
        connectedCount={connectedCount}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onLeaveRoom={leaveRoom}
      />

      {/* Community Song Submission Modal */}
      <SubmitSongModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />
    </div>
  );
}
