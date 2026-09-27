'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { STRUM_PATTERNS } from '@/data/songs';
import { StrumPatternId, StrumStroke } from '@/types';

export function useStrumPlayer(defaultPatternId: StrumPatternId = 'baila_6_8', initialBpm: number = 120) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(initialBpm);
  const [patternId, setPatternId] = useState<StrumPatternId>(defaultPatternId);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [volume, setVolume] = useState<number>(0.75);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);
  const stepRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const bpmRef = useRef<number>(bpm);
  const patternIdRef = useRef<StrumPatternId>(patternId);
  const volumeRef = useRef<number>(volume);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    patternIdRef.current = patternId;
  }, [patternId]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Initialize or resume AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtxClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  /**
   * Synthesize acoustic guitar strum transient using noise burst + decaying bandpass filters
   */
  const triggerStrumSound = useCallback((stroke: StrumStroke) => {
    if (stroke.direction === 'rest') return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const isDown = stroke.direction === 'down';
      const isAccent = Boolean(stroke.accent);

      // Duration & dynamics
      const duration = isDown ? (isAccent ? 0.09 : 0.07) : 0.05;
      const baseGain = isAccent ? 0.65 : 0.45;
      const finalGain = baseGain * volumeRef.current;

      // 1. Generate short white noise buffer for string pick scratch / strum scrape
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // 2. Body resonance bandpass filters simulating acoustic guitar soundbox
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      // Down strums emphasize lower wooden body resonance (320Hz), up strums emphasize chime (800Hz)
      bandpass.frequency.setValueAtTime(isDown ? 380 : 850, now);
      bandpass.Q.setValueAtTime(isAccent ? 4.5 : 3.0, now);

      // 3. Highpass filter for pick attack crispness
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(isDown ? 180 : 420, now);

      // 4. Low-end tone body (warm synthetic string fundamental)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = isDown ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isDown ? (isAccent ? 146.83 : 196.0) : 246.94, now); // D3, G3, B3

      oscGain.gain.setValueAtTime(finalGain * 0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.5);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration * 1.5);

      // 5. Amplitude Envelope for noise scrape
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(finalGain, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noiseSource.connect(bandpass);
      bandpass.connect(highpass);
      highpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch {
      // AudioContext fallback for unsupported browsers
    }
  }, [getAudioContext]);

  // Scheduler loop
  const scheduleLoop = useCallback(() => {
    if (!isPlayingRef.current) return;

    const pattern = STRUM_PATTERNS[patternIdRef.current] || STRUM_PATTERNS.baila_6_8;
    const strokes = pattern.strokes;
    const totalSteps = strokes.length;

    // Calculate subdivision interval in milliseconds
    // For 6/8: 6 eighth-notes per measure. Tempo is in dotted quarter or eighth notes.
    // For 4/4: 8 eighth-notes per measure.
    const stepsPerBeat = pattern.timeSignature === '6/8' ? 2 : 2;
    const stepDurationMs = (60 / bpmRef.current / stepsPerBeat) * 1000;

    const currentStepIndex = stepRef.current % totalSteps;
    const stroke = strokes[currentStepIndex];

    triggerStrumSound(stroke);
    setActiveStep(currentStepIndex);

    stepRef.current = (currentStepIndex + 1) % totalSteps;

    timerRef.current = setTimeout(scheduleLoop, stepDurationMs);
  }, [triggerStrumSound]);

  const startPlaying = useCallback(() => {
    getAudioContext();
    isPlayingRef.current = true;
    setIsPlaying(true);
    stepRef.current = 0;
    scheduleLoop();
  }, [getAudioContext, scheduleLoop]);

  const stopPlaying = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setActiveStep(-1);
    if (timerRef.current) {
      clearTimeout(timerRef.current as NodeJS.Timeout);
      timerRef.current = null;
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      stopPlaying();
    } else {
      startPlaying();
    }
  }, [startPlaying, stopPlaying]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current as NodeJS.Timeout);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    isPlaying,
    bpm,
    setBpm,
    patternId,
    setPatternId,
    activeStep,
    volume,
    setVolume,
    togglePlay,
    startPlaying,
    stopPlaying,
    activePattern: STRUM_PATTERNS[patternId] || STRUM_PATTERNS.baila_6_8,
  };
}
