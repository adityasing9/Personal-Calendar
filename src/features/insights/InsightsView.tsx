import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  GraduationCap,
  FolderGit2,
  Calendar
} from 'lucide-react';
import { LifeEvent, LifeTask, Exam, Project, ShoppingItem } from '../../types';
import { getTodayStr } from '../../services/carryForward';

interface InsightsViewProps {
  tasks: LifeTask[];
  events: LifeEvent[];
  exams: Exam[];
  projects: Project[];
  shoppingItems: ShoppingItem[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  tasks,
  events,
  exams,
  projects,
  shoppingItems
}) => {
  const todayStr = getTodayStr();

  // Task metrics
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && (t.status === 'overdue' || t.dueDate < todayStr)
  );
  const upcomingTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate > todayStr);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Category Distribution
  const collegeTasks = tasks.filter((t) => t.category === 'college' && t.status !== 'completed');
  const projectTasks = tasks.filter((t) => t.category === 'project' && t.status !== 'completed');
  const personalTasks = tasks.filter((t) => t.category === 'personal' && t.status !== 'completed');

  // Next 48 hours deadlines
  const next48HoursDeadlines = tasks.filter((t) => {
    if (t.status === 'completed') return false;
    const diff = new Date(t.dueDate).getTime() - new Date(todayStr).getTime();
    return diff >= 0 && diff <= 2 * 24 * 60 * 60 * 1000;
  });

  // Upcoming exams in next 14 days
  const upcomingExams = exams.filter((e) => {
    const diff = new Date(e.date).getTime() - new Date(todayStr).getTime();
    return diff >= 0 && diff <= 14 * 24 * 60 * 60 * 1000;
  });

  // Derived Smart Insights based entirely on local data
  const derivedInsights: string[] = [];

  if (overdueTasks.length > 0) {
    derivedInsights.push(`You have ${overdueTasks.length} overdue task(s) that need immediate resolution or carry-forward.`);
  }

  if (next48HoursDeadlines.length > 0) {
    derivedInsights.push(`You have ${next48HoursDeadlines.length} deadline(s) within the next 48 hours.`);
  }

  if (collegeTasks.length >= projectTasks.length && collegeTasks.length > 0) {
    derivedInsights.push('Most of your pending work this week is college-related (assignments & exams).');
  } else if (projectTasks.length > 0) {
    derivedInsights.push('Most of your active focus is currently concentrated on project milestones.');
  }

  if (upcomingExams.length > 0) {
    derivedInsights.push(`You have ${upcomingExams.length} upcoming college exam(s) in the next two weeks.`);
  }

  if (completionRate >= 60) {
    derivedInsights.push(`Strong completion velocity: ${completionRate}% of all recorded tasks are completed.`);
  } else {
    derivedInsights.push(`Focus tip: Tackle 1-2 small tasks early today to build momentum.`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Productivity & Weekly Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real metrics calculated strictly from your local data
        </p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedTasks.length}</p>
          <span className="text-[11px] text-slate-400">{completionRate}% total rate</span>
        </div>

        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Pending</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{pendingTasks.length}</p>
          <span className="text-[11px] text-slate-400">Active tasks</span>
        </div>

        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">{overdueTasks.length}</p>
          <span className="text-[11px] text-slate-400">Needs attention</span>
        </div>

        <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-slate-400">Exams</span>
            <GraduationCap className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{upcomingExams.length}</p>
          <span className="text-[11px] text-slate-400">Next 14 days</span>
        </div>
      </div>

      {/* Real Local Insights List */}
      <div className="p-6 rounded-3xl border border-blue-200/70 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Personal Actionable Insights
          </h3>
        </div>

        <div className="space-y-2">
          {derivedInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Progress Breakdown */}
      <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Workload Breakdown by Category
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1 font-semibold">
              <span className="text-rose-600 dark:text-rose-400">College ({collegeTasks.length} pending)</span>
              <span>{Math.round((collegeTasks.length / (pendingTasks.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full"
                style={{ width: `${Math.min(100, (collegeTasks.length / (pendingTasks.length || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-semibold">
              <span className="text-purple-600 dark:text-purple-400">Projects ({projectTasks.length} pending)</span>
              <span>{Math.round((projectTasks.length / (pendingTasks.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${Math.min(100, (projectTasks.length / (pendingTasks.length || 1)) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">Personal & Shopping ({personalTasks.length} pending)</span>
              <span>{Math.round((personalTasks.length / (pendingTasks.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (personalTasks.length / (pendingTasks.length || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
