'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Naada (නාද) Brand Mark
 * Minimalist acoustic resonance icon: harmonic soundwave intersecting a guitar string bridge,
 * subtly forming the letter 'N' and resonance ripple.
 */
export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="naada-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9333ea" />
            <stop offset="0.5" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="naada-glow" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f3e8ff" />
            <stop offset="1" stopColor="#ede9fe" />
          </linearGradient>
        </defs>

        {/* Soft resonant background squircle */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          fill="url(#naada-glow)"
          stroke="#ede9fe"
          strokeWidth="1.2"
        />

        {/* Acoustic Resonance Waves forming 'N' */}
        {/* Left string harmonic */}
        <path
          d="M12 28V12C12 12 14.5 15.5 17 20C19.5 24.5 22 28 22 28V12"
          stroke="url(#naada-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right acoustic resonance wave (vibrating tone ring) */}
        <path
          d="M26 15.5C27.5 17 28.5 19 28.5 21.5C28.5 24 27.5 26 26 27.5"
          stroke="#7c3aed"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />

        <path
          d="M29.5 13C31.5 15.2 32.5 18.2 32.5 21.5C32.5 24.8 31.5 27.8 29.5 30"
          stroke="#a855f7"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Central harmonic node dot */}
        <circle cx="12" cy="12" r="1.5" fill="#7c3aed" />
        <circle cx="22" cy="28" r="1.5" fill="#6d28d9" />
      </svg>
    </div>
  );
}
