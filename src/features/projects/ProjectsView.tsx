import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../database/db';
import { Project, Milestone, LifeTask, Priority } from '../../types';
import { getTodayStr } from '../../services/carryForward';
import { formatShortDate } from '../../utils/dateUtils';
import { QuickAddType } from '../../components/modals/QuickAddModal';

interface ProjectsViewProps {
  projects: Project[];
  milestones: Milestone[];
  tasks: LifeTask[];
  onOpenQuickAdd: (type?: QuickAddType, date?: string) => void;
  onRefreshData: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  milestones,
  tasks,
  onOpenQuickAdd,
  onRefreshData
}) => {
  const todayStr = getTodayStr();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );

  // Milestone Add Modal
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDueDate, setMsDueDate] = useState(todayStr);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const projectMilestones = selectedProject
    ? milestones.filter((m) => m.projectId === selectedProject.id)
    : [];
  const projectTasks = selectedProject
    ? tasks.filter((t) => t.projectId === selectedProject.id)
    : [];

  const handleToggleMilestone = async (milestone: Milestone) => {
    const nextStatus = milestone.status === 'completed' ? 'pending' : 'completed';
    if (nextStatus === 'completed') {
      confetti({ particleCount: 30, spread: 50 });
    }
    await db.milestones.update(milestone.id, {
      status: nextStatus,
      progress: nextStatus === 'completed' ? 100 : 0
    });

    // Recompute project progress percentage automatically
    if (selectedProject) {
      const allMs = milestones.filter(m => m.projectId === selectedProject.id);
      const completedCount = allMs.filter(m => m.id === milestone.id ? nextStatus === 'completed' : m.status === 'completed').length;
      const newProgress = Math.round((completedCount / allMs.length) * 100);
      await db.projects.update(selectedProject.id, { progress: newProgress });
    }

    onRefreshData();
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim() || !selectedProject) return;

    await db.milestones.put({
      id: `ms-${Date.now()}`,
      projectId: selectedProject.id,
      title: msTitle.trim(),
      dueDate: msDueDate || undefined,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    });

    setMsTitle('');
    setShowAddMilestone(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Project Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active codebases, milestones, progress tracking, and deadlines
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('project')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj) => {
          const isSelected = selectedProject?.id === proj.id;
          const deadlineTime = proj.deadline ? new Date(proj.deadline).getTime() : 0;
          const nowTime = new Date(todayStr).getTime();
          const daysLeft = proj.deadline ? Math.round((deadlineTime - nowTime) / (1000 * 60 * 60 * 24)) : null;

          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800 shadow-md ring-1 ring-purple-500'
                  : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    {proj.status}
                  </span>
                  {daysLeft !== null && (
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due Today' : `${daysLeft} days left`}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {proj.name}
                </h3>
                {proj.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-5 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Progress</span>
                  <span className="text-purple-600 dark:text-purple-400">{proj.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Deep Dive & Milestones */}
      {selectedProject && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedProject.name} — Milestones & Work
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {selectedProject.progress}% complete
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deadline: {selectedProject.deadline ? formatShortDate(selectedProject.deadline) : 'No target set'}
              </p>
            </div>

            <button
              onClick={() => setShowAddMilestone(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Milestone</span>
            </button>
          </div>

          {/* Milestones Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Milestones ({projectMilestones.filter((m) => m.status === 'completed').length}/{projectMilestones.length})
            </h4>

            {projectMilestones.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No milestones defined for this project yet.</p>
            ) : (
              <div className="space-y-2">
                {projectMilestones.map((m) => {
                  const isDone = m.status === 'completed';
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(m)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-70'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>

                      {m.dueDate && (
                        <span className="text-xs font-medium text-slate-400 shrink-0">
                          {formatShortDate(m.dueDate)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Linked Tasks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Linked Tasks ({projectTasks.length})
            </h4>
            {projectTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No tasks explicitly assigned to this project.</p>
            ) : (
              <div className="space-y-2">
                {projectTasks.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</span>
                    <span className="text-slate-400">Due: {formatShortDate(t.dueDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddMilestone(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Milestone</h3>
            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  placeholder="e.g. RAG testing & benchmarking"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Target Date</label>
                <input
                  type="date"
                  value={msDueDate}
                  onChange={(e) => setMsDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
