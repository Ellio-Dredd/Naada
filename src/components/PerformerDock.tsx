'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Mic,
  MicOff,
  Sliders,
  Minus,
  Plus,
  X,
  Music,
} from 'lucide-react';
import { StrumPatternId } from '@/types';
import { STRUM_PATTERNS } from '@/data/songs';

interface PerformerDockProps {
  isAutoScrollPlaying: boolean;
  onToggleAutoScroll: () => void;
  isMicEnabled: boolean;
  onToggleMic: () => void;
  micLevel: number;
  isSoundDetected: boolean;
  scrollSpeed: number;
  onSpeedChange: (speed: number) => void;
  isStrumPlaying: boolean;
  onToggleStrum: () => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  activePatternId: StrumPatternId;
  onSelectPattern: (id: StrumPatternId) => void;
  activeBeatStep: number;
  strumVolume: number;
  onVolumeChange: (vol: number) => void;
  semitones: number;
  onTranspose: (delta: number) => void;
  onResetTranspose: () => void;
  useSinglish: boolean;
  onToggleSinglish: () => void;
  capoAdvice: { capoFret: number; playKey: string; advice: string };
  isWakeLocked: boolean;
  onToggleWakeLock: () => void;
  isWakeLockSupported: boolean;
  fontScale: number;
  onFontScaleChange: (scale: number) => void;
}

