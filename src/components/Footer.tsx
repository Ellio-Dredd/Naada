'use client';

import React from 'react';
import { Logo } from '@/components/Logo';
import { Music, Radio, Mic2, Sparkles, Heart } from 'lucide-react';
import { translations } from '@/lib/i18n';
import Link from 'next/link';

interface FooterProps {
  onSelectSong: (songId: string) => void;
  onOpenPaduru: () => void;
  onOpenSubmit?: () => void;
  useSinglish?: boolean;
}

export function Footer({ onSelectSong, onOpenPaduru, onOpenSubmit, useSinglish = false }: FooterProps) {
  const t = translations[useSinglish ? 'en' : 'si'];

  return (
    <footer className="w-full bg-gradient-to-b from-white to-purple-50/60 border-t border-purple-100/90 pt-16 pb-36 sm:pb-28 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-purple-100">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <Logo size={36} />
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Naada
                </span>
                <span className="text-base font-bold text-purple-600 font-sinhala">
                  නාද
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              {t.footerDesc}
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-purple-700 font-mono font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live on Supabase Realtime</span>
              <span className="text-purple-300">•</span>
              <span>Web Audio Synthesis</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              Classic Catalog
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li>
                <button
                  onClick={() => onSelectSong('gamen-liyumak')}
                  className="hover:text-purple-700 transition-colors text-left flex items-center gap-1.5"
                >
                  <Music className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-sinhala">ගමෙන් ලියුමක්</span> (Clarence)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSong('ran-kuduwe')}
                  className="hover:text-purple-700 transition-colors text-left flex items-center gap-1.5"
                >
                  <Music className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-sinhala">රන් කූඩුවේ</span> (Milton)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSong('mal-mitak-thiyanna')}
                  className="hover:text-purple-700 transition-colors text-left flex items-center gap-1.5"
                >
                  <Music className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-sinhala">මල් මිටක් තියන්න</span> (Kasun)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectSong('dawasak-pala-nathi')}
                  className="hover:text-purple-700 transition-colors text-left flex items-center gap-1.5"
                >
                  <Music className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-sinhala">දවසක් පැල නැති</span> (Kapuge)
                </button>
              </li>
            </ul>
          </div>

          {/* Interactive Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              Live Tools
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 font-medium">
              <li>
                <button
                  onClick={onOpenPaduru}
                  className="hover:text-purple-700 transition-colors text-left flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5 text-purple-600" />
                  <span>Paduru Jam Sync</span>
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Mic2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Mic-Aware Auto-Scroller</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Capo Advisor &amp; Transposer</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-600">
                <Music className="w-3.5 h-3.5 text-purple-600" />
                <span>Baila 6/8 Strum Synth</span>
              </li>
              {onOpenSubmit && (
                <li>
                  <button
                    onClick={onOpenSubmit}
                    className="hover:text-purple-700 transition-colors text-left flex items-center gap-1.5 text-purple-700 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>{t.submitChords}</span>
                  </button>
                </li>
              )}
              <li>
                <Link
                  href="/admin/submissions"
                  className="hover:text-purple-700 transition-colors text-left flex items-center gap-1.5 text-slate-500 hover:underline text-xs"
                >
                  <span>Admin Review Queue &rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>{t.craftedWith}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block animate-pulse" />
            <span>by <strong className="text-slate-800 font-semibold hover:text-purple-700 transition-colors">Elio Dredd</strong> {t.forMusicLovers}</span>
          </p>

          <p className="font-mono text-purple-700 font-medium">
            Naada (නාද) &copy; {new Date().getFullYear()} — Pure White &amp; Electric Purple
          </p>
        </div>
      </div>
    </footer>
  );
}
