'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/lib/api-config';
import { getToken } from '@/lib/api-client';

type SignalPayload =
  | { type: 'offer'; sdp: RTCSessionDescriptionInit }
  | { type: 'answer'; sdp: RTCSessionDescriptionInit }
  | { type: 'candidate'; candidate: RTCIceCandidateInit };

export interface RemoteParticipant {
  socketId: string;
  userId: string;
  stream: MediaStream | null;
}

interface UseVideoCallOptions {
  roomId: string;
  userId: string;
  enabled: boolean;
}

interface UseVideoCallReturn {
  status: 'idle' | 'connecting' | 'connected' | 'error';
  error: string | null;
  localStream: MediaStream | null;
  participants: RemoteParticipant[];
  isMuted: boolean;
  isCameraOff: boolean;
  toggleMute: () => void;
  toggleCamera: () => void;
  flipCamera: () => Promise<void>;
  leave: () => void;
}

const STUN_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }];
const EMPTY_STREAM_ERROR = 'No microphone/camera stream available';

export function useVideoCall(options: UseVideoCallOptions): UseVideoCallReturn {
  const { roomId, userId, enabled } = options;
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participantsMap, setParticipantsMap] = useState<Map<string, RemoteParticipant>>(new Map());
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const peerUserRef = useRef<Map<string, string>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const getMediaErrorMessage = (error: unknown): string => {
    const name = (error as DOMException | undefined)?.name;
    if (name === 'NotAllowedError') return 'Camera/microphone access was blocked by browser permission';
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'Requested camera/microphone device not found';
    if (name === 'NotReadableError' || name === 'TrackStartError') return 'Camera/microphone is being used by another app';
    if (name === 'OverconstrainedError') return 'Selected camera constraints are not supported on this device';
    return 'Unable to access camera/microphone devices';
  };

  const getBestEffortMedia = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Browser does not support media devices API');
    }

    let hasAudioInput = true;
    let hasVideoInput = true;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasAudioInput = devices.some((d) => d.kind === 'audioinput');
      hasVideoInput = devices.some((d) => d.kind === 'videoinput');
    } catch {
      // Keep optimistic defaults if enumerate fails.
    }

    let lastError: unknown;

    if (hasAudioInput && hasVideoInput) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
      } catch (error) {
        lastError = error;
      }
    }

    if (hasVideoInput) {
      try {
        const videoOnly = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });
        setError('Microphone unavailable. Joined with camera only.');
        return videoOnly;
      } catch (error) {
        lastError = error;
      }
    }

    if (hasAudioInput) {
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        setError('Camera unavailable. Joined with microphone only.');
        return audioOnly;
      } catch (error) {
        lastError = error;
      }
    }

    throw new Error(lastError ? getMediaErrorMessage(lastError) : EMPTY_STREAM_ERROR);
  }, []);

  const participants = useMemo(() => Array.from(participantsMap.values()), [participantsMap]);

  const clearPeer = useCallback((socketId: string) => {
    const pc = peersRef.current.get(socketId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
      peersRef.current.delete(socketId);
    }
    pendingCandidatesRef.current.delete(socketId);
    peerUserRef.current.delete(socketId);
    setParticipantsMap((prev) => {
      const next = new Map(prev);
      next.delete(socketId);
      return next;
    });
  }, []);

  const flushPendingCandidates = useCallback(async (socketId: string, pc: RTCPeerConnection) => {
    const pending = pendingCandidatesRef.current.get(socketId);
    if (!pending || pending.length === 0) return;
    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Ignore bad candidates to keep the call alive.
      }
    }
    pendingCandidatesRef.current.delete(socketId);
  }, []);

  const createPeer = useCallback(async (socketId: string, peerUserId: string, initiator: boolean) => {
    if (peersRef.current.has(socketId)) return peersRef.current.get(socketId)!;

    const stream = localStreamRef.current;
    if (!stream) {
      throw new Error('Local media stream unavailable');
    }

    const socket = socketRef.current;
    if (!socket) {
      throw new Error('Video socket unavailable');
    }

    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });
    peerUserRef.current.set(socketId, peerUserId);
    peersRef.current.set(socketId, pc);

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      socket.emit('send-signal', {
        to: socketId,
        signal: { type: 'candidate', candidate: event.candidate.toJSON() },
      });
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setParticipantsMap((prev) => {
        const next = new Map(prev);
        next.set(socketId, { socketId, userId: peerUserId, stream: remoteStream ?? null });
        return next;
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed' || pc.connectionState === 'disconnected') {
        clearPeer(socketId);
      }
    };

    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('send-signal', {
        to: socketId,
        signal: { type: 'offer', sdp: offer },
      });
    }

    return pc;
  }, [clearPeer]);

  const handleSignal = useCallback(async (fromSocketId: string, signal: SignalPayload) => {
    const socket = socketRef.current;
    if (!socket) return;

    let pc = peersRef.current.get(fromSocketId);

    if (!pc && signal.type === 'offer') {
      const peerUserId = peerUserRef.current.get(fromSocketId) ?? fromSocketId;
      pc = await createPeer(fromSocketId, peerUserId, false);
    }

    if (!pc) {
      if (signal.type === 'candidate') {
        const pending = pendingCandidatesRef.current.get(fromSocketId) ?? [];
        pending.push(signal.candidate);
        pendingCandidatesRef.current.set(fromSocketId, pending);
      }
      return;
    }

    if (signal.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      await flushPendingCandidates(fromSocketId, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('send-signal', {
        to: fromSocketId,
        signal: { type: 'answer', sdp: answer },
      });
      return;
    }

    if (signal.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      await flushPendingCandidates(fromSocketId, pc);
      return;
    }

    if (pc.remoteDescription) {
      await pc.addIceCandidate(signal.candidate);
    } else {
      const pending = pendingCandidatesRef.current.get(fromSocketId) ?? [];
      pending.push(signal.candidate);
      pendingCandidatesRef.current.set(fromSocketId, pending);
    }
  }, [createPeer, flushPendingCandidates]);

  const leave = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;

    peersRef.current.forEach((_, socketId) => clearPeer(socketId));
    peersRef.current.clear();
    peerUserRef.current.clear();
    pendingCandidatesRef.current.clear();
    setParticipantsMap(new Map());

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    localStreamRef.current = null;
    setLocalStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setStatus('idle');
  }, [clearPeer]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      leave();
    };
  }, [leave]);

  useEffect(() => {
    if (!enabled) {
      leave();
      return;
    }

    let cancelled = false;

    const start = async () => {
      setStatus('connecting');
      setError(null);

      try {
        const stream = await getBestEffortMedia();
        if (cancelled || !mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);

        const token = getToken();
        if (!token) {
          throw new Error('Missing auth token');
        }

        const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
        const socket = io(`${baseUrl}/video`, {
          auth: { token },
          query: { token },
          transports: ['websocket', 'polling'],
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 6,
          timeout: 12000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join-room', { roomId, userId });
          setStatus('connected');
        });

        socket.on('room-full', () => {
          setError('Room is full');
          setStatus('error');
        });

        socket.on('room-participants', async (event: { existingParticipants: Array<{ socketId: string; userId: string }> }) => {
          for (const participant of event.existingParticipants) {
            peerUserRef.current.set(participant.socketId, participant.userId);
          }
        });

        socket.on('user-joined', async (event: { socketId: string; userId: string }) => {
          peerUserRef.current.set(event.socketId, event.userId);
          try {
            await createPeer(event.socketId, event.userId, true);
          } catch {
            setError('Failed to connect with participant');
          }
        });

        socket.on('return-signal', async (event: { from: string; signal: SignalPayload }) => {
          try {
            await handleSignal(event.from, event.signal);
          } catch {
            setError('Signaling failed');
          }
        });

        socket.on('user-left', (event: { socketId: string }) => {
          clearPeer(event.socketId);
        });

        socket.on('disconnect', () => {
          if (enabled) {
            setStatus('connecting');
          }
        });

        socket.on('connect_error', (connectError: { message?: string }) => {
          const message = connectError?.message ?? 'Unable to connect to video signaling server';
          if (/unauthorized|jwt|token/i.test(message)) {
            setError('Video signaling rejected auth token (JWT). Check backend JWT_SECRET and frontend token');
          } else if (/invalid namespace/i.test(message)) {
            setError('Video namespace "/video" is not available on backend');
          } else {
            setError(`Unable to connect to video signaling server: ${message}`);
          }
          setStatus('error');
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to start video call';
        setError(message);
        setStatus('error');
      }
    };

    void start();

    return () => {
      cancelled = true;
      leave();
    };
  }, [enabled, roomId, userId, createPeer, handleSignal, clearPeer, leave, getBestEffortMedia]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    if (stream.getAudioTracks().length === 0) {
      setError('No microphone track available');
      return;
    }
    const nextMuted = !isMuted;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    if (stream.getVideoTracks().length === 0) {
      setError('No camera device found');
      return;
    }

    const nextCameraOff = !isCameraOff;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff;
    });
    setIsCameraOff(nextCameraOff);
  }, [isCameraOff]);

  const flipCamera = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    if (stream.getVideoTracks().length === 0) {
      setError('No camera device found');
      return;
    }

    const nextFacingMode = facingMode === 'user' ? 'environment' : 'user';
    let nextStream: MediaStream;
    try {
      nextStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { exact: nextFacingMode } },
      });
    } catch {
      try {
        nextStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      } catch {
        setError('Unable to switch camera on this device');
        return;
      }
    }

    const newVideoTrack = nextStream.getVideoTracks()[0];
    const oldVideoTrack = stream.getVideoTracks()[0];

    if (!newVideoTrack) return;

    peersRef.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) {
        void sender.replaceTrack(newVideoTrack);
      }
    });

    if (oldVideoTrack) {
      stream.removeTrack(oldVideoTrack);
      oldVideoTrack.stop();
    }
    stream.addTrack(newVideoTrack);
    setLocalStream(new MediaStream(stream.getTracks()));
    setFacingMode(nextFacingMode);
  }, [facingMode]);

  return {
    status,
    error,
    localStream,
    participants,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    flipCamera,
    leave,
  };
}
