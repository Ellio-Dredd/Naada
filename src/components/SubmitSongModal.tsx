'use client';

import React, { useState } from 'react';
import { X, Music, Sparkles, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface SubmitSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmitSongModal({ isOpen, onClose }: SubmitSongModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ id: string; aiDrafted: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim()) {
      setErrorMessage('Please paste the song chords or lyrics.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/submit-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_raw: title.trim(),
          artist_raw: artist.trim(),
          raw_content: rawContent.trim(),
          submitted_by: submittedBy.trim() || 'Anonymous Musician',
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit song.');
      }

      setSuccessInfo({
        id: data.submission?.id || 'received',
        aiDrafted: Boolean(data.aiDrafted),
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setArtist('');
    setRawContent('');
    setSubmittedBy('');
    setNotes('');
    setSuccessInfo(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Music className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Submit Chords & Lyrics
                <span className="text-xs px-2 py-0.5 font-normal rounded-full bg-purple-500/40 text-purple-100 border border-purple-400/30">
                  Community
                </span>
              </h2>
              <p className="text-xs text-purple-200">Help expand the Naada repertoire for everyone</p>
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
        <div className="p-6 overflow-y-auto space-y-4">
          {successInfo ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Song Submitted Successfully!</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you for contributing! Your submission has been saved to the review queue.
                </p>
              </div>

              {successInfo.aiDrafted && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Auto-formatted with Gemini AI into ChordPro
                </div>
              )}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg shadow-purple-700/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Song Title (Sinhala or English)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Dilhani / දිල්හානි"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="e.g. Clarence Wijewardena"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Raw Chords Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Lyrics & Chords Text</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Paste raw text or website chords
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder={`[Chorus]\nG                  C\nදිල්හානි දුවේ ඔබේ සිනාවේ\nD                  G\nමිණි කැට වැටෙනවා වාගේ\n\n(Or paste standard text from any chord site or notebook)`}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all bg-slate-50/50"
                />
              </div>

              {/* Contributor & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name / Alias (Optional)
                  </label>
                  <input
                    type="text"
                    value={submittedBy}
                    onChange={(e) => setSubmittedBy(e.target.value)}
                    placeholder="e.g. Kasun from Kandy"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notes / Source (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Key verified with original 1974 recording"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Info banner */}
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-[11px] text-purple-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p>
                  Our pipeline automatically converts floating whitespace chords into inline 
                  <strong> [Chord]</strong> tags, generates phonetic Singlish, and detects BPM & strum patterns.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rawContent.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg shadow-purple-700/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Drafting & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
