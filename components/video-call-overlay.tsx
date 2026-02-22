'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useVideoCall } from '@/hooks/use-video-call';

type CallType = 'group' | 'direct';

interface VideoCallOverlayProps {
  open: boolean;
  callType: CallType;
  roomId: string;
  title: string;
  currentUserId: string;
  currentUserName: string;
  resolveName?: (userId: string) => string;
  onClose: () => void;
}

function VideoTile({
  label,
  stream,
  muted = false,
  className,
}: {
  label: string;
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasActiveVideoTrack = Boolean(
    stream?.getVideoTracks().some((track) => track.readyState === 'live' && track.enabled)
  );

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10', className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={cn('h-full w-full object-cover', !hasActiveVideoTrack && 'hidden')}
      />
      {!hasActiveVideoTrack && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="h-20 w-20 border border-white/20">
            <AvatarFallback className="bg-zinc-800 text-white text-xl font-semibold">
              {label.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      <div className="absolute bottom-3 left-3 rounded-md bg-black/55 px-2 py-1 text-xs text-white">
        {label}
      </div>
    </div>
  );
}

export function VideoCallOverlay({
  open,
  callType,
  roomId,
  title,
  currentUserId,
  currentUserName,
  resolveName,
  onClose,
}: VideoCallOverlayProps) {
  const {
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
  } = useVideoCall({
    roomId,
    userId: currentUserId,
    enabled: open,
  });

  const participantCount = participants.length + 1;

  const remoteLabel = useMemo(() => {
    if (participants.length === 0) return title;
    const first = participants[0];
    return resolveName?.(first.userId) ?? first.userId;
  }, [participants, resolveName, title]);

  const handleClose = () => {
    leave();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-zinc-950">
      {callType === 'group' ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 text-white">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-xs text-zinc-300 flex items-center gap-1 mt-1">
                <Users className="h-3.5 w-3.5" />
                {participantCount} participant{participantCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-xs text-zinc-300">
              {status === 'connecting' ? 'Connecting...' : 'Live'}
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(220px,1fr)]">
              <VideoTile label={currentUserName + ' (You)'} stream={isCameraOff ? null : localStream} muted className="min-h-[220px]" />
              {participants.map((participant) => (
                <VideoTile
                  key={participant.socketId}
                  label={resolveName?.(participant.userId) ?? participant.userId}
                  stream={participant.stream}
                  className="min-h-[220px]"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-full w-full">
          <VideoTile label={remoteLabel} stream={participants[0]?.stream ?? null} className="h-full w-full rounded-none border-none" />
          <VideoTile
            label={`${currentUserName} (You)`}
            stream={isCameraOff ? null : localStream}
            muted
            className="absolute right-4 top-16 h-40 w-28 md:h-56 md:w-40 shadow-2xl"
          />
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between bg-black/35 px-4 py-3 text-white backdrop-blur-sm">
            <div>
              <p className="font-semibold leading-none">{title}</p>
              <p className="text-xs text-zinc-200 mt-1">
                {status === 'connecting' ? 'Connecting...' : 'On call'}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-red-500/90 px-3 py-2 text-sm text-white">
          {error}
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/55 px-4 py-3 backdrop-blur-md">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          className={cn('rounded-full text-white hover:bg-white/10', isMuted && 'bg-red-500/80 hover:bg-red-500')}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => { void flipCamera(); }}
          className="rounded-full text-white hover:bg-white/10"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={toggleCamera}
          className={cn('rounded-full text-white hover:bg-white/10', isCameraOff && 'bg-red-500/80 hover:bg-red-500')}
        >
          {isCameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={handleClose}
          className="rounded-full bg-red-600 text-white hover:bg-red-700"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
