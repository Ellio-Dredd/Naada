'use client';

import React from 'react';
import { GUITAR_CHORD_LIBRARY } from '@/lib/chordpro';
import { X } from 'lucide-react';

interface ChordDiagramModalProps {
  chord: string | null;
  onClose: () => void;
}

export function ChordDiagramModal({ chord, onClose }: ChordDiagramModalProps) {
  if (!chord) return null;

  // Normalize chord root
  const chordDef = GUITAR_CHORD_LIBRARY[chord] || GUITAR_CHORD_LIBRARY[chord.replace(/m$/, '')];

  const frets = chordDef ? chordDef.frets : [-1, -1, -1, -1, -1, -1];
  const baseFret = chordDef?.baseFret || 1;

  // 6 strings: E A D G B E (indices 0 to 5)
  // 5 frets shown in diagram
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];
  const numFrets = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xs bg-white rounded-2xl p-6 shadow-2xl border border-purple-100 flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close chord diagram"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Chord Header */}
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-widest font-semibold text-purple-600">Guitar Chord</span>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{chord}</h3>
          {baseFret > 1 && (
            <p className="text-xs text-slate-500 mt-0.5">Base Fret: {baseFret}fr</p>
          )}
        </div>

        {/* Fretboard SVG */}
        <div className="w-48 h-56 flex flex-col items-center justify-center">
          <svg viewBox="0 0 160 180" className="w-full h-full">
            {/* Top Nut or Bar */}
            {baseFret === 1 ? (
              <line x1="20" y1="24" x2="140" y2="24" stroke="#0f172a" strokeWidth="4" />
            ) : (
              <line x1="20" y1="24" x2="140" y2="24" stroke="#94a3b8" strokeWidth="2" />
            )}

            {/* Fret lines (horizontal) */}
            {[0, 1, 2, 3, 4].map((fretIndex) => {
              const y = 24 + fretIndex * 36;
              return (
                <line
                  key={`fret-${fretIndex}`}
                  x1="20"
                  y1={y}
                  x2="140"
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* String lines (vertical, 6 strings) */}
            {[0, 1, 2, 3, 4, 5].map((strIndex) => {
              const x = 20 + strIndex * 24;
              return (
                <line
                  key={`str-${strIndex}`}
                  x1={x}
                  y1="24"
                  x2={x}
                  y2={24 + 4 * 36}
                  stroke="#64748b"
                  strokeWidth={strIndex === 0 ? 2 : strIndex === 5 ? 1 : 1.5}
                />
              );
            })}

            {/* Finger Dots & Open/Muted markers */}
            {frets.map((fretVal, strIndex) => {
              const x = 20 + strIndex * 24;

              if (fretVal === -1) {
                // Muted String 'X'
                return (
                  <text
                    key={`mute-${strIndex}`}
                    x={x}
                    y="16"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#94a3b8"
                  >
                    ×
                  </text>
                );
              }

              if (fretVal === 0) {
                // Open String 'O'
                return (
                  <circle
                    key={`open-${strIndex}`}
                    cx={x}
                    cy="14"
                    r="4"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="1.5"
                  />
                );
              }

              // Fretted Note Dot
              const relativeFret = fretVal - (baseFret - 1);
              if (relativeFret >= 1 && relativeFret <= numFrets) {
                const y = 24 + (relativeFret - 0.5) * 36;
                return (
                  <g key={`dot-${strIndex}`}>
                    <circle cx={x} cy={y} r="8.5" fill="#7c3aed" />
                    <circle cx={x} cy={y} r="3" fill="#ffffff" />
                  </g>
                );
              }

              return null;
            })}

            {/* Base Fret Label if > 1 */}
            {baseFret > 1 && (
              <text x="6" y="46" fontSize="11" fontWeight="bold" fill="#7c3aed">
                {baseFret}fr
              </text>
            )}

            {/* String Letter names bottom */}
            {stringNames.map((s, idx) => (
              <text
                key={`label-${idx}`}
                x={20 + idx * 24}
                y="176"
                textAnchor="middle"
                fontSize="10"
                fill="#94a3b8"
                fontWeight="500"
              >
                {s}
              </text>
            ))}
          </svg>
        </div>

        <p className="text-xs text-slate-400 text-center mt-2">
          Tap anywhere outside to close
        </p>
      </div>
    </div>
  );
}
