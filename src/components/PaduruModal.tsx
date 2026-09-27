'use client';

import React, { useState } from 'react';
import { X, Users, Radio, Copy, Check, LogOut, Music2, Mic2 } from 'lucide-react';

interface PaduruModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string | null;
  isHost: boolean;
  connectedCount: number;
  viewMode: 'musician' | 'singer';
  onToggleViewMode: (mode: 'musician' | 'singer') => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onLeaveRoom: () => void;
}

export function PaduruModal({
  isOpen,
  onClose,
  roomCode,
  isHost,
  connectedCount,
  viewMode,
  onToggleViewMode,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
}: PaduruModalProps) {
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinInput.trim()) {
      onJoinRoom(joinInput.trim().toUpperCase());
      setJoinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl bg-white border border-purple-100 flex flex-col shadow-purple-900/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-purple-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-violet-500 text-white flex items-center justify-center shadow-md shadow-purple-600/25">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Paduru Party (පඳුරු Jam)
            </h2>
            <p className="text-xs text-purple-600/70 font-mono">
              Live multi-device synchronized chord sheet
            </p>
          </div>
        </div>

        {/* Active Room State */}
        {roomCode ? (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 text-center">
              <span className="text-[10px] font-mono font-bold text-purple-700 tracking-widest uppercase">
                Active Room Code
              </span>
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="text-3xl font-mono font-black tracking-widest text-purple-950">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors shadow-2xs"
                  title="Copy room code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-600 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {connectedCount} device{connectedCount > 1 ? 's' : ''} connected ({isHost ? 'Host' : 'Member'})
                </span>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
                Display Perspective
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-purple-50/70 rounded-xl font-mono text-xs">
                <button
                  type="button"
                  onClick={() => onToggleViewMode('musician')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === 'musician'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Music2 className="w-3.5 h-3.5" />
                  Musician
                </button>
                <button
                  type="button"
                  onClick={() => onToggleViewMode('singer')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === 'singer'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  Singer
                </button>
              </div>
            </div>

            {/* Leave Room */}
            <button
              onClick={onLeaveRoom}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-mono font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Host: Start Room */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/80 to-white border border-purple-100">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-1">
                Host Session
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Lead the room. Song changes and auto-scrolling synchronize across everyone&apos;s phones automatically.
              </p>
              <button
                onClick={onCreateRoom}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-semibold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Start New Jam (Host)
              </button>
            </div>

            {/* Join Room */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 mb-1">
                Join Friend&apos;s Room
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Enter the room code from the host to lock your screen in sync.
              </p>
              <form onSubmit={handleJoinSubmit} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                  placeholder="Code (e.g. NA42)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono uppercase tracking-wider outline-none focus:border-purple-600"
                />
                <button
                  type="submit"
                  disabled={!joinInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-purple-600 disabled:opacity-40 text-white font-mono text-xs font-semibold transition-colors flex-shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
