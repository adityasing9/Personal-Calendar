import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  GraduationCap,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Flame,
  Plus,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../database/db';
import {
  LifeEvent,
  LifeTask,
  Exam,
  ShoppingItem,
  Festival,
  Subject,
  UserSettings
} from '../../types';
import { getTodayStr, calculateDaysOverdue, postponeTaskToTomorrow, carryTaskForward, keepTaskOverdue } from '../../services/carryForward';
import { formatTimeDisplay, formatShortDate } from '../../utils/dateUtils';
import { formatNepaliDisplay } from '../../utils/nepaliCalendar';
import { QuickAddType } from '../../components/modals/QuickAddModal';

interface HomeViewProps {
  events: LifeEvent[];
  tasks: LifeTask[];
  exams: Exam[];
  shoppingItems: ShoppingItem[];
  festivals: Festival[];
  subjects: Subject[];
  settings: UserSettings;
  onOpenQuickAdd: (type?: QuickAddType, date?: string) => void;
  onNavigateTab: (tab: any) => void;
  onRefreshData: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  events,
  tasks,
  exams,
  shoppingItems,
  festivals,
  subjects,
  settings,
  onOpenQuickAdd,
  onNavigateTab,
  onRefreshData
}) => {
  const todayStr = getTodayStr();
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>(todayStr);

  // 1. Overdue Tasks
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && (t.status === 'overdue' || t.dueDate < todayStr)
  );

  // 2. Tasks Due Today
  const dueTodayTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate === todayStr
  );

  // 3. Today's Events Timeline
  const todayEvents = events
    .filter((e) => e.startDate === todayStr)
    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));

  // 4. Upcoming Exams
  const upcomingExams = exams
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  // 5. Urgent Shopping Items
  const urgentShopping = shoppingItems.filter(
    (s) => s.status === 'pending' && (s.priority === 'urgent' || s.targetDate === todayStr)
  );

  // 6. Upcoming Festivals (next 14 days)
  const upcomingFestivals = festivals
    .filter((f) => f.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Handlers for Task Actions
  const handleCompleteTask = async (task: LifeTask) => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    await db.tasks.update(task.id, {
      status: 'completed',
      updatedAt: new Date().toISOString()
    });
    onRefreshData();
  };

  const handlePostponeTomorrow = async (task: LifeTask) => {
    await postponeTaskToTomorrow(task);
    onRefreshData();
  };

  const handleCarryToToday = async (task: LifeTask) => {
    await carryTaskForward(task, todayStr);
    onRefreshData();
  };

  const handleKeepOverdue = async (task: LifeTask) => {
    await keepTaskOverdue(task);
    onRefreshData();
  };

  const handleCustomReschedule = async (task: LifeTask) => {
    if (!newDueDate) return;
    await carryTaskForward(task, newDueDate);
    setRescheduleTaskId(null);
    onRefreshData();
  };

  const handleToggleEventStatus = async (event: LifeEvent) => {
    const nextStatus = event.status === 'completed' ? 'scheduled' : 'completed';
    if (nextStatus === 'completed') {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
    await db.events.update(event.id, {
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
    onRefreshData();
  };

  const getSubjectName = (subId?: string) => {
    const s = subjects.find((item) => item.id === subId);
    return s ? `${s.name} (${s.code})` : 'College';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* ======================================================== */}
      {/* 1. ATTENTION SECTION: What do I need to care about right now? */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Needs Attention
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {overdueTasks.length + dueTodayTasks.length + urgentShopping.length} items
          </span>
        </div>

        {/* Empty state if nothing urgent */}
        {overdueTasks.length === 0 && dueTodayTasks.length === 0 && urgentShopping.length === 0 && (
          <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              You're completely clear!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              No overdue tasks, immediate deadlines, or urgent purchases pending.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Overdue Tasks Cards */}
          {overdueTasks.map((task) => {
            const daysLate = calculateDaysOverdue(task.originalDueDate || task.dueDate, todayStr);
            const isEditingDate = rescheduleTaskId === task.id;

            return (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 flex flex-col justify-between shadow-xs transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Overdue ({daysLate > 0 ? `${daysLate} days late` : 'Past deadline'})
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Originally: {formatShortDate(task.originalDueDate || task.dueDate)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Reschedule Picker Modal/Drawer */}
                {isEditingDate ? (
                  <div className="mt-3 pt-3 border-t border-red-200/60 dark:border-red-900/40 flex items-center gap-2">
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <button
                      onClick={() => handleCustomReschedule(task)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setRescheduleTaskId(null)}
                      className="px-2 py-1 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-red-200/60 dark:border-red-900/40 flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </button>

                    <button
                      onClick={() => handleCarryToToday(task)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      title="Move deadline to today"
                    >
                      Move to Today
                    </button>

                    <button
                      onClick={() => handlePostponeTomorrow(task)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      title="Move to tomorrow"
                    >
                      Tomorrow
                    </button>

                    <button
                      onClick={() => {
                        setRescheduleTaskId(task.id);
                        setNewDueDate(todayStr);
                      }}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      title="Pick a custom date"
                    >
                      Pick Date
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Tasks Due Today Cards */}
          {dueTodayTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 flex flex-col justify-between shadow-xs transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due Today {task.dueTime ? `by ${formatTimeDisplay(task.dueTime)}` : ''}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                    {task.priority}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {task.title}
                </h3>

                {task.subjectId && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {getSubjectName(task.subjectId)}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between">
                <button
                  onClick={() => handleCompleteTask(task)}
                  className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Done
                </button>

                <button
                  onClick={() => handlePostponeTomorrow(task)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Postpone Tomorrow
                </button>
              </div>
            </div>
          ))}

          {/* Urgent Purchases Cards */}
          {urgentShopping.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col justify-between shadow-xs transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Urgent Purchase
                  </span>
                  {item.estimatedPrice && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      ${item.estimatedPrice}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {item.name}
                </h3>
                {item.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-between">
                <button
                  onClick={async () => {
                    confetti({ particleCount: 30, spread: 50 });
                    await db.shoppingItems.update(item.id, { status: 'purchased' });
                    onRefreshData();
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Purchased
                </button>
                <span className="text-xs text-slate-400">Target: Today</span>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. TODAY'S TIMELINE: Chronological schedule for today */}
      {/* ======================================================== */}
      <section className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Today's Schedule & Timeline
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {todayEvents.length} events scheduled for today
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenQuickAdd('event', todayStr)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {todayEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            No events scheduled for today yet.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {todayEvents.map((evt) => {
              const isDone = evt.status === 'completed';

              return (
                <div
                  key={evt.id}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-70'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  {/* Timeline dot */}
                  <span
                    className={`absolute -left-[1.85rem] sm:-left-[2.35rem] top-4 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 transition-all ${
                      isDone ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                          {evt.startTime ? formatTimeDisplay(evt.startTime) : 'All Day'}
                          {evt.endTime ? ` — ${formatTimeDisplay(evt.endTime)}` : ''}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {evt.category}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                          isDone ? 'line-through text-slate-500 dark:text-slate-400' : ''
                        }`}
                      >
                        {evt.title}
                      </h4>

                      {evt.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {evt.description}
                        </p>
                      )}

                      {evt.location && (
                        <span className="inline-block mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                          📍 {evt.location}
                        </span>
                      )}
                    </div>

                    {/* Quick action button */}
                    <button
                      onClick={() => handleToggleEventStatus(evt)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isDone
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={isDone ? 'Mark as pending' : 'Mark as completed'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 3. UPCOMING HORIZON: Exams, Milestones, Festivals */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next Upcoming Exams Countdown */}
        <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                College Exams Countdown
              </h3>
            </div>

            <button
              onClick={() => onNavigateTab('college')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              No exams scheduled right now.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.slice(0, 3).map((ex) => {
                const sub = subjects.find((s) => s.id === ex.subjectId);
                const subTitle = sub ? sub.name : 'College Subject';
                const examTime = new Date(ex.date).getTime();
                const nowTime = new Date(todayStr).getTime();
                const daysDiff = Math.round((examTime - nowTime) / (1000 * 60 * 60 * 24));
                const countdownLabel = daysDiff === 0 ? 'EXAM TODAY' : daysDiff === 1 ? '1 DAY LEFT' : `${daysDiff} DAYS LEFT`;

                return (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          {ex.type}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatShortDate(ex.date)} at {formatTimeDisplay(ex.startTime)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {subTitle}
                      </h4>
                      {ex.room && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Room: {ex.room}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block text-[11px] font-black px-2.5 py-1 rounded-full ${
                          daysDiff <= 2
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {countdownLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Festivals & Cultural Highlights */}
        <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Upcoming Festivals
              </h3>
            </div>

            <button
              onClick={() => onNavigateTab('festivals')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Festival Calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingFestivals.map((fest) => {
              const nepaliDateStr = formatNepaliDisplay(fest.date);

              return (
                <div
                  key={fest.id}
                  className="p-3.5 rounded-2xl border border-orange-200/60 dark:border-orange-900/40 bg-orange-50/30 dark:bg-orange-950/20 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                        {formatShortDate(fest.date)}
                      </span>
                      {settings.showNepaliCalendar && (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          ({nepaliDateStr})
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {fest.name}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {fest.description}
                    </p>
                  </div>

                  {fest.isHoliday && (
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      Holiday
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
