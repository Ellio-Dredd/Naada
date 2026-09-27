'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Edit2, Check, X, Music, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserMenuProps {
  onOpenAuth: () => void;
}

export function UserMenu({ onOpenAuth }: UserMenuProps) {
  const { user, isLoading, signOut, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guest';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const email = user?.email || '';

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === displayName) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    await updateProfile(newName.trim());
    setIsSaving(false);
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  // Not yet loaded
  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-purple-100 animate-pulse" />
    );
  }

  // Not logged in
  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-purple-600/30"
      >
        <User className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Log In</span>
      </button>
    );
  }

  // Logged in — avatar + dropdown
  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => { setIsOpen((v) => !v); setIsEditing(false); }}
        className="flex items-center gap-1.5 group"
        title={`Logged in as ${displayName}`}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs font-bold flex items-center justify-center shadow-sm ring-2 ring-white group-hover:ring-purple-200 transition-all">
          {avatarLetter}
        </div>
        <ChevronDown className={`w-3 h-3 text-slate-500 hidden sm:block transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-purple-100 shadow-xl shadow-purple-900/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">

          {/* Profile Header */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 px-4 py-4 border-b border-purple-100">
            <div className="flex items-center gap-3">
              {/* Big Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white text-lg font-bold flex items-center justify-center shadow-md flex-shrink-0">
                {avatarLetter}
              </div>
              <div className="min-w-0 flex-1">
                {/* Editable name */}
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditing(false); }}
                      className="flex-1 text-sm font-bold text-slate-900 bg-white border border-purple-300 rounded-lg px-2 py-0.5 outline-none focus:ring-2 focus:ring-purple-200 min-w-0"
                    />
                    <button onClick={handleSaveName} disabled={isSaving} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:bg-purple-50 rounded-md transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {saveSuccess ? '✓ Saved!' : displayName}
                    </p>
                    <button
                      onClick={() => { setNewName(displayName); setIsEditing(true); }}
                      className="p-0.5 text-slate-400 hover:text-purple-600 rounded transition-colors flex-shrink-0"
                      title="Edit display name"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-purple-50">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Music className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium">Naada Member</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs text-slate-400">
              {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
