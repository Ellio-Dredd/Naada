'use client';

import React, { useState } from 'react';
import { X, Music2, Sparkles, RotateCcw, ArrowRight, Check } from 'lucide-react';
import { 
  CHROMATIC_KEYS_MAJOR, 
  CHROMATIC_KEYS_MINOR, 
  calculateSemitonesToKey, 
  getDiatonicChordsForScale,
  transposeChord,
  getCapoAdvice
} from '@/lib/chordpro';

interface ScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalKey: string;
  currentSemitones: number;
  onSelectSemitones: (semitones: number) => void;
  onSelectChordDiagram?: (chord: string) => void;
}

export function ScaleModal({
  isOpen,
  onClose,
  originalKey,
  currentSemitones,
  onSelectSemitones,
  onSelectChordDiagram,
}: ScaleModalProps) {
  const isOriginalMinor = originalKey.includes('m') && !originalKey.includes('maj');
  const [activeTab, setActiveTab] = useState<'major' | 'minor'>(isOriginalMinor ? 'minor' : 'major');

  if (!isOpen) return null;

  const currentKey = transposeChord(originalKey, currentSemitones);
  const capoAdvice = getCapoAdvice(originalKey, currentSemitones);
  const diatonicChords = getDiatonicChordsForScale(currentKey);

  const keysToDisplay = activeTab === 'major' ? CHROMATIC_KEYS_MAJOR : CHROMATIC_KEYS_MINOR;

  const handleKeyClick = (targetKey: string) => {
    const semitones = calculateSemitonesToKey(originalKey, targetKey);
    onSelectSemitones(semitones);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Music2 className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Scale & Musical Key Transposer</h3>
              <p className="text-xs text-purple-200">Adjust the song pitch to match your vocal range or instruments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Current Scale Status Banner */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-600 font-bold block">
                Active Scale / Key
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentKey} {currentKey.includes('m') ? 'Minor' : 'Major'}
                </span>
                {currentSemitones !== 0 ? (
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                    {currentSemitones > 0 ? `+${currentSemitones}` : currentSemitones} semitones from {originalKey}
                  </span>
                ) : (
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-200/60 text-slate-600 rounded-full">
                    Original Key
                  </span>
                )}
              </div>
            </div>

            {currentSemitones !== 0 && (
              <button
                type="button"
                onClick={() => onSelectSemitones(0)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-purple-200 hover:bg-purple-100 text-purple-800 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Stepper Buttons (-1 / +1) */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-600">Half-Step Shift:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectSemitones(currentSemitones - 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-xs font-bold font-mono transition-colors"
              >
                -1 Half Step
              </button>
              <button
                type="button"
                onClick={() => onSelectSemitones(currentSemitones + 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-xs font-bold font-mono transition-colors"
              >
                +1 Half Step
              </button>
            </div>
          </div>

          {/* Scale Type Tabs (Major vs Minor) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Direct Scale Selector
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('major')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'major'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Major Scales
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('minor')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'minor'
                      ? 'bg-white text-purple-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Minor Scales
                </button>
              </div>
            </div>

            {/* 12-Tone Scale Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {keysToDisplay.map((k) => {
                const isSelected = currentKey === k;
                const isOriginal = originalKey === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeyClick(k)}
                    className={`py-2.5 px-2 rounded-xl text-center font-bold text-sm transition-all relative ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-102 ring-2 ring-purple-300'
                        : 'bg-slate-50 hover:bg-purple-50 text-slate-800 border border-slate-200 hover:border-purple-200'
                    }`}
                  >
                    <span>{k}</span>
                    {isOriginal && (
                      <span className={`block text-[9px] font-mono ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                        Orig
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diatonic Scale Chords (Family Chords) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700">
                Chords in {currentKey} {currentKey.includes('m') ? 'Minor' : 'Major'} Scale:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Diatonic Triads</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {diatonicChords.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectChordDiagram && onSelectChordDiagram(item.chord)}
                  className="p-2 rounded-xl bg-purple-50/50 border border-purple-100 hover:border-purple-300 cursor-pointer transition-colors group"
                  title={`View ${item.chord} chord diagram`}
                >
                  <span className="block text-[10px] font-mono text-purple-600 font-semibold mb-0.5">
                    {item.degree}
                  </span>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-purple-700">
                    {item.chord}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Capo Advice */}
          {capoAdvice.capoFret > 0 && (
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-2.5 text-xs text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <strong>Guitarist Capo Recommendation:</strong> Put Capo on{' '}
                <strong>fret {capoAdvice.capoFret}</strong> to play using easy{' '}
                <strong>{capoAdvice.playKey}</strong> chord shapes!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-all shadow-md shadow-purple-700/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
