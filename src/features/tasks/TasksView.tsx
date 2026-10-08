import React, { useState } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Trash2,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../database/db';
import { LifeTask, Priority, EventCategory, Subject, Project } from '../../types';
import { getTodayStr, calculateDaysOverdue, postponeTaskToTomorrow, carryTaskForward, keepTaskOverdue } from '../../services/carryForward';
import { formatShortDate, formatTimeDisplay } from '../../utils/dateUtils';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../../utils/categories';
import { QuickAddType } from '../../components/modals/QuickAddModal';

interface TasksViewProps {
  tasks: LifeTask[];
  subjects: Subject[];
  projects: Project[];
  onOpenQuickAdd: (type?: QuickAddType, date?: string) => void;
  onRefreshData: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  subjects,
  projects,
  onOpenQuickAdd,
  onRefreshData
}) => {
  const todayStr = getTodayStr();
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');

  // Filter tasks based on tabs
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && (t.status === 'overdue' || t.dueDate < todayStr)
  );

  const dueTodayTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate === todayStr
  );

  const upcomingTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate > todayStr
  );

  const completedTasks = tasks.filter((t) => t.status === 'completed');

  let currentList = tasks;
  if (activeTab === 'overdue') currentList = overdueTasks;
  else if (activeTab === 'today') currentList = dueTodayTasks;
  else if (activeTab === 'upcoming') currentList = upcomingTasks;
  else if (activeTab === 'completed') currentList = completedTasks;

  if (filterPriority !== 'all') {
    currentList = currentList.filter((t) => t.priority === filterPriority);
  }
  if (filterCategory !== 'all') {
    currentList = currentList.filter((t) => t.category === filterCategory);
  }

  // Carry forward all overdue tasks to today
  const handleCarryForwardAll = async () => {
    for (const t of overdueTasks) {
      await carryTaskForward(t, todayStr);
    }
    onRefreshData();
  };

  const handleToggleTaskStatus = async (task: LifeTask) => {
    const isCompleted = task.status === 'completed';
    const nextStatus = isCompleted ? 'not_started' : 'completed';
    if (!isCompleted) {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    }
    await db.tasks.update(task.id, {
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });
    onRefreshData();
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Delete this task?')) {
      await db.tasks.delete(id);
      onRefreshData();
    }
  };

  const handleQuickInlineAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const now = new Date().toISOString();
    await db.tasks.put({
      id: `task-${Date.now()}`,
      title: quickTitle.trim(),
      dueDate: todayStr,
      priority: quickPriority,
      status: 'not_started',
      category: 'college',
      createdAt: now,
      updatedAt: now
    });

    setQuickTitle('');
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Task Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organized by deadlines, subjects, and priorities
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('task')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* OVERDUE CARRY-FORWARD BANNER */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                You have {overdueTasks.length} overdue task(s)
              </h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                Tasks not finished by their original deadline can be moved to today or rescheduled.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            <button
              onClick={handleCarryForwardAll}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Carry All to Today</span>
            </button>
          </div>
        </div>
      )}

      {/* Fast Inline Quick Add Bar */}
      <form
        onSubmit={handleQuickInlineAdd}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="+ Quick add a task due today (e.g. Finish DBMS notes)..."
          className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden"
        />
        <select
          value={quickPriority}
          onChange={(e) => setQuickPriority(e.target.value as Priority)}
          className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
        >
          Add
        </button>
      </form>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All', count: tasks.length },
            { id: 'overdue', label: 'Overdue', count: overdueTasks.length, badgeColor: 'bg-red-500 text-white' },
            { id: 'today', label: 'Due Today', count: dueTodayTasks.length },
            { id: 'upcoming', label: 'Upcoming', count: upcomingTasks.length },
            { id: 'completed', label: 'Completed', count: completedTasks.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="p-10 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nothing pending. You're clear.
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Add a new task using the quick add bar above.
            </p>
          </div>
        ) : (
          currentList.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = !isCompleted && (task.status === 'overdue' || task.dueDate < todayStr);
            const daysLate = isOverdue ? calculateDaysOverdue(task.originalDueDate || task.dueDate, todayStr) : 0;
            const priorityStyle = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const subject = subjects.find((s) => s.id === task.subjectId);
            const project = projects.find((p) => p.id === task.projectId);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-65'
                    : isOverdue
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className={`mt-0.5 p-1 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-transparent hover:border-blue-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityStyle.badgeBg} ${priorityStyle.color}`}>
                        {priorityStyle.label}
                      </span>

                      {isOverdue && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300">
                          {daysLate > 0 ? `${daysLate}d Overdue` : 'Overdue'}
                        </span>
                      )}

                      {task.carriedForward && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                          Carried Forward (Orig: {formatShortDate(task.originalDueDate!)})
                        </span>
                      )}

                      {subject && (
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          🎓 {subject.code}
                        </span>
                      )}

                      {project && (
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                          📁 {project.name}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                        isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {formatShortDate(task.dueDate)} {task.dueTime ? `at ${formatTimeDisplay(task.dueTime)}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {isOverdue && (
                    <button
                      onClick={() => carryTaskForward(task, todayStr).then(onRefreshData)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      title="Move deadline to today"
                    >
                      Today
                    </button>
                  )}

                  <button
                    onClick={() => postponeTaskToTomorrow(task).then(onRefreshData)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                    title="Move deadline to tomorrow"
                  >
                    Tomorrow
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
