import { NextRequest, NextResponse } from 'next/server';
import { createTask, getTasksByUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, subject, dueDate, priority, status, assignedTo, blockerTaskId } = body;
    
    if (!userId || !title || !subject || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const task = createTask({
      user_id: userId,
      title,
      description,
      subject,
      due_date: dueDate,
      priority: priority || 'medium',
      status: status || 'pending',
      assigned_to: assignedTo,
      blocker_task_id: blockerTaskId
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

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
    
    const tasks = getTasksByUser(userId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
