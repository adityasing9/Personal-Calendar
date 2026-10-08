import { db } from '../database/db';
import { getTodayStr } from './carryForward';
import { Priority } from '../types';

export interface ParsedItemPreview {
  type: 'event' | 'task' | 'exam' | 'shopping';
  title: string;
  date: string;
  time?: string;
  priority: Priority;
  subjectCodeOrName?: string;
  category?: string;
  notes?: string;
  confidence: number;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
}

/**
 * Local deterministic NLP parser for natural language quick add.
 * Works 100% offline with zero latency.
 */
export function parseNaturalLanguageInput(input: string): ParsedItemPreview | null {
  const text = input.trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  const todayStr = getTodayStr();

  // 1. Determine item type
  let type: ParsedItemPreview['type'] = 'task';
  if (lower.includes('exam') || lower.includes('ia-') || lower.includes('test') || lower.includes('viva') || lower.includes('practical') || lower.includes('quiz')) {
    type = 'exam';
  } else if (lower.startsWith('buy ') || lower.startsWith('purchase ') || lower.includes('shopping') || lower.includes('order ')) {
    type = 'shopping';
  } else if (lower.includes('meeting') || lower.includes('lecture') || lower.includes('class') || lower.includes('session') || lower.includes('appointment') || lower.includes('event')) {
    type = 'event';
  }

  // 2. Extract priority
  let priority: Priority = 'medium';
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap') || type === 'exam') {
    priority = 'critical';
  } else if (lower.includes('important') || lower.includes('high priority')) {
    priority = 'high';
  } else if (lower.includes('low priority') || lower.includes('whenever')) {
    priority = 'low';
  }

  // 3. Extract Date
  let targetDate = todayStr;
  const now = new Date();

  if (lower.includes('today')) {
    targetDate = todayStr;
  } else if (lower.includes('tomorrow')) {
    const tmrw = new Date(now);
    tmrw.setDate(tmrw.getDate() + 1);
    targetDate = tmrw.toISOString().split('T')[0];
  } else if (lower.includes('day after tomorrow')) {
    const dat = new Date(now);
    dat.setDate(dat.getDate() + 2);
    targetDate = dat.toISOString().split('T')[0];
  } else {
    // Check day names (monday, tuesday, etc.)
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const matchedDayIdx = daysOfWeek.findIndex(d => lower.includes(d));
    if (matchedDayIdx !== -1) {
      const currentDay = now.getDay();
      let diff = matchedDayIdx - currentDay;
      if (diff <= 0) diff += 7; // next occurrence
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + diff);
      targetDate = futureDate.toISOString().split('T')[0];
    } else {
      // Month name match: e.g. "October 14" or "Oct 14" or "14th October"
      const monthNames = [
        { name: 'jan', month: 0 },
        { name: 'feb', month: 1 },
        { name: 'mar', month: 2 },
        { name: 'apr', month: 3 },
        { name: 'may', month: 4 },
        { name: 'jun', month: 5 },
        { name: 'jul', month: 6 },
        { name: 'aug', month: 7 },
        { name: 'sep', month: 8 },
        { name: 'oct', month: 9 },
        { name: 'nov', month: 10 },
        { name: 'dec', month: 11 }
      ];

      for (const m of monthNames) {
        const regex1 = new RegExp(`${m.name}[a-z]*\\s+(\\d{1,2})`, 'i');
        const match1 = text.match(regex1);
        if (match1) {
          const dayNum = parseInt(match1[1], 10);
          const candidate = new Date(now.getFullYear(), m.month, dayNum);
          targetDate = candidate.toISOString().split('T')[0];
          break;
        }

        const regex2 = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+${m.name}`, 'i');
        const match2 = text.match(regex2);
        if (match2) {
          const dayNum = parseInt(match2[1], 10);
          const candidate = new Date(now.getFullYear(), m.month, dayNum);
          targetDate = candidate.toISOString().split('T')[0];
          break;
        }
      }
    }
  }

  // 4. Extract Time (e.g. 10 AM, 10:30am, 17:00, 5pm)
  let time: string | undefined = undefined;
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const timeMatches = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\b/i);

  if (timeMatches) {
    let hours = parseInt(timeMatches[1], 10);
    const minutes = timeMatches[2] ? timeMatches[2] : '00';
    const ampm = timeMatches[3]?.toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    time = `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  // 5. Clean Title
  let cleanTitle = text
    .replace(/\b(on|at|by|due|for|buy|purchase)\b.*$/i, '')
    .trim();
  if (type === 'shopping' && (lower.startsWith('buy ') || lower.startsWith('purchase '))) {
    cleanTitle = text.replace(/^(buy|purchase)\s+/i, '').replace(/\b(today|tomorrow|by|on|at)\b.*$/i, '').trim();
  }
  if (!cleanTitle) cleanTitle = text;

  // Extract possible subject match (DBMS, AI, DAA, OS)
  let subjectCodeOrName: string | undefined;
  const knownSubjects = ['DBMS', 'AI', 'DAA', 'OS', 'MATH', 'DSA', 'CN'];
  for (const s of knownSubjects) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(text)) {
      subjectCodeOrName = s.toUpperCase();
      break;
    }
  }

  return {
    type,
    title: cleanTitle,
    date: targetDate,
    time,
    priority,
    subjectCodeOrName,
    confidence: 0.9
  };
}

