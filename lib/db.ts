import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/mahatask.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

// Task operations
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assigned_to?: string;
  blocker_task_id?: string;
  created_at: string;
  updated_at: string;
}

export function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
  const database = getDb();
  const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const stmt = database.prepare(`
    INSERT INTO tasks (id, user_id, title, description, subject, due_date, priority, status, assigned_to, blocker_task_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, task.user_id, task.title, task.description || null, task.subject, task.due_date, task.priority, task.status, task.assigned_to || null, task.blocker_task_id || null, now, now);
  
  return {
    ...task,
    id,
    created_at: now,
    updated_at: now
  };
}

export function getTasksByUser(userId: string): Task[] {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC');
  return stmt.all(userId) as Task[];
}

export function getTaskById(taskId: string): Task | undefined {
  const database = getDb();
  const stmt = database.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(taskId) as Task | undefined;
}

export function updateTask(taskId: string, updates: Partial<Task>): Task | undefined {
  const database = getDb();
  const now = new Date().toISOString();
  
  const allowed = ['title', 'description', 'subject', 'due_date', 'priority', 'status', 'assigned_to', 'blocker_task_id'];
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(updates).forEach(([key, value]) => {
    if (allowed.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  fields.push('updated_at = ?');
  values.push(now);
  values.push(taskId);
  
  const stmt = database.prepare(`
    UPDATE tasks 
    SET ${fields.join(', ')}
    WHERE id = ?
  `);
  
  stmt.run(...values);
  return getTaskById(taskId);
}

export function deleteTask(taskId: string): boolean {
  const database = getDb();
  const stmt = database.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(taskId);
  return (result.changes ?? 0) > 0;
}

// Chat operations
export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function createMessage(roomId: string, userId: string, content: string): Message {
  const database = getDb();
  const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const stmt = database.prepare(`
    INSERT INTO messages (id, room_id, user_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, roomId, userId, content, now);
  
  return { id, room_id: roomId, user_id: userId, content, created_at: now };
}

export function getMessages(roomId: string, limit: number = 50): Message[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM messages 
    WHERE room_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  return (stmt.all(roomId, limit) as Message[]).reverse();
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export function createChatRoom(name: string, description: string | undefined, createdBy: string): ChatRoom {
  const database = getDb();
  const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const stmt = database.prepare(`
    INSERT INTO chat_rooms (id, name, description, created_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, name, description || null, createdBy, now);
  
  return { id, name, description, created_by: createdBy, created_at: now };
}

export function getChatRoomsByUser(userId: string): ChatRoom[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT cr.* FROM chat_rooms cr
    JOIN chat_room_members crm ON cr.id = crm.room_id
    WHERE crm.user_id = ?
    ORDER BY cr.created_at DESC
  `);
  return stmt.all(userId) as ChatRoom[];
}

export function addUserToRoom(roomId: string, userId: string): boolean {
  const database = getDb();
  const id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  try {
    const stmt = database.prepare(`
      INSERT INTO chat_room_members (id, room_id, user_id, joined_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, roomId, userId, now);
    return true;
  } catch {
    return false;
  }
}

// Schedule operations
export interface ScheduleSlot {
  id: string;
  user_id: string;
  task_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  type: string;
  created_at: string;
}

export function createScheduleSlot(slot: Omit<ScheduleSlot, 'id' | 'created_at'>): ScheduleSlot {
  const database = getDb();
  const id = `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const stmt = database.prepare(`
    INSERT INTO schedule_slots (id, user_id, task_id, date, start_time, end_time, title, type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, slot.user_id, slot.task_id || null, slot.date, slot.start_time, slot.end_time, slot.title, slot.type, now);
  
  return { ...slot, id, created_at: now };
}

export function getScheduleSlots(userId: string, date: string): ScheduleSlot[] {
  const database = getDb();
  const stmt = database.prepare(`
    SELECT * FROM schedule_slots
    WHERE user_id = ? AND date = ?
    ORDER BY start_time ASC
  `);
  return stmt.all(userId, date) as ScheduleSlot[];
}
