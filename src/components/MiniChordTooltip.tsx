'use client';

import React from 'react';
import { GUITAR_CHORD_LIBRARY } from '@/lib/chordpro';

interface MiniChordTooltipProps {
  chord: string;
}

export function MiniChordTooltip({ chord }: MiniChordTooltipProps) {
  // Normalize chord root
  const chordDef = GUITAR_CHORD_LIBRARY[chord] || GUITAR_CHORD_LIBRARY[chord.replace(/m$/, '')];
  const frets = chordDef ? chordDef.frets : [-1, -1, -1, -1, -1, -1];
  const baseFret = chordDef?.baseFret || 1;
  const numFrets = 4;
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'e'];

  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-40 opacity-0 invisible group-hover/chord:opacity-100 group-hover/chord:visible transition-all duration-150 ease-out transform group-hover/chord:-translate-y-1">
      {/* Tooltip Card Body */}
      <div className="w-[108px] bg-white rounded-xl p-2 shadow-[0_8px_25px_rgba(109,40,217,0.18)] border border-purple-200/90 text-center flex flex-col items-center">
        {/* Chord Name Header */}
        <div className="flex items-center justify-between w-full px-0.5 mb-1">
          <span className="font-mono text-xs font-black text-purple-700">{chord}</span>
          {baseFret > 1 && (
            <span className="font-mono text-[9px] font-bold text-purple-500 bg-purple-50 px-1 rounded">
              {baseFret}fr
            </span>
          )}
        </div>

        {/* Mini SVG Fretboard */}
        <div className="w-[92px] h-[100px]">
          <svg viewBox="0 0 100 110" className="w-full h-full">
            {/* Top Nut or Bar */}
            {baseFret === 1 ? (
              <line x1="14" y1="16" x2="86" y2="16" stroke="#0f172a" strokeWidth="3" />
            ) : (
              <line x1="14" y1="16" x2="86" y2="16" stroke="#94a3b8" strokeWidth="1.5" />
            )}

            {/* Fret lines (horizontal) */}
            {[0, 1, 2, 3, 4].map((fretIndex) => {
              const y = 16 + fretIndex * 20;
              return (
                <line
                  key={`fret-${fretIndex}`}
                  x1="14"
                  y1={y}
                  x2="86"
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* String lines (vertical, 6 strings) */}
            {[0, 1, 2, 3, 4, 5].map((strIndex) => {
              const x = 14 + strIndex * 14.4;
              return (
                <line
                  key={`str-${strIndex}`}
                  x1={x}
                  y1="16"
                  x2={x}
                  y2={16 + 4 * 20}
                  stroke="#64748b"
                  strokeWidth={strIndex === 0 ? 1.5 : strIndex === 5 ? 0.8 : 1.1}
                />
              );
            })}

            {/* Finger Dots & Open/Muted markers */}
            {frets.map((fretVal, strIndex) => {
              const x = 14 + strIndex * 14.4;

              if (fretVal === -1) {
                // Muted String 'X'
                return (
                  <text
                    key={`mute-${strIndex}`}
                    x={x}
                    y="11"
                    textAnchor="middle"
                    fontSize="9"
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
                    cy="9"
                    r="2.5"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="1.2"
                  />
                );
              }

              // Fretted Note Dot
              const relativeFret = fretVal - (baseFret - 1);
              if (relativeFret >= 1 && relativeFret <= numFrets) {
                const y = 16 + (relativeFret - 0.5) * 20;
                return (
                  <g key={`dot-${strIndex}`}>
                    <circle cx={x} cy={y} r="4.8" fill="#7c3aed" />
                    <circle cx={x} cy={y} r="1.6" fill="#ffffff" />
                  </g>
                );
              }

              return null;
            })}

            {/* String Letter names bottom */}
            {stringNames.map((s, idx) => (
              <text
                key={`label-${idx}`}
                x={14 + idx * 14.4}
                y="107"
                textAnchor="middle"
                fontSize="7.5"
                fill="#94a3b8"
                fontWeight="600"
              >
                {s}
              </text>
            ))}
          </svg>
        </div>

        {/* Micro Hint */}
        <span className="text-[8.5px] font-medium text-purple-600/80 mt-0.5 block">
          Click for details
        </span>
      </div>

      {/* Downward Arrow Caret */}
      <div className="w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-4 border-t-white drop-shadow-2xs" />
    </div>
  );
}
