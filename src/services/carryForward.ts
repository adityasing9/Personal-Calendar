import { db } from '../database/db';
import { LifeTask } from '../types';

export function getTodayStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateDaysOverdue(dueDate: string, today: string = getTodayStr()): number {
  const d1 = new Date(dueDate).getTime();
  const d2 = new Date(today).getTime();
  const diffDays = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Scan database for tasks that passed their deadline and mark them as overdue,
 * or carry them forward if autoCarryForward is enabled in settings.
 */
export async function processTaskDeadlines(): Promise<{
  overdueCount: number;
  carriedCount: number;
  carriedTasks: LifeTask[];
}> {
  const today = getTodayStr();
  const settings = await db.settings.get('default');
  const autoCarry = settings?.autoCarryForward ?? true;

  const incompleteTasks = await db.tasks
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate < today)
    .toArray();

  let overdueCount = 0;
  let carriedCount = 0;
  const carriedTasks: LifeTask[] = [];

  for (const task of incompleteTasks) {
    if (autoCarry) {
      const updated: LifeTask = {
        ...task,
        dueDate: today,
        originalDueDate: task.originalDueDate || task.dueDate,
        carriedForward: true,
        status: 'in_progress',
        updatedAt: new Date().toISOString()
      };
      await db.tasks.put(updated);
      carriedCount++;
      carriedTasks.push(updated);
    } else {
      if (task.status !== 'overdue') {
        await db.tasks.update(task.id, {
          status: 'overdue',
          originalDueDate: task.originalDueDate || task.dueDate,
          updatedAt: new Date().toISOString()
        });
      }
      overdueCount++;
    }
  }

  return {
    overdueCount,
    carriedCount,
    carriedTasks
  };
}

export async function carryTaskForward(task: LifeTask, targetDate: string = getTodayStr()) {
  await db.tasks.update(task.id, {
    dueDate: targetDate,
    originalDueDate: task.originalDueDate || task.dueDate,
    carriedForward: true,
    status: 'in_progress',
    updatedAt: new Date().toISOString()
  });
}

export async function postponeTaskToTomorrow(task: LifeTask) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  await carryTaskForward(task, tomorrowStr);
}

export async function keepTaskOverdue(task: LifeTask) {
  await db.tasks.update(task.id, {
    status: 'overdue',
    originalDueDate: task.originalDueDate || task.dueDate,
    updatedAt: new Date().toISOString()
  });
}
