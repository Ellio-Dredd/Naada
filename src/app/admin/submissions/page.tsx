'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Music, CheckCircle, XCircle, Sparkles, RefreshCw, 
  ArrowLeft, ExternalLink, Filter, Clock, Check, Eye, Edit3
} from 'lucide-react';
import { SongSubmission, StrumPatternId } from '@/types';
import { parseChordPro } from '@/lib/chordpro';

const STRUM_OPTIONS: { id: StrumPatternId; label: string }[] = [
  { id: 'baila_6_8', label: 'Baila 6/8 (Clarence / Fast)' },
  { id: 'calypso_4_4', label: 'Calypso 4/4 (Island Folk)' },
  { id: 'sarala_3_4', label: 'Sarala Gee 3/4 (Waltz / Classical)' },
  { id: 'pop_4_4', label: 'Pop 4/4 (Ballad / Jothipala)' },
];

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SongSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form edit states for selected submission
  const [editTitleSi, setEditTitleSi] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editKey, setEditKey] = useState('C');
  const [editTempo, setEditTempo] = useState<number>(90);
  const [editTimeSig, setEditTimeSig] = useState('4/4');
  const [editStrum, setEditStrum] = useState<StrumPatternId>('pop_4_4');
  const [editTags, setEditTags] = useState('');
  const [editChordPro, setEditChordPro] = useState('');
  const [editSinglish, setEditSinglish] = useState('');

  // Action states
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview'>('editor');

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${filterStatus}`);
      const data = await res.json();
      if (res.ok && data.submissions) {
        setSubmissions(data.submissions);
        if (data.submissions.length > 0 && !selectedId) {
          setSelectedId(data.submissions[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filterStatus]);

  const selectedSubmission = useMemo(() => {
    return submissions.find((s) => s.id === selectedId) || null;
  }, [submissions, selectedId]);

  // Sync edit form when selection changes
  useEffect(() => {
    if (selectedSubmission) {
      setEditTitleSi(selectedSubmission.title_si || selectedSubmission.title_raw || '');
      setEditTitleEn(selectedSubmission.title_en || selectedSubmission.title_raw || '');
      setEditArtist(selectedSubmission.artist || selectedSubmission.artist_raw || '');
      setEditKey(selectedSubmission.key || 'C');
      setEditTempo(selectedSubmission.tempo_bpm || 90);
      setEditTimeSig(selectedSubmission.time_signature || '4/4');
      setEditStrum((selectedSubmission.strum_pattern as StrumPatternId) || 'pop_4_4');
      setEditTags((selectedSubmission.tags || []).join(', '));
      setEditChordPro(selectedSubmission.content_chordpro || selectedSubmission.raw_content || '');
      setEditSinglish(selectedSubmission.content_singlish || '');
      setActionMessage(null);
    }
  }, [selectedSubmission]);

  // Handle Approve
  const handleApprove = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    setActionMessage(null);

    try {
      const tagsArray = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_si: editTitleSi,
          title_en: editTitleEn,
          artist: editArtist,
          key: editKey,
          tempo_bpm: editTempo,
          time_signature: editTimeSig,
          strum_pattern: editStrum,
          tags: tagsArray,
          content_chordpro: editChordPro,
          content_singlish: editSinglish,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');

      setActionMessage({ type: 'success', text: `Published '${editTitleEn}' to public.songs!` });
      await fetchSubmissions();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error approving submission',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}/reject`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject');

      setActionMessage({ type: 'success', text: 'Submission rejected.' });
      await fetchSubmissions();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error rejecting submission',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Re-Normalize with Gemini AI
  const handleReNormalize = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}/normalize`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Normalization failed');

      if (data.submission) {
        setEditTitleSi(data.submission.title_si || '');
        setEditTitleEn(data.submission.title_en || '');
        setEditArtist(data.submission.artist || '');
        setEditKey(data.submission.key || 'C');
        setEditTempo(data.submission.tempo_bpm || 90);
        setEditTimeSig(data.submission.time_signature || '4/4');
        setEditStrum(data.submission.strum_pattern || 'pop_4_4');
        setEditTags((data.submission.tags || []).join(', '));
        setEditChordPro(data.submission.content_chordpro || '');
        setEditSinglish(data.submission.content_singlish || '');
        setActionMessage({ type: 'success', text: 'Drafted successfully with Gemini AI!' });
      }
      await fetchSubmissions();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'AI normalization failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse for live preview
  const parsedPreview = useMemo(() => {
    if (!editChordPro) return [];
    return parseChordPro(editChordPro, 0);
  }, [editChordPro]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Naada</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Naada Catalog Admin
              <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                Review Queue
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSubmissions()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Left List / Right Details */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Submissions Filter & List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                  filterStatus === status
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Submissions List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col max-h-[calc(100vh-160px)]">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Submissions ({submissions.length})</span>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No submissions found for filter '{filterStatus}'.
                </div>
              ) : (
                submissions.map((sub) => {
                  const isSelected = sub.id === selectedId;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedId(sub.id)}
                      className={`w-full text-left p-3.5 transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-purple-50/80 border-l-4 border-purple-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {sub.title_en || sub.title_raw || 'Untitled Song'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            sub.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="truncate">{sub.artist || sub.artist_raw || 'Unknown Artist'}</span>
                        {sub.content_chordpro && (
                          <span className="flex items-center gap-1 text-[10px] text-purple-600 font-semibold">
                            <Sparkles className="w-2.5 h-2.5" /> AI Ready
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                        <span>• By {sub.submitted_by || 'Anonymous'}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column: Selected Submission Inspector & Editor (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {actionMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {selectedSubmission ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              {/* Header Bar */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editTitleEn || 'Reviewing Submission'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Submitted on {new Date(selectedSubmission.created_at).toLocaleString()} by{' '}
                    <strong>{selectedSubmission.submitted_by || 'Anonymous'}</strong>
                  </p>
                </div>

                {/* Tab switch & AI draft */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReNormalize}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Run Gemini AI</span>
                  </button>

                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setPreviewTab('editor')}
                      className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        previewTab === 'editor'
                          ? 'bg-white text-purple-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Fields</span>
                    </button>
                    <button
                      onClick={() => setPreviewTab('preview')}
                      className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                        previewTab === 'preview'
                          ? 'bg-white text-purple-900 shadow-xs'
                          : 'text-slate-600'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Preview</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
                {previewTab === 'editor' ? (
                  <>
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Sinhala Title (title_si)
                        </label>
                        <input
                          type="text"
                          value={editTitleSi}
                          onChange={(e) => setEditTitleSi(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-sinhala rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          English Title (title_en)
                        </label>
                        <input
                          type="text"
                          value={editTitleEn}
                          onChange={(e) => setEditTitleEn(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Artist Name
                        </label>
                        <input
                          type="text"
                          value={editArtist}
                          onChange={(e) => setEditArtist(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Root Key
                        </label>
                        <input
                          type="text"
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tempo (BPM)
                        </label>
                        <input
                          type="number"
                          value={editTempo}
                          onChange={(e) => setEditTempo(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Time Signature
                        </label>
                        <input
                          type="text"
                          value={editTimeSig}
                          onChange={(e) => setEditTimeSig(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Strum Rhythm Preset
                        </label>
                        <select
                          value={editStrum}
                          onChange={(e) => setEditStrum(e.target.value as StrumPatternId)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white"
                        >
                          {STRUM_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="e.g. Baila, Golden 70s, Clarence"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>

                    {/* Split View: Raw Text vs ChordPro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">
                          Raw Submitted Text (Original)
                        </label>
                        <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto text-slate-700 border border-slate-200">
                          {selectedSubmission.raw_content}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                            <span>Structured ChordPro ([G]...)</span>
                            <span className="text-[10px] text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          </label>
                        </div>
                        <textarea
                          rows={11}
                          value={editChordPro}
                          onChange={(e) => setEditChordPro(e.target.value)}
                          className="w-full p-3 font-mono text-xs rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-600 bg-purple-50/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Romanized Singlish ChordPro (content_singlish)
                      </label>
                      <textarea
                        rows={6}
                        value={editSinglish}
                        onChange={(e) => setEditSinglish(e.target.value)}
                        placeholder="[G]Dilhani duwe [C]obe sinawe..."
                        className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </>
                ) : (
                  /* Live Rendered Chord Sheet Preview */
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">{editTitleSi}</h3>
                        <p className="text-xs text-purple-700 font-semibold">{editTitleEn} • {editArtist}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                        <span>Key: <strong>{editKey}</strong></span>
                        <span>•</span>
                        <span>BPM: <strong>{editTempo}</strong></span>
                        <span>•</span>
                        <span>Rhythm: <strong>{editStrum}</strong></span>
                      </div>
                    </div>

                    <div className="space-y-3 font-sans text-sm">
                      {parsedPreview.map((line, idx) => {
                        if (line.type === 'section') {
                          return (
                            <div key={idx} className="pt-2 text-xs font-bold text-purple-800 uppercase tracking-wider">
                              {line.content}
                            </div>
                          );
                        }
                        if (line.type === 'empty') {
                          return <div key={idx} className="h-2" />;
                        }
                        return (
                          <div key={idx} className="flex flex-wrap items-baseline gap-x-1.5 leading-loose">
                            {line.chunks?.map((chunk, cIdx) => (
                              <span key={cIdx} className="inline-flex flex-col items-start relative">
                                {chunk.chord && (
                                  <span className="text-xs font-mono font-bold text-purple-700 select-none">
                                    {chunk.chord}
                                  </span>
                                )}
                                <span className="text-slate-900 font-sinhala">{chunk.lyric}</span>
                              </span>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-bold text-rose-700 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Submission</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing || !editChordPro.trim()}
                  onClick={handleApprove}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md hover:shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isProcessing ? 'Publishing...' : 'Approve & Publish to Naada'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a submission from the list to review and publish.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
