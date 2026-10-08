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
  demoDataSeeded: false,
  lastCheckedDate: new Date().toISOString().split('T')[0]
};

export async function initializeDatabase() {
  const currentSettings = await db.settings.get('default');
  if (!currentSettings) {
    await db.settings.put(DEFAULT_SETTINGS);
  }

  const festivalsCount = await db.festivals.count();
  if (festivalsCount === 0) {
    await db.festivals.bulkPut(INITIAL_FESTIVALS);
  }

  // Only seed demo data if it has NEVER been initialized before
  const settings = (await db.settings.get('default')) || DEFAULT_SETTINGS;
  if (!settings.demoDataSeeded) {
    const eventsCount = await db.events.count();
    const tasksCount = await db.tasks.count();
    if (eventsCount === 0 && tasksCount === 0) {
      await seedDemoData();
    }
  }
}

export async function seedDemoData() {
  const now = new Date();
  const nowIso = now.toISOString();

  // Helper to generate dynamic YYYY-MM-DD relative to today
  const addDays = (days: number): string => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = addDays(0);
  const twoDaysAgoStr = addDays(-2);
  const tomorrowStr = addDays(1);
  const inTwoDaysStr = addDays(2);
  const inFiveDaysStr = addDays(5);
  const inSevenDaysStr = addDays(7);
  const inFourteenDaysStr = addDays(14);

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
      createdAt: nowIso
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
      createdAt: nowIso
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
      createdAt: nowIso
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
      createdAt: nowIso
    }
  ];

  // Exams
  const exams: Exam[] = [
    {
      id: 'exam-dbms-ia3',
      subjectId: 'sub-dbms',
      type: 'IA',
      date: inFiveDaysStr,
      startTime: '10:00',
      endTime: '11:30',
      room: 'LH-302',
      syllabus: 'Transactions, ACID Properties, Concurrency Control, 2PL, Timestamp ordering',
      notes: 'Carry scientific calculator and ID card.',
      preparationStatus: 'revising',
      priority: 'critical',
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'exam-ai-review',
      subjectId: 'sub-ai',
      type: 'Presentation',
      date: inSevenDaysStr,
      startTime: '14:00',
      endTime: '16:00',
      room: 'CS Lab 4',
      syllabus: 'Live prototype demo of StudyAI embeddings & RAG retrieval accuracy.',
      notes: 'Prepare 10 slide deck and demo video fallback.',
      preparationStatus: 'revising',
      priority: 'high',
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'exam-daa-lab',
      subjectId: 'sub-daa',
      type: 'Lab',
      date: inFourteenDaysStr,
      startTime: '09:30',
      endTime: '12:30',
      room: 'Algorithm Lab 2',
      syllabus: 'Dynamic programming & graph algorithms implementation in C++/Python.',
      preparationStatus: 'not_started',
      priority: 'medium',
      isDemo: true,
      createdAt: nowIso
    }
  ];

  // Projects & Milestones
  const projects: Project[] = [
    {
      id: 'proj-studyai',
      name: 'StudyAI',
      description: 'Intelligent multi-modal study assistant with RAG pipelines and vector search.',
      startDate: addDays(-30),
      deadline: inSevenDaysStr,
      status: 'active',
      progress: 72,
      priority: 'critical',
      tags: ['ai', 'rag', 'fullstack'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'proj-autoflow',
      name: 'AutoFlow',
      description: 'Lightweight local task automation orchestrator.',
      startDate: addDays(-15),
      deadline: addDays(25),
      status: 'planning',
      progress: 25,
      priority: 'medium',
      tags: ['automation', 'open-source'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    }
  ];

  const milestones: Milestone[] = [
    {
      id: 'ms-ui',
      projectId: 'proj-studyai',
      title: 'UI Design & Interactive Prototype',
      status: 'completed',
      progress: 100,
      dueDate: addDays(-20),
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'ms-auth',
      projectId: 'proj-studyai',
      title: 'Authentication & Session Store',
      status: 'completed',
      progress: 100,
      dueDate: addDays(-14),
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'ms-doc-upload',
      projectId: 'proj-studyai',
      title: 'Document Upload & Parsing',
      status: 'completed',
      progress: 100,
      dueDate: addDays(-7),
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'ms-embeddings',
      projectId: 'proj-studyai',
      title: 'Embeddings Indexing Pipeline',
      status: 'completed',
      progress: 100,
      dueDate: addDays(-3),
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'ms-rag-test',
      projectId: 'proj-studyai',
      title: 'RAG Testing & Evaluation',
      status: 'pending',
      progress: 60,
      dueDate: inTwoDaysStr,
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'ms-deploy',
      projectId: 'proj-studyai',
      title: 'Deployment & Staging Launch',
      status: 'pending',
      progress: 0,
      dueDate: inFiveDaysStr,
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'ms-docs',
      projectId: 'proj-studyai',
      title: 'StudyAI Architecture Documentation',
      status: 'pending',
      progress: 30,
      dueDate: twoDaysAgoStr,
      isDemo: true,
      createdAt: nowIso
    }
  ];

  // Tasks
  const tasks: LifeTask[] = [
    {
      id: 'task-doc-overdue',
      title: 'Finish StudyAI documentation',
      description: 'Complete architecture diagrams, API specs, and prompt engineering evaluation notes.',
      dueDate: twoDaysAgoStr,
      dueTime: '18:00',
      priority: 'critical',
      status: 'overdue',
      category: 'project',
      projectId: 'proj-studyai',
      originalDueDate: twoDaysAgoStr,
      carriedForward: false,
      tags: ['documentation', 'urgent'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'task-dbms-assignment',
      title: 'DBMS assignment - Concurrency & Transactions',
      description: 'Submit PDF with serializability schedule solutions on college portal.',
      dueDate: todayStr,
      dueTime: '23:59',
      priority: 'critical',
      status: 'not_started',
      category: 'college',
      subjectId: 'sub-dbms',
      tags: ['assignment', 'college'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'task-ai-review-prep',
      title: 'AI project review preparation',
      description: 'Draft the evaluation metrics and demo slide deck with team.',
      dueDate: tomorrowStr,
      dueTime: '10:00',
      priority: 'high',
      status: 'in_progress',
      category: 'project',
      projectId: 'proj-studyai',
      subjectId: 'sub-ai',
      tags: ['ai', 'presentation'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'task-dbms-prep',
      title: 'DBMS preparation & 2PL numericals',
      description: 'Solve past 3 years IA question papers.',
      dueDate: inTwoDaysStr,
      dueTime: '20:00',
      priority: 'high',
      status: 'not_started',
      category: 'college',
      subjectId: 'sub-dbms',
      tags: ['exam-prep'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'task-daa-set',
      title: 'DAA dynamic programming problem set',
      description: 'Solve 0/1 Knapsack and Matrix Chain Multiplication proofs.',
      dueDate: inFiveDaysStr,
      priority: 'medium',
      status: 'not_started',
      category: 'college',
      subjectId: 'sub-daa',
      tags: ['homework'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    }
  ];

  // Events
  const events: LifeEvent[] = [
    {
      id: 'event-college-lecture',
      title: 'College: Database Systems Lecture',
      description: 'In-depth session on Two-Phase Locking and Deadlock handling.',
      startDate: todayStr,
      startTime: '09:00',
      endTime: '11:00',
      allDay: false,
      category: 'college',
      priority: 'high',
      status: 'completed',
      location: 'Lecture Hall 302',
      recurrence: 'none',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'event-studyai-work',
      title: 'StudyAI Engineering Work Session',
      description: 'Debug retrieval latency and test re-ranking algorithm.',
      startDate: todayStr,
      startTime: '11:30',
      endTime: '13:30',
      allDay: false,
      category: 'project',
      priority: 'high',
      status: 'completed',
      location: 'CS Innovation Hub',
      recurrence: 'none',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'event-dbms-prep',
      title: 'DBMS preparation & revision',
      description: 'Review transaction state diagrams and strict 2PL.',
      startDate: todayStr,
      startTime: '17:00',
      endTime: '18:30',
      allDay: false,
      category: 'college',
      priority: 'high',
      status: 'scheduled',
      location: 'Library Quiet Room',
      recurrence: 'none',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'event-buy-usb',
      title: 'Buy USB cable & desk supplies',
      description: 'Pick up braided Type-C cable and sticky notes.',
      startDate: todayStr,
      startTime: '20:00',
      endTime: '20:30',
      allDay: false,
      category: 'personal',
      priority: 'critical',
      status: 'scheduled',
      location: 'Electronics Arcade',
      recurrence: 'none',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'event-ai-review-sync',
      title: 'AI Project Review with Faculty',
      startDate: tomorrowStr,
      startTime: '10:00',
      endTime: '11:00',
      allDay: false,
      category: 'college',
      priority: 'high',
      status: 'scheduled',
      location: 'Dept Conference Room',
      recurrence: 'none',
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
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
      targetDate: todayStr,
      estimatedPrice: 15,
      actualPrice: 15,
      status: 'pending',
      notes: 'Need for high-speed device testing and charging today.',
      isDemo: true,
      createdAt: nowIso
    },
    {
      id: 'shop-stand',
      name: 'Ergonomic Laptop Stand',
      quantity: '1',
      category: 'Workstation',
      priority: 'soon',
      targetDate: inFiveDaysStr,
      estimatedPrice: 35,
      status: 'pending',
      notes: 'Aluminium foldable stand for library study sessions.',
      isDemo: true,
      createdAt: nowIso
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
      createdAt: nowIso
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
      createdAt: nowIso,
      updatedAt: nowIso
    },
    {
      id: 'note-studyai-arch',
      title: 'StudyAI Architecture Decisions',
      content: 'ChromaDB local vector store with BGE-small embeddings. Chunk size 512 with 64 overlap. Streaming responses for low perceived latency.',
      linkedType: 'project',
      linkedId: 'proj-studyai',
      tags: ['architecture'],
      isDemo: true,
      createdAt: nowIso,
      updatedAt: nowIso
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

  // Mark that demo data was seeded once
  await db.settings.update('default', { demoDataSeeded: true });
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
  await db.settings.update('default', { demoDataSeeded: true });
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
  // Keep demoDataSeeded as true so clearing data stays cleared!
  await db.settings.update('default', { demoDataSeeded: true });
}
