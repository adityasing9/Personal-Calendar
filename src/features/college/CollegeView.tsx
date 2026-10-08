import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  FileCheck,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../database/db';
import { Subject, Exam, LifeTask } from '../../types';
import { getTodayStr } from '../../services/carryForward';
import { formatShortDate, formatTimeDisplay } from '../../utils/dateUtils';
import { QuickAddType } from '../../components/modals/QuickAddModal';

interface CollegeViewProps {
  subjects: Subject[];
  exams: Exam[];
  tasks: LifeTask[];
  onOpenQuickAdd: (type?: QuickAddType, date?: string) => void;
  onRefreshData: () => void;
}

export const CollegeView: React.FC<CollegeViewProps> = ({
  subjects,
  exams,
  tasks,
  onOpenQuickAdd,
  onRefreshData
}) => {
  const todayStr = getTodayStr();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'subject'>('date');

  // New Subject Modal State
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subFaculty, setSubFaculty] = useState('');
  const [subCredits, setSubCredits] = useState('4');
  const [subNotes, setSubNotes] = useState('');

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim()) return;

    await db.subjects.put({
      id: `sub-${Date.now()}`,
      name: subName.trim(),
      code: subCode.trim(),
      faculty: subFaculty.trim() || undefined,
      credits: subCredits ? parseInt(subCredits, 10) : 4,
      notes: subNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    });

    setSubName('');
    setSubCode('');
    setSubFaculty('');
    setSubNotes('');
    setShowAddSubject(false);
    onRefreshData();
  };

  const handleTogglePrepStatus = async (exam: Exam) => {
    const nextStatus =
      exam.preparationStatus === 'not_started'
        ? 'revising'
        : exam.preparationStatus === 'revising'
        ? 'ready'
        : 'not_started';

    if (nextStatus === 'ready') {
      confetti({ particleCount: 30, spread: 50 });
    }

    await db.exams.update(exam.id, { preparationStatus: nextStatus });
    onRefreshData();
  };

  // Filter exams
  let filteredExams = exams;
  if (selectedSubjectId !== 'all') {
    filteredExams = filteredExams.filter((e) => e.subjectId === selectedSubjectId);
  }

  // Sort exams
  filteredExams.sort((a, b) => {
    if (sortBy === 'date') return a.date.localeCompare(b.date);
    const subA = subjects.find((s) => s.id === a.subjectId)?.name || '';
    const subB = subjects.find((s) => s.id === b.subjectId)?.name || '';
    return subA.localeCompare(subB);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            College & Academics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Semester courses, exam countdowns, IA schedules, and lab reviews
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSubject(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('exam')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Exam</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. UPCOMING EXAMS SECTION */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Exam Schedule & Live Countdowns
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
              {filteredExams.length}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Filter:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No exams scheduled matching your selection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((ex) => {
              const sub = subjects.find((s) => s.id === ex.subjectId);
              const examDate = new Date(ex.date).getTime();
              const nowDate = new Date(todayStr).getTime();
              const diffDays = Math.round((examDate - nowDate) / (1000 * 60 * 60 * 24));

              const isExamToday = diffDays === 0;
              const isExamPast = diffDays < 0;
              const countdown = isExamToday
                ? 'EXAM TODAY'
                : isExamPast
                ? 'COMPLETED'
                : diffDays === 1
                ? '1 DAY LEFT'
                : `${diffDays} DAYS LEFT`;

              return (
                <div
                  key={ex.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                        {ex.type} Exam
                      </span>

                      <span
                        className={`text-[11px] font-black px-2.5 py-1 rounded-full ${
                          isExamToday
                            ? 'bg-red-600 text-white animate-pulse'
                            : isExamPast
                            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            : diffDays <= 3
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                        }`}
                      >
                        {countdown}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {sub?.name || 'Subject Exam'}
                    </h4>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                      {sub?.code}
                    </p>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatShortDate(ex.date)}</span>
                        {ex.startTime && <span>at {formatTimeDisplay(ex.startTime)}</span>}
                      </div>

                      {ex.room && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hall / Room: {ex.room}</span>
                        </div>
                      )}

                      {ex.syllabus && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mt-2 text-[11px]">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                            Syllabus / Units:
                          </span>
                          <span className="line-clamp-2">{ex.syllabus}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preparation Status Toggle */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Prep Status:</span>
                    <button
                      onClick={() => handleTogglePrepStatus(ex)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        ex.preparationStatus === 'ready'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : ex.preparationStatus === 'revising'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {ex.preparationStatus === 'ready'
                        ? 'Ready / Revised'
                        : ex.preparationStatus === 'revising'
                        ? 'Revising'
                        : 'Not Started'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. SUBJECTS LIST */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Enrolled Subjects & Faculty
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const subjectExams = exams.filter((e) => e.subjectId === sub.id);
            const pendingSubTasks = tasks.filter((t) => t.subjectId === sub.id && t.status !== 'completed');

            return (
              <div
                key={sub.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {sub.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {sub.credits} Credits
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {sub.name}
                  </h4>

                  {sub.faculty && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Faculty: {sub.faculty}
                    </p>
                  )}

                  {sub.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                      {sub.notes}
                    </p>
                  )}
                </div>

                {/* Subject Stats */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Exams Scheduled: <strong>{subjectExams.length}</strong></span>
                  <span>Pending Work: <strong>{pendingSubTasks.length}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddSubject(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add College Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Credits</label>
                  <input
                    type="number"
                    value={subCredits}
                    onChange={(e) => setSubCredits(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Faculty / Professor</label>
                <input
                  type="text"
                  value={subFaculty}
                  onChange={(e) => setSubFaculty(e.target.value)}
                  placeholder="e.g. Dr. K. Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
