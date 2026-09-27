'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Music, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(defaultTab);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setConfirmPassword('');
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const handleTabSwitch = (newTab: 'login' | 'signup') => {
    setTab(newTab);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please fill in all fields.'); return; }

    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login')) {
        setError('Incorrect email or password. Please try again.');
      } else {
        setError(error.message);
      }
    } else {
      onClose();
      resetForm();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) { setError('Please enter your display name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    const { error } = await signUp(email, password, displayName.trim());
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Try logging in.');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess('Account created! Check your email to confirm, then log in.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); resetForm(); } }}
    >
      <div className="relative w-full max-w-sm rounded-3xl shadow-2xl shadow-purple-900/10 bg-white border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Close */}
        <button
          onClick={() => { onClose(); resetForm(); }}
          className="absolute top-4 right-4 z-10 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-purple-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-6 pt-8 pb-6 text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Music className="w-5 h-5 text-purple-200" />
            <span className="text-lg font-black tracking-tight">Naada</span>
            <span className="text-sm font-bold text-purple-300 font-sinhala">නාද</span>
          </div>
          <p className="text-purple-200 text-xs mt-1">Your Sinhala Guitar Chords Community</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-purple-100 bg-purple-50/40">
          <button
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all ${
              tab === 'login'
                ? 'text-purple-700 border-b-2 border-purple-600 bg-white'
                : 'text-slate-500 hover:text-purple-600'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => handleTabSwitch('signup')}
            className={`flex-1 py-3 text-xs font-bold tracking-wide transition-all ${
              tab === 'signup'
                ? 'text-purple-700 border-b-2 border-purple-600 bg-white'
                : 'text-slate-500 hover:text-purple-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <div className="p-6">

          {/* Error / Success banners */}
          {error && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs animate-fade-in">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-purple-50/40 border border-purple-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm bg-purple-50/40 border border-purple-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 placeholder-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-sm font-bold transition-all shadow-md shadow-purple-600/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Logging in…' : 'Log In'}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Don&apos;t have an account?{' '}
                <button type="button" onClick={() => handleTabSwitch('signup')} className="text-purple-600 font-semibold hover:underline">
                  Sign up free
                </button>
              </p>
            </form>

          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              {/* Display Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-purple-50/40 border border-purple-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-purple-50/40 border border-purple-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Password (min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm bg-purple-50/40 border border-purple-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 placeholder-slate-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-purple-50/40 border border-purple-200/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !!success}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white text-sm font-bold transition-all shadow-md shadow-purple-600/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isLoading ? 'Creating account…' : 'Create Account'}
              </button>

              <p className="text-center text-xs text-slate-500 pt-1">
                Already have an account?{' '}
                <button type="button" onClick={() => handleTabSwitch('login')} className="text-purple-600 font-semibold hover:underline">
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
