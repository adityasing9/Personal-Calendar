import Dexie, { type Table } from 'dexie';
import {
  LifeEvent,
  LifeTask,
  Project,
  Milestone,
  Subject,
  Exam,
  ShoppingItem,
  Reminder,
  Note,
  Tag,
  Festival,
  UserSettings
} from '../types';
import { INITIAL_FESTIVALS } from '../data/festivals';

export class PersonalLifeDatabase extends Dexie {
  events!: Table<LifeEvent, string>;
  tasks!: Table<LifeTask, string>;
  projects!: Table<Project, string>;
  milestones!: Table<Milestone, string>;
  subjects!: Table<Subject, string>;
  exams!: Table<Exam, string>;
  shoppingItems!: Table<ShoppingItem, string>;
  reminders!: Table<Reminder, string>;
  notes!: Table<Note, string>;
  tags!: Table<Tag, string>;
  festivals!: Table<Festival, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('PersonalLifeCalendarDB');
    this.version(1).stores({
      events: 'id, startDate, endDate, category, priority, status, recurrence',
      tasks: 'id, dueDate, priority, status, category, projectId, subjectId',
      projects: 'id, deadline, status, priority',
      milestones: 'id, projectId, dueDate, status',
      subjects: 'id, name, code',
      exams: 'id, subjectId, date, type, preparationStatus',
      shoppingItems: 'id, priority, targetDate, status, category',
      reminders: 'id, itemId, itemType, targetDateTime, status',
      notes: 'id, linkedType, linkedId',
      tags: 'id, name',
      festivals: 'id, date, calendarType',
      settings: 'id'
    });
  }
}

export const db = new PersonalLifeDatabase();

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'default',
  theme: 'system',
  accentColor: '#2563eb', // Indigo/Blue
  firstDayOfWeek: 0, // Sunday
  showNepaliCalendar: true,
  autoCarryForward: true,
  defaultPriority: 'medium',
  enableNotifications: true,
  audioAlerts: true,
  aiEnabled: false,
  aiProvider: 'local',
  aiApiKey: '',
  hasCompletedOnboarding: false,
  lastCheckedDate: '2026-10-08'
};

export async function initializeDatabase() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put(DEFAULT_SETTINGS);
  }

  const festivalsCount = await db.festivals.count();
  if (festivalsCount === 0) {
    await db.festivals.bulkPut(INITIAL_FESTIVALS);
  }

  // Check if any personal data exists; if none, populate sample demo data
  const eventsCount = await db.events.count();
  const tasksCount = await db.tasks.count();
  if (eventsCount === 0 && tasksCount === 0) {
    await seedDemoData();
  }
}