/**
 * Local Smart Schedule Assistant.
 * Answers user productivity questions instantly using actual IndexedDB database facts.
 */
export async function queryLocalScheduleAssistant(userPrompt: string): Promise<AssistantMessage> {
  const prompt = userPrompt.toLowerCase().trim();
  const today = getTodayStr();

  const [tasks, events, exams, projects, shopping] = await Promise.all([
    db.tasks.toArray(),
    db.events.toArray(),
    db.exams.toArray(),
    db.projects.toArray(),
    db.shoppingItems.toArray()
  ]);

  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate < today);
  const dueTodayTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate === today);
  const todayEvents = events.filter(e => e.startDate === today);
  const upcomingExams = exams
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const urgentShopping = shopping.filter(s => s.status === 'pending' && s.priority === 'urgent');

  // Question 1: What do I have this week / today / upcoming?
  if (prompt.includes('this week') || prompt.includes('what do i have') || prompt.includes('schedule') || prompt.includes('today')) {
    const summaryLines: string[] = [];

    if (overdueTasks.length > 0) {
      summaryLines.push(`⚠️ You have **${overdueTasks.length} overdue task(s)** requiring immediate attention.`);
    }

    summaryLines.push(`📅 **Today's Focus:**`);
    if (dueTodayTasks.length > 0) {
      summaryLines.push(`- **Tasks Due:** ${dueTodayTasks.map(t => t.title).join(', ')}`);
    } else {
      summaryLines.push(`- No tasks strictly due today.`);
    }

    if (todayEvents.length > 0) {
      summaryLines.push(`- **Timeline Items:** ${todayEvents.map(e => `${e.startTime || 'All day'} — ${e.title}`).join(', ')}`);
    }

    if (upcomingExams.length > 0) {
      const nextExam = upcomingExams[0];
      summaryLines.push(`🎓 **Next Upcoming Exam:** ${nextExam.type} (${nextExam.date}) — ${upcomingExams.length} total scheduled.`);
    }

    if (urgentShopping.length > 0) {
      summaryLines.push(`🛒 **Urgent Purchase:** ${urgentShopping.map(s => s.name).join(', ')}`);
    }

    return {
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: summaryLines.join('\n\n'),
      timestamp: new Date().toISOString()
    };
  }

  // Question 2: What should I finish first / prioritize?
  if (prompt.includes('finish first') || prompt.includes('prioritize') || prompt.includes('what should i do')) {
    const advice: string[] = [];
    advice.push(`Here is your optimal action sequence based on real urgency:`);

    let step = 1;
    if (overdueTasks.length > 0) {
      advice.push(`${step}. **Resolve Overdue Item:** "${overdueTasks[0].title}" (Originally due ${overdueTasks[0].originalDueDate || overdueTasks[0].dueDate}).`);
      step++;
    }

    if (dueTodayTasks.length > 0) {
      const topTask = dueTodayTasks.find(t => t.priority === 'critical') || dueTodayTasks[0];
      advice.push(`${step}. **Today's Deadline:** "${topTask.title}" (${topTask.dueTime ? `due at ${topTask.dueTime}` : 'due today'}).`);
      step++;
    }

    if (upcomingExams.length > 0) {
      advice.push(`${step}. **Exam Preparation:** ${upcomingExams[0].syllabus ? `Review: ${upcomingExams[0].syllabus.slice(0, 60)}...` : `Prepare for exam on ${upcomingExams[0].date}`}`);
      step++;
    }

    if (urgentShopping.length > 0) {
      advice.push(`${step}. **Urgent Need:** Pick up "${urgentShopping[0].name}".`);
      step++;
    }

    return {
      id: 'msg-' + Date.now(),
      role: 'assistant',
      content: advice.join('\n\n'),
      timestamp: new Date().toISOString()
    };
  }

  // Question 3: Incomplete documentation / specific task reschedule
  if (prompt.includes('documentation') || prompt.includes('didn\'t finish') || prompt.includes('did not finish') || prompt.includes('reschedule')) {
    const docTask = tasks.find(t => t.title.toLowerCase().includes('documentation'));
    if (docTask) {
      return {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: `I found **"${docTask.title}"** (Status: ${docTask.status}). Would you like to carry it forward to tomorrow, pick a custom date, or keep it marked overdue?`,
        timestamp: new Date().toISOString(),
        suggestedActions: [
          { label: 'Move to Tomorrow', action: 'move_tomorrow', payload: { taskId: docTask.id } },
          { label: 'Carry to Today', action: 'carry_today', payload: { taskId: docTask.id } },
          { label: 'Keep Overdue', action: 'keep_overdue', payload: { taskId: docTask.id } }
        ]
      };
    }
  }

  // Default helpful overview
  return {
    id: 'msg-' + Date.now(),
    role: 'assistant',
    content: `I'm your local Life Calendar assistant. I can help you plan your week, organize deadlines, review exams, and quick-add items without sending private data to external servers.\n\nTry asking:\n- *"What do I have this week?"*\n- *"What should I finish first?"*\n- *"I didn't finish my documentation"*`,
    timestamp: new Date().toISOString()
  };
}