export function PerformerDock({
  isAutoScrollPlaying,
  onToggleAutoScroll,
  isMicEnabled,
  onToggleMic,
  micLevel,
  isSoundDetected,
  scrollSpeed,
  onSpeedChange,
  isStrumPlaying,
  onToggleStrum,
  bpm,
  onBpmChange,
  activePatternId,
  onSelectPattern,
  strumVolume,
  onVolumeChange,
  semitones,
  onTranspose,
  onResetTranspose,
  useSinglish,
  onToggleSinglish,
  capoAdvice,
  isWakeLocked,
  onToggleWakeLock,
  isWakeLockSupported,
  fontScale,
  onFontScaleChange,
}: PerformerDockProps) {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    }
    if (isToolsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToolsOpen]);

  const tapTimesRef = useRef<number[]>([]);
  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    const times = tapTimesRef.current;
    if (times.length > 0 && now - times[times.length - 1] > 2000) {
      times.length = 0;
    }
    times.push(now);
    if (times.length > 4) times.shift();
    if (times.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 220) {
        onBpmChange(calculatedBpm);
      }
    }
  }, [onBpmChange]);

  return (
    <aside
      aria-label="Performer controls dock"
      className="fixed bottom-4 left-0 right-0 z-40 flex flex-col items-center pointer-events-none px-3"
    >
      {/* Secondary Tools Drawer */}
      {isToolsOpen && (
        <div
          ref={toolsRef}
          className="pointer-events-auto mb-3 w-full max-w-md p-5 rounded-3xl bg-white/95 backdrop-blur-2xl border border-purple-200 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 text-slate-800"
        >
          <div className="flex items-center justify-between pb-3 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Performer Settings &amp; Tools
              </h4>
            </div>
            <button
              onClick={() => setIsToolsOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-purple-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Strum Synthesizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-600" />
                Rhythm Backing Track
              </span>
              <button
                type="button"
                onClick={onToggleStrum}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isStrumPlaying
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                }`}
              >
                {isStrumPlaying ? 'Stop Strum' : 'Start Strum'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {Object.values(STRUM_PATTERNS).map((pat) => {
                const isSelected = pat.id === activePatternId;
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => onSelectPattern(pat.id)}
                    className={`py-1.5 px-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-purple-50/50 hover:bg-purple-100/50 text-slate-700 border-purple-100'
                    }`}
                  >
                    <span>{pat.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">Tempo:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onBpmChange(Math.max(50, bpm - 2))}
                  className="w-6 h-6 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200"
                >
                  -
                </button>
                <span className="font-mono text-xs font-bold text-slate-800 min-w-[40px] text-center">
                  {bpm} BPM
                </span>
                <button
                  onClick={() => onBpmChange(Math.min(180, bpm + 2))}
                  className="w-6 h-6 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleTapTempo}
                  className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-700 text-[10px] font-bold uppercase hover:bg-purple-50"
                  title="Tap beat 3-4 times"
                >
                  Tap
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-100 pt-3 space-y-3">
            {/* Mic Auto-Scroll */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800 block">Smart Mic Auto-Scroll</span>
                <span className="text-[11px] text-slate-500">Auto-pauses scrolling when music stops</span>
              </div>
              <button
                type="button"
                onClick={onToggleMic}
                className={`p-2 rounded-full border transition-all ${
                  isMicEnabled
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-purple-50 text-slate-500 border-purple-200 hover:text-purple-600'
                }`}
              >
                {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Screen Wake Lock */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800 block">Keep Screen Awake</span>
                <span className="text-[11px] text-slate-500">Prevents phone screen from turning off</span>
              </div>
              <button
                type="button"
                disabled={!isWakeLockSupported}
                onClick={onToggleWakeLock}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  isWakeLocked ? 'bg-purple-600' : 'bg-purple-200'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    isWakeLocked ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Performer Dock */}
      <nav
        aria-label="Performer playback controls"
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5 px-3 py-2 rounded-full backdrop-blur-2xl bg-white/95 border border-purple-200/90 shadow-[0_10px_30px_rgba(109,40,217,0.12)] text-slate-800 transition-all hover:shadow-[0_15px_35px_rgba(109,40,217,0.18)] animate-slide-up"
      >
        {/* 1. Play / Pause Auto-Scroll */}
        <button
          type="button"
          onClick={onToggleAutoScroll}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95 shadow-2xs ${
            isAutoScrollPlaying
              ? 'bg-purple-600 text-white shadow-purple-600/30 ring-2 ring-purple-300 ring-offset-1 playing-pulse'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          {isAutoScrollPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Scroll</span>
            </>
          )}
        </button>

        {/* Speed */}
        <div className="flex items-center bg-purple-50/70 border border-purple-100 rounded-full px-1.5 py-0.5">
          <button
            type="button"
            onClick={() => onSpeedChange(Math.max(0.2, Number((scrollSpeed - 0.2).toFixed(1))))}
            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-500 hover:text-purple-700 hover:bg-white text-xs font-bold transition-transform active:scale-90"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="font-mono text-[11px] font-bold text-purple-900 px-1 min-w-[28px] text-center">
            {scrollSpeed.toFixed(1)}x
          </span>
          <button
            type="button"
            onClick={() => onSpeedChange(Math.min(2.5, Number((scrollSpeed + 0.2).toFixed(1))))}
            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-500 hover:text-purple-700 hover:bg-white text-xs font-bold transition-transform active:scale-90"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-5 bg-purple-100" />

        {/* 2. Pitch */}
        <div className="flex items-center bg-purple-50/70 border border-purple-100 rounded-full px-1.5 py-0.5">
          <button
            type="button"
            onClick={() => onTranspose(-1)}
            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-500 hover:text-purple-700 hover:bg-white text-xs font-bold transition-transform active:scale-90"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onResetTranspose}
            className="font-mono text-[11px] font-bold text-purple-900 px-1.5 hover:underline transition-all"
          >
            {semitones === 0 ? 'Pitch' : `${semitones > 0 ? '+' : ''}${semitones}`}
          </button>
          <button
            type="button"
            onClick={() => onTranspose(1)}
            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-500 hover:text-purple-700 hover:bg-white text-xs font-bold transition-transform active:scale-90"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="w-px h-5 bg-purple-100" />

        {/* 3. Singlish Toggle */}
        <button
          type="button"
          onClick={onToggleSinglish}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 ${
            useSinglish
              ? 'bg-purple-600 text-white shadow-2xs'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100'
          }`}
          title="Toggle Sinhala / English lyrics"
        >
          {useSinglish ? 'EN' : 'සිං'}
        </button>

        {/* 4. Font Scale */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => onFontScaleChange(fontScale === 1 ? 1.2 : fontScale === 1.2 ? 1.4 : 1)}
            className="px-2 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 transition-all active:scale-90"
            title="Adjust lyrics text size"
          >
            {fontScale === 1 ? 'A' : fontScale === 1.2 ? 'A+' : 'A++'}
          </button>
        </div>

        {/* 5. Tools Drawer */}
        <button
          type="button"
          onClick={() => setIsToolsOpen((prev) => !prev)}
          className={`p-1.5 rounded-full transition-all active:scale-90 ${
            isToolsOpen
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </nav>
    </aside>
  );
}