export async function seedDemoData() {
  const now = new Date().toISOString();

  // Subjects
  const subjects: Subject[] = [
    {
      id: 'sub-dbms',
      name: 'Database Management Systems',
      code: 'DBMS (CS301)',
      semester: '5th Semester',
      faculty: 'Dr. K. Sharma',
      credits: 4,
      notes: 'Focus on Relational Algebra, SQL, Normalization, ACID and 2PL protocols.',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'sub-ai',
      name: 'Artificial Intelligence & Neural Nets',
      code: 'AI (CS302)',
      semester: '5th Semester',
      faculty: 'Prof. A. Neupane',
      credits: 4,
      notes: 'Heuristic Search, Alpha-Beta Pruning, Vector Embeddings and RAG.',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'sub-daa',
      name: 'Design and Analysis of Algorithms',
      code: 'DAA (CS303)',
      semester: '5th Semester',
      faculty: 'Dr. R. Verma',
      credits: 3,
      notes: 'Greedy methods, Dynamic Programming, NP-Completeness.',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'sub-os',
      name: 'Operating Systems',
      code: 'OS (CS304)',
      semester: '5th Semester',
      faculty: 'Prof. S. Joshi',
      credits: 3,
      notes: 'Memory virtualization, paging, process synchronization, semaphores.',
      isDemo: true,
      createdAt: now
    }
  ];

  // Exams
  const exams: Exam[] = [
    {
      id: 'exam-dbms-ia3',
      subjectId: 'sub-dbms',
      type: 'IA',
      date: '2026-10-14',
      startTime: '10:00',
      endTime: '11:30',
      room: 'LH-302',
      syllabus: 'Transactions, ACID Properties, Concurrency Control, 2PL, Timestamp ordering',
      notes: 'Carry scientific calculator and ID card.',
      preparationStatus: 'revising',
      priority: 'critical',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'exam-ai-review',
      subjectId: 'sub-ai',
      type: 'Presentation',
      date: '2026-10-16',
      startTime: '14:00',
      endTime: '16:00',
      room: 'CS Lab 4',
      syllabus: 'Live prototype demo of StudyAI embeddings & RAG retrieval accuracy.',
      notes: 'Prepare 10 slide deck and demo video fallback.',
      preparationStatus: 'revising',
      priority: 'high',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'exam-daa-lab',
      subjectId: 'sub-daa',
      type: 'Lab',
      date: '2026-10-23',
      startTime: '09:30',
      endTime: '12:30',
      room: 'Algorithm Lab 2',
      syllabus: 'Dynamic programming & graph algorithms implementation in C++/Python.',
      preparationStatus: 'not_started',
      priority: 'medium',
      isDemo: true,
      createdAt: now
    }
  ];

  // Projects & Milestones
  const projects: Project[] = [
    {
      id: 'proj-studyai',
      name: 'StudyAI',
      description: 'Intelligent multi-modal study assistant with RAG pipelines and vector search.',
      startDate: '2026-09-01',
      deadline: '2026-10-18',
      status: 'active',
      progress: 72,
      priority: 'critical',
      tags: ['ai', 'rag', 'fullstack'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'proj-autoflow',
      name: 'AutoFlow',
      description: 'Lightweight local task automation orchestrator.',
      startDate: '2026-09-20',
      deadline: '2026-11-05',
      status: 'planning',
      progress: 25,
      priority: 'medium',
      tags: ['automation', 'open-source'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  const milestones: Milestone[] = [
    {
      id: 'ms-ui',
      projectId: 'proj-studyai',
      title: 'UI Design & Interactive Prototype',
      status: 'completed',
      progress: 100,
      dueDate: '2026-09-15',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'ms-auth',
      projectId: 'proj-studyai',
      title: 'Authentication & Session Store',
      status: 'completed',
      progress: 100,
      dueDate: '2026-09-22',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'ms-doc-upload',
      projectId: 'proj-studyai',
      title: 'Document Upload & Parsing',
      status: 'completed',
      progress: 100,
      dueDate: '2026-09-30',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'ms-embeddings',
      projectId: 'proj-studyai',
      title: 'Embeddings Indexing Pipeline',
      status: 'completed',
      progress: 100,
      dueDate: '2026-10-04',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'ms-rag-test',
      projectId: 'proj-studyai',
      title: 'RAG Testing & Evaluation',
      status: 'pending',
      progress: 60,
      dueDate: '2026-10-12',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'ms-deploy',
      projectId: 'proj-studyai',
      title: 'Deployment & Staging Launch',
      status: 'pending',
      progress: 0,
      dueDate: '2026-10-16',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'ms-docs',
      projectId: 'proj-studyai',
      title: 'StudyAI Architecture Documentation',
      status: 'pending',
      progress: 30,
      dueDate: '2026-10-06',
      isDemo: true,
      createdAt: now
    }
  ];

  // Tasks
  const tasks: LifeTask[] = [
    {
      id: 'task-doc-overdue',
      title: 'Finish StudyAI documentation',
      description: 'Complete architecture diagrams, API specs, and prompt engineering evaluation notes.',
      dueDate: '2026-10-06',
      dueTime: '18:00',
      priority: 'critical',
      status: 'overdue',
      category: 'project',
      projectId: 'proj-studyai',
      originalDueDate: '2026-10-06',
      carriedForward: false,
      tags: ['documentation', 'urgent'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-dbms-assignment',
      title: 'DBMS assignment - Concurrency & Transactions',
      description: 'Submit PDF with serializability schedule solutions on college portal.',
      dueDate: '2026-10-08',
      dueTime: '23:59',
      priority: 'critical',
      status: 'not_started',
      category: 'college',
      subjectId: 'sub-dbms',
      tags: ['assignment', 'college'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-ai-review-prep',
      title: 'AI project review preparation',
      description: 'Draft the evaluation metrics and demo slide deck with team.',
      dueDate: '2026-10-09',
      dueTime: '10:00',
      priority: 'high',
      status: 'in_progress',
      category: 'project',
      projectId: 'proj-studyai',
      subjectId: 'sub-ai',
      tags: ['ai', 'presentation'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-dbms-prep',
      title: 'DBMS preparation & 2PL numericals',
      description: 'Solve past 3 years IA question papers.',
      dueDate: '2026-10-10',
      dueTime: '20:00',
      priority: 'high',
      status: 'not_started',
      category: 'college',
      subjectId: 'sub-dbms',
      tags: ['exam-prep'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'task-daa-set',
      title: 'DAA dynamic programming problem set',
      description: 'Solve 0/1 Knapsack and Matrix Chain Multiplication proofs.',
      dueDate: '2026-10-13',
      priority: 'medium',
      status: 'not_started',
      category: 'college',
      subjectId: 'sub-daa',
      tags: ['homework'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  // Events
  const events: LifeEvent[] = [
    {
      id: 'event-college-lecture',
      title: 'College: Database Systems Lecture',
      description: 'In-depth session on Two-Phase Locking and Deadlock handling.',
      startDate: '2026-10-08',
      startTime: '09:00',
      endTime: '11:00',
      allDay: false,
      category: 'college',
      priority: 'high',
      status: 'completed',
      location: 'Lecture Hall 302',
      recurrence: 'none',
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'event-studyai-work',
      title: 'StudyAI Engineering Work Session',
      description: 'Debug retrieval latency and test re-ranking algorithm.',
      startDate: '2026-10-08',
      startTime: '11:30',
      endTime: '13:30',
      allDay: false,
      category: 'project',
      priority: 'high',
      status: 'completed',
      location: 'CS Innovation Hub',
      recurrence: 'none',
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'event-dbms-prep',
      title: 'DBMS preparation & revision',
      description: 'Review transaction state diagrams and strict 2PL.',
      startDate: '2026-10-08',
      startTime: '17:00',
      endTime: '18:30',
      allDay: false,
      category: 'college',
      priority: 'high',
      status: 'scheduled',
      location: 'Library Quiet Room',
      recurrence: 'none',
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'event-buy-usb',
      title: 'Buy USB cable & desk supplies',
      description: 'Pick up braided Type-C cable and sticky notes.',
      startDate: '2026-10-08',
      startTime: '20:00',
      endTime: '20:30',
      allDay: false,
      category: 'personal',
      priority: 'critical',
      status: 'scheduled',
      location: 'Electronics Arcade',
      recurrence: 'none',
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'event-ai-review-sync',
      title: 'AI Project Review with Faculty',
      startDate: '2026-10-09',
      startTime: '10:00',
      endTime: '11:00',
      allDay: false,
      category: 'college',
      priority: 'high',
      status: 'scheduled',
      location: 'Dept Conference Room',
      recurrence: 'none',
      isDemo: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  // Shopping Items
  const shopping: ShoppingItem[] = [
    {
      id: 'shop-usb',
      name: 'USB-C Cable (Braided, 60W+)',
      quantity: '1',
      category: 'Electronics',
      priority: 'urgent',
      targetDate: '2026-10-08',
      estimatedPrice: 15,
      actualPrice: 15,
      status: 'pending',
      notes: 'Need for high-speed device testing and charging today.',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'shop-stand',
      name: 'Ergonomic Laptop Stand',
      quantity: '1',
      category: 'Workstation',
      priority: 'soon',
      targetDate: '2026-10-12',
      estimatedPrice: 35,
      status: 'pending',
      notes: 'Aluminium foldable stand for library study sessions.',
      isDemo: true,
      createdAt: now
    },
    {
      id: 'shop-ssd',
      name: '1TB NVMe M.2 SSD',
      quantity: '1',
      category: 'Hardware',
      priority: 'later',
      targetDate: '',
      estimatedPrice: 85,
      status: 'pending',
      notes: 'For storing local LLM weights and vector databases.',
      isDemo: true,
      createdAt: now
    }
  ];

  // Notes
  const notes: Note[] = [
    {
      id: 'note-dbms-ia3',
      title: 'DBMS IA-3 Key Points & Cheatsheet',
      content: 'Important revision points: Transaction states (Active, Partially Committed, Failed, Aborted, Committed). ACID: Atomicity via WAL/Log, Consistency via Constraints, Isolation via Locking/2PL, Durability via Checkpointing. Conflict serializability precedence graph algorithm.',
      linkedType: 'exam',
      linkedId: 'exam-dbms-ia3',
      tags: ['dbms', 'revision'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'note-studyai-arch',
      title: 'StudyAI Architecture Decisions',
      content: 'ChromaDB local vector store with BGE-small embeddings. Chunk size 512 with 64 overlap. Streaming responses for low perceived latency.',
      linkedType: 'project',
      linkedId: 'proj-studyai',
      tags: ['architecture'],
      isDemo: true,
      createdAt: now,
      updatedAt: now
    }
  ];

  await db.subjects.bulkPut(subjects);
  await db.exams.bulkPut(exams);
  await db.projects.bulkPut(projects);
  await db.milestones.bulkPut(milestones);
  await db.tasks.bulkPut(tasks);
  await db.events.bulkPut(events);
  await db.shoppingItems.bulkPut(shopping);
  await db.notes.bulkPut(notes);
}

export async function clearDemoData() {
  await db.events.filter(e => !!e.isDemo).delete();
  await db.tasks.filter(t => !!t.isDemo).delete();
  await db.projects.filter(p => !!p.isDemo).delete();
  await db.milestones.filter(m => !!m.isDemo).delete();
  await db.subjects.filter(s => !!s.isDemo).delete();
  await db.exams.filter(e => !!e.isDemo).delete();
  await db.shoppingItems.filter(s => !!s.isDemo).delete();
  await db.notes.filter(n => !!n.isDemo).delete();
}

export async function clearAllUserData() {
  await db.events.clear();
  await db.tasks.clear();
  await db.projects.clear();
  await db.milestones.clear();
  await db.subjects.clear();
  await db.exams.clear();
  await db.shoppingItems.clear();
  await db.reminders.clear();
  await db.notes.clear();
  await db.tags.clear();
  await db.festivals.clear();
  await db.festivals.bulkPut(INITIAL_FESTIVALS);
}
