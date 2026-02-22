export type VideoCallSignalType =
  | 'invite'
  | 'decline'
  | 'end'
  | 'group-start'
  | 'group-end';
export type VideoCallConversationType = 'group' | 'direct';

export interface VideoCallSignalPayload {
  type: VideoCallSignalType;
  roomId: string;
  callType: VideoCallConversationType;
  fromUserId: string;
  fromUserName: string;
  toConversationId: string;
  createdAt: string;
}

const PREFIX = '__VIDEOCALL_SIGNAL__';

export function encodeVideoCallSignal(payload: VideoCallSignalPayload): string {
  return `${PREFIX}${JSON.stringify(payload)}`;
}

export function decodeVideoCallSignal(content: string): VideoCallSignalPayload | null {
  if (!content.startsWith(PREFIX)) return null;
  const raw = content.slice(PREFIX.length);
  try {
    const parsed = JSON.parse(raw) as VideoCallSignalPayload;
    if (!parsed?.type || !parsed?.roomId || !parsed?.callType) return null;
    return parsed;
  } catch {
    return null;
  }
}
