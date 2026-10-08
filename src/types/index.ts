export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type EventCategory = 
  | 'personal' 
  | 'college' 
  | 'project' 
  | 'meeting' 
  | 'travel' 
  | 'health' 
  | 'festival' 
  | 'other';

export type RecurrenceType = 
  | 'none' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'yearly' 
  | 'weekdays' 
  | 'custom';

export interface LifeEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  allDay: boolean;
  category: EventCategory;
  priority: Priority;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  recurrence?: RecurrenceType;
  tags?: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface LifeTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  category: EventCategory;
  projectId?: string;
  subjectId?: string;
  tags?: string[];
  originalDueDate?: string;
  carriedForward?: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  deadline?: string;
  status: ProjectStatus;
  progress: number; // 0-100
  priority: Priority;
  tags?: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate?: string;
  status: 'pending' | 'completed';
  progress?: number;
  isDemo?: boolean;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester?: string;
  faculty?: string;
  credits?: number;
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export type ExamType = 
  | 'IA' 
  | 'Internal' 
  | 'Lab' 
  | 'Practical' 
  | 'SEE' 
  | 'Quiz' 
  | 'Viva' 
  | 'Presentation' 
  | 'Other';

export interface Exam {
  id: string;
  subjectId: string;
  type: ExamType;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  room?: string;
  syllabus?: string;
  notes?: string;
  preparationStatus: 'not_started' | 'revising' | 'ready';
  priority: Priority;
  isDemo?: boolean;
  createdAt: string;
}

export type ShoppingPriority = 'urgent' | 'soon' | 'later' | 'wishlist';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  priority: ShoppingPriority;
  targetDate?: string;
  estimatedPrice?: number;
  actualPrice?: number;
  status: 'pending' | 'purchased';
  notes?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  itemId: string;
  itemType: 'event' | 'task' | 'exam' | 'project' | 'shopping';
  title: string;
  targetDateTime: string; // ISO string
  offsetMinutes: number; // e.g. 0, 15, 60, 1440
  status: 'pending' | 'triggered' | 'snoozed' | 'dismissed';
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  linkedType?: 'event' | 'task' | 'project' | 'subject' | 'exam' | 'shopping' | 'general';
  linkedId?: string;
  tags?: string[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Festival {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  calendarType: 'indian' | 'nepali' | 'both';
  region?: string;
  description: string;
  isHoliday?: boolean;
  isCustom?: boolean;
}

export interface UserSettings {
  id: string; // 'default'
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  firstDayOfWeek: 0 | 1; // 0: Sunday, 1: Monday
  showNepaliCalendar: boolean;
  autoCarryForward: boolean;
  defaultPriority: Priority;
  enableNotifications: boolean;
  audioAlerts: boolean;
  aiEnabled: boolean;
  aiProvider: 'local' | 'gemini' | 'openai';
  aiApiKey?: string;
  hasCompletedOnboarding: boolean;
  lastCheckedDate: string;
}
