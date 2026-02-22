'use client';

import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VideoCallIncomingProps {
  open: boolean;
  callerName: string;
  callType: 'group' | 'direct';
  onAnswer: () => void;
  onDecline: () => void;
}

export function VideoCallIncoming({
  open,
  callerName,
  callType,
  onAnswer,
  onDecline,
}: VideoCallIncomingProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 border border-white/20 mb-4">
            <AvatarFallback className="bg-zinc-800 text-white text-xl font-semibold">
              {callerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-semibold">{callerName}</p>
          <p className="text-sm text-zinc-300 mt-1 flex items-center gap-1">
            <Video className="h-4 w-4" />
            Incoming {callType === 'group' ? 'Group Video Call' : 'Video Call'}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            type="button"
            onClick={onDecline}
            className="h-12 w-12 rounded-full bg-red-600 p-0 text-white hover:bg-red-700"
            aria-label="Decline call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            onClick={onAnswer}
            className="h-12 w-12 rounded-full bg-green-600 p-0 text-white hover:bg-green-700"
            aria-label="Answer call"
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
