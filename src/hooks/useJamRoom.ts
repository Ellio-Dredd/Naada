'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { JamBroadcastPayload } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Random easy 4-character uppercase alphanumeric code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'NA';
  for (let i = 0; i < 2; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function useJamRoom(
  currentSongId: string,
  onRemoteSongChange?: (newSongId: string) => void,
  onRemoteScrollSync?: (scrollPercent: number) => void
) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [connectedCount, setConnectedCount] = useState(1);
  const [viewMode, setViewMode] = useState<'musician' | 'singer'>('musician');
  const [isConnected, setIsConnected] = useState(false);

  const myIdRef = useRef<string>(`user_${Math.random().toString(36).substring(2, 9)}`);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);
  const lastScrollBroadcastRef = useRef<number>(0);

  // Handle incoming message
  const handleIncomingPayload = useCallback((payload: JamBroadcastPayload) => {
    if (payload.senderId === myIdRef.current) return;

    if (payload.type === 'song-change' && payload.songId) {
      if (onRemoteSongChange) {
        onRemoteSongChange(payload.songId);
      }
    } else if (payload.type === 'scroll-sync' && payload.scrollPercent !== undefined) {
      if (onRemoteScrollSync) {
        onRemoteScrollSync(payload.scrollPercent);
      }
    } else if (payload.type === 'presence-ping') {
      setConnectedCount((prev) => Math.max(prev, 2));
    }
  }, [onRemoteSongChange, onRemoteScrollSync]);

  // Setup broadcast listeners
  const setupChannel = useCallback((code: string) => {
    // 1. Local BroadcastChannel for instant local/cross-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      if (localBroadcastRef.current) {
        localBroadcastRef.current.close();
      }
      const localBc = new BroadcastChannel(`naada_jam_${code}`);
      localBc.onmessage = (e) => {
        handleIncomingPayload(e.data);
      };
      localBroadcastRef.current = localBc;
    }

    // 2. Supabase Realtime channel if available
    if (isSupabaseConfigured && supabase) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      const channel = supabase.channel(`jam-room:${code}`, {
        config: {
          broadcast: { self: false },
        },
      });

      channel
        .on('broadcast', { event: 'jam-event' }, ({ payload }) => {
          handleIncomingPayload(payload as JamBroadcastPayload);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            // Send presence ping
            channel.send({
              type: 'broadcast',
              event: 'jam-event',
              payload: {
                type: 'presence-ping',
                roomCode: code,
                senderId: myIdRef.current,
                timestamp: Date.now(),
              },
            });
          }
        });

      channelRef.current = channel;
    } else {
      setIsConnected(true);
    }
  }, [handleIncomingPayload]);

  // Start new room as Host
  const createRoom = useCallback(() => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setConnectedCount(1);
    setupChannel(code);
    return code;
  }, [setupChannel]);

  // Join existing room
  const joinRoom = useCallback((codeToJoin: string) => {
    const formatted = codeToJoin.trim().toUpperCase();
    setRoomCode(formatted);
    setIsHost(false);
    setupChannel(formatted);

    // Notify host of join
    if (localBroadcastRef.current) {
      localBroadcastRef.current.postMessage({
        type: 'presence-ping',
        roomCode: formatted,
        senderId: myIdRef.current,
        timestamp: Date.now(),
      });
    }
  }, [setupChannel]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (channelRef.current && supabase) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    if (localBroadcastRef.current) {
      localBroadcastRef.current.close();
      localBroadcastRef.current = null;
    }
    setRoomCode(null);
    setIsHost(false);
    setIsConnected(false);
    setConnectedCount(1);
  }, []);

  // Broadcast song change (Host only)
  const broadcastSongChange = useCallback((songId: string) => {
    if (!roomCode) return;
    const payload: JamBroadcastPayload = {
      type: 'song-change',
      roomCode,
      songId,
      senderId: myIdRef.current,
      timestamp: Date.now(),
    };

    if (localBroadcastRef.current) {
      localBroadcastRef.current.postMessage(payload);
    }
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'jam-event',
        payload,
      });
    }
  }, [roomCode]);

  // Broadcast scroll sync (throttled to 60ms)
  const broadcastScrollSync = useCallback((scrollPercent: number) => {
    if (!roomCode || !isHost) return;
    const now = Date.now();
    if (now - lastScrollBroadcastRef.current < 60) return;
    lastScrollBroadcastRef.current = now;

    const payload: JamBroadcastPayload = {
      type: 'scroll-sync',
      roomCode,
      scrollPercent,
      senderId: myIdRef.current,
      timestamp: now,
    };

    if (localBroadcastRef.current) {
      localBroadcastRef.current.postMessage(payload);
    }
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'jam-event',
        payload,
      });
    }
  }, [roomCode, isHost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
      }
      if (localBroadcastRef.current) {
        localBroadcastRef.current.close();
      }
    };
  }, []);

  return {
    roomCode,
    isHost,
    isConnected,
    connectedCount,
    viewMode,
    setViewMode,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastSongChange,
    broadcastScrollSync,
  };
}
