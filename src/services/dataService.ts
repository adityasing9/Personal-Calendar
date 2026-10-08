import { db } from '../database/db';

export interface BackupData {
  version: number;
  exportedAt: string;
  app: string;
  data: {
    events: any[];
    tasks: any[];
    projects: any[];
    milestones: any[];
    subjects: any[];
    exams: any[];
    shoppingItems: any[];
    reminders: any[];
    notes: any[];
    tags: any[];
    festivals: any[];
    settings?: any;
  };
}

export async function exportAllData(): Promise<string> {
  const [
    events,
    tasks,
    projects,
    milestones,
    subjects,
    exams,
    shoppingItems,
    reminders,
    notes,
    tags,
    festivals,
    settings
  ] = await Promise.all([
    db.events.toArray(),
    db.tasks.toArray(),
    db.projects.toArray(),
    db.milestones.toArray(),
    db.subjects.toArray(),
    db.exams.toArray(),
    db.shoppingItems.toArray(),
    db.reminders.toArray(),
    db.notes.toArray(),
    db.tags.toArray(),
    db.festivals.toArray(),
    db.settings.get('default')
  ]);

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    app: 'Personal Life Calendar PWA',
    data: {
      events,
      tasks,
      projects,
      milestones,
      subjects,
      exams,
      shoppingItems,
      reminders,
      notes,
      tags,
      festivals,
      settings
    }
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadBackupFile(jsonString: string) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `personal-life-calendar-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportValidationResult {
  valid: boolean;
  error?: string;
  summary?: {
    eventsCount: number;
    tasksCount: number;
    projectsCount: number;
    subjectsCount: number;
    examsCount: number;
    shoppingCount: number;
  };
  parsedData?: BackupData['data'];
}

export function validateBackupJson(jsonString: string): ImportValidationResult {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'File is not a valid JSON object.' };
    }

    if (!parsed.data || typeof parsed.data !== 'object') {
      return { valid: false, error: 'Backup does not contain valid data payload.' };
    }

    const { events = [], tasks = [], projects = [], subjects = [], exams = [], shoppingItems = [] } = parsed.data;

    return {
      valid: true,
      summary: {
        eventsCount: events.length,
        tasksCount: tasks.length,
        projectsCount: projects.length,
        subjectsCount: subjects.length,
        examsCount: exams.length,
        shoppingCount: shoppingItems.length
      },
      parsedData: parsed.data
    };
  } catch (err: any) {
    return { valid: false, error: 'Failed to parse JSON: ' + (err?.message || 'Syntax error') };
  }
}

export async function restoreData(data: BackupData['data']): Promise<void> {
  await db.transaction('rw', [
    db.events,
    db.tasks,
    db.projects,
    db.milestones,
    db.subjects,
    db.exams,
    db.shoppingItems,
    db.reminders,
    db.notes,
    db.tags,
    db.festivals,
    db.settings
  ], async () => {
    if (data.events?.length) await db.events.bulkPut(data.events);
    if (data.tasks?.length) await db.tasks.bulkPut(data.tasks);
    if (data.projects?.length) await db.projects.bulkPut(data.projects);
    if (data.milestones?.length) await db.milestones.bulkPut(data.milestones);
    if (data.subjects?.length) await db.subjects.bulkPut(data.subjects);
    if (data.exams?.length) await db.exams.bulkPut(data.exams);
    if (data.shoppingItems?.length) await db.shoppingItems.bulkPut(data.shoppingItems);
    if (data.reminders?.length) await db.reminders.bulkPut(data.reminders);
    if (data.notes?.length) await db.notes.bulkPut(data.notes);
    if (data.tags?.length) await db.tags.bulkPut(data.tags);
    if (data.festivals?.length) await db.festivals.bulkPut(data.festivals);
    if (data.settings) await db.settings.put(data.settings);
  });
}
