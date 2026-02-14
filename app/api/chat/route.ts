import { NextRequest, NextResponse } from 'next/server';
import { getChatRoomsByUser, createChatRoom, addUserToRoom } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const rooms = getChatRoomsByUser(userId);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, createdBy, memberIds } = body;
    
    if (!name || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const room = createChatRoom(name, description, createdBy);
    
    // Add creator to room
    addUserToRoom(room.id, createdBy);
    
    // Add other members if provided
    if (memberIds && Array.isArray(memberIds)) {
      for (const memberId of memberIds) {
        if (memberId !== createdBy) {
          addUserToRoom(room.id, memberId);
        }
      }
    }
    
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}
