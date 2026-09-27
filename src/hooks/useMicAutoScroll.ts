'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface UseMicAutoScrollOptions {
  threshold?: number;       // RMS threshold to consider active sound (0.01 - 0.1)
  silenceTimeoutMs?: number;// 1500ms silence before pausing
  baseSpeed?: number;       // pixels per frame (0.4 - 2.0)
  onScrollTick?: (scrollPercent: number) => void;
}

export function useMicAutoScroll({
  threshold = 0.025,
  silenceTimeoutMs = 1500,
  baseSpeed = 0.7,
  onScrollTick,
}: UseMicAutoScrollOptions = {}) {
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isAutoScrollPlaying, setIsAutoScrollPlaying] = useState(false);
  const [micLevel, setMicLevel] = useState(0); // 0 to 100 for visualizer
  const [isSoundDetected, setIsSoundDetected] = useState(false);
  const [speed, setSpeed] = useState(baseSpeed);
  const [hasPermissionError, setHasPermissionError] = useState<string | null>(null);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const lastSoundTimeRef = useRef<number>(Date.now());
  const isCurrentlyScrollingRef = useRef<boolean>(false);
  const thresholdRef = useRef<number>(threshold);
  const speedRef = useRef<number>(speed);
  const isMicEnabledRef = useRef<boolean>(false);
  const isAutoScrollPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isMicEnabledRef.current = isMicEnabled;
  }, [isMicEnabled]);

  useEffect(() => {
    isAutoScrollPlayingRef.current = isAutoScrollPlaying;
  }, [isAutoScrollPlaying]);

  // Clean up mic resources
  const releaseMic = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setMicLevel(0);
    setIsSoundDetected(false);
  }, []);

  // Analysis and Scroll Loop
  const processAudioFrame = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    // Compute RMS
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);

    // Normalize level for UI (0 - 100)
    const normalizedLevel = Math.min(100, Math.round(rms * 450));
    setMicLevel(normalizedLevel);

    const now = Date.now();
    const soundPresent = rms >= thresholdRef.current;

    if (soundPresent) {
      lastSoundTimeRef.current = now;
      setIsSoundDetected(true);
    } else {
      // Check silence duration
      if (now - lastSoundTimeRef.current > silenceTimeoutMs) {
        setIsSoundDetected(false);
      }
    }

    // Scroll condition:
    // Either manual auto-scroll is forced ON, OR (mic is enabled AND sound detected within threshold)
    const shouldScroll = isAutoScrollPlayingRef.current && (!isMicEnabledRef.current || soundPresent || (now - lastSoundTimeRef.current <= silenceTimeoutMs));

    if (shouldScroll) {
      window.scrollBy({
        top: speedRef.current,
        left: 0,
        behavior: 'auto',
      });

      // Calculate scroll percent
      if (onScrollTick) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        if (totalHeight > 0) {
          const percent = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
          onScrollTick(percent);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(processAudioFrame);
  }, [silenceTimeoutMs, onScrollTick]);

  // Request Mic Permission and Setup Analyser
  const startMic = useCallback(async () => {
    setHasPermissionError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone API not supported on this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      audioStreamRef.current = stream;
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsMicEnabled(true);
      lastSoundTimeRef.current = Date.now();

      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(processAudioFrame);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Microphone permission denied';
      setHasPermissionError(message);
      setIsMicEnabled(false);
    }
  }, [processAudioFrame]);

  const stopMic = useCallback(() => {
    setIsMicEnabled(false);
    releaseMic();
  }, [releaseMic]);

  const toggleMic = useCallback(() => {
    if (isMicEnabled) {
      stopMic();
    } else {
      startMic();
    }
  }, [isMicEnabled, startMic, stopMic]);

  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrollPlaying((prev) => !prev);
  }, []);

  // Ensure scroll loop runs even if mic is disabled but auto-scroll is ON
  useEffect(() => {
    if (isAutoScrollPlaying && !isMicEnabled && !animFrameRef.current) {
      const standardScrollLoop = () => {
        if (isAutoScrollPlayingRef.current && !isMicEnabledRef.current) {
          window.scrollBy({
            top: speedRef.current,
            left: 0,
            behavior: 'auto',
          });

          if (onScrollTick) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            if (totalHeight > 0) {
              const percent = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
              onScrollTick(percent);
            }
          }
        }
        if (isAutoScrollPlayingRef.current) {
          animFrameRef.current = requestAnimationFrame(standardScrollLoop);
        }
      };
      animFrameRef.current = requestAnimationFrame(standardScrollLoop);
    }

    return () => {
      if (!isMicEnabled && animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isAutoScrollPlaying, isMicEnabled, onScrollTick]);

  // Clean up
  useEffect(() => {
    return () => {
      releaseMic();
    };
  }, [releaseMic]);

  return {
    isMicEnabled,
    isAutoScrollPlaying,
    micLevel,
    isSoundDetected,
    speed,
    setSpeed,
    hasPermissionError,
    toggleMic,
    toggleAutoScroll,
    setIsAutoScrollPlaying,
  };
}
