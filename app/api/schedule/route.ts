import { NextRequest, NextResponse } from 'next/server';
import { createScheduleSlot, getScheduleSlots } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    
    if (!userId || !date) {
      return NextResponse.json(
        { error: 'userId and date are required' },
        { status: 400 }
      );
    }
    
    const slots = getScheduleSlots(userId, date);
    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error fetching schedule slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, taskId, date, startTime, endTime, title, type } = body;
    
    if (!userId || !date || !startTime || !endTime || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const slot = createScheduleSlot({
      user_id: userId,
      task_id: taskId,
      date,
      start_time: startTime,
      end_time: endTime,
      title,
      type: type || 'task'
    });
    
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule slot:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule slot' },
      { status: 500 }
    );
  }
}
