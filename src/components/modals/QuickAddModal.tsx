import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CheckSquare,
  GraduationCap,
  FolderGit2,
  ShoppingCart,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { db } from '../../database/db';
import {
  EventCategory,
  Priority,
  ExamType,
  ShoppingPriority,
  Subject,
  Project
} from '../../types';
import { getTodayStr } from '../../services/carryForward';
import { formatNepaliDisplay } from '../../utils/nepaliCalendar';
import { ReminderService } from '../../services/reminderService';

export type QuickAddType = 'event' | 'task' | 'exam' | 'project' | 'shopping' | 'note';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: QuickAddType;
  initialDate?: string;
  onSuccess?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialType = 'task',
  initialDate,
  onSuccess
}) => {
  const [selectedType, setSelectedType] = useState<QuickAddType>(initialType);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || getTodayStr());
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<EventCategory>('college');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  // Specific fields
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [examType, setExamType] = useState<ExamType>('IA');
  const [room, setRoom] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [shoppingQty, setShoppingQty] = useState('1');
  const [shoppingPriority, setShoppingPriority] = useState<ShoppingPriority>('urgent');
  const [estimatedPrice, setEstimatedPrice] = useState<string>('');
  const [addReminder, setAddReminder] = useState(true);

  // Loaded database options
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(initialType);
      if (initialDate) setDate(initialDate);
      // Load subjects & projects for dropdowns
      db.subjects.toArray().then(subs => {
        setSubjects(subs);
        if (subs.length > 0 && !selectedSubjectId) setSelectedSubjectId(subs[0].id);
      });
      db.projects.toArray().then(projs => {
        setProjects(projs);
        if (projs.length > 0 && !selectedProjectId) setSelectedProjectId(projs[0].id);
      });
    }
  }, [isOpen, initialType, initialDate]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setTime('');
    setDescription('');
    setNotes('');
    setRoom('');
    setSyllabus('');
    setEstimatedPrice('');
    setShoppingQty('1');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const id = `${selectedType}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      if (selectedType === 'task') {
        await db.tasks.put({
          id,
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: date,
          dueTime: time || undefined,
          priority,
          status: 'not_started',
          category,
          projectId: selectedProjectId || undefined,
          subjectId: selectedSubjectId || undefined,
          createdAt: now,
          updatedAt: now
        });

        if (addReminder && date) {
          const reminderTarget = time ? `${date}T${time}:00` : `${date}T09:00:00`;
          await ReminderService.createReminder({
            itemId: id,
            itemType: 'task',
            title: `Task Due: ${title}`,
            targetDateTime: new Date(reminderTarget).toISOString(),
            offsetMinutes: 0
          });
        }
      } else if (selectedType === 'event') {
        await db.events.put({
          id,
          title: title.trim(),
          description: description.trim() || undefined,
          startDate: date,
          startTime: time || undefined,
          allDay: !time,
          category,
          priority,
          status: 'scheduled',
          location: room || undefined,
          notes: notes || undefined,
          recurrence: 'none',
          createdAt: now,
          updatedAt: now
        });

        if (addReminder && date) {
          const reminderTarget = time ? `${date}T${time}:00` : `${date}T09:00:00`;
          await ReminderService.createReminder({
            itemId: id,
            itemType: 'event',
            title: `Upcoming: ${title}`,
            targetDateTime: new Date(reminderTarget).toISOString(),
            offsetMinutes: 15
          });
        }
      } else if (selectedType === 'exam') {
        await db.exams.put({
          id,
          subjectId: selectedSubjectId || (subjects[0]?.id ?? 'sub-dbms'),
          type: examType,
          date,
          startTime: time || '10:00',
          room: room.trim() || undefined,
          syllabus: syllabus.trim() || undefined,
          notes: notes.trim() || undefined,
          preparationStatus: 'not_started',
          priority: 'critical',
          createdAt: now
        });

        // Exams get sensible default reminders (1 day before + morning of exam)
        if (addReminder && date) {
          const examMorning = `${date}T08:00:00`;
          await ReminderService.createReminder({
            itemId: id,
            itemType: 'exam',
            title: `Exam Today: ${title} (${examType})`,
            targetDateTime: new Date(examMorning).toISOString(),
            offsetMinutes: 0
          });
        }
      } else if (selectedType === 'project') {
        await db.projects.put({
          id,
          name: title.trim(),
          description: description.trim() || undefined,
          startDate: getTodayStr(),
          deadline: date,
          status: 'planning',
          progress: 0,
          priority,
          createdAt: now,
          updatedAt: now
        });
      } else if (selectedType === 'shopping') {
        await db.shoppingItems.put({
          id,
          name: title.trim(),
          quantity: shoppingQty || '1',
          category: category === 'college' ? 'Study Supplies' : 'General',
          priority: shoppingPriority,
          targetDate: date,
          estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
          status: 'pending',
          notes: notes.trim() || undefined,
          createdAt: now
        });
      } else if (selectedType === 'note') {
        await db.notes.put({
          id,
          title: title.trim(),
          content: description.trim() || notes.trim() || '',
          linkedType: 'general',
          createdAt: now,
          updatedAt: now
        });
      }

      resetForm();
      onSuccess?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeTabs: { id: QuickAddType; label: string; icon: any }[] = [
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'event', label: 'Event', icon: Calendar },
    { id: 'exam', label: 'Exam', icon: GraduationCap },
    { id: 'project', label: 'Project', icon: FolderGit2 },
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'note', label: 'Note', icon: FileText }
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              Quick Add
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-1.5 gap-1">
          {typeTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedType(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {selectedType === 'project' ? 'Project Name' : selectedType === 'shopping' ? 'Item Name' : 'Title'} *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                selectedType === 'task'
                  ? 'e.g. Finish DBMS assignment'
                  : selectedType === 'exam'
                  ? 'e.g. DBMS IA-3'
                  : selectedType === 'shopping'
                  ? 'e.g. USB-C Cable'
                  : selectedType === 'project'
                  ? 'e.g. StudyAI Platform'
                  : 'e.g. Team Planning Session'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Date & Time Row (if applicable) */}
          {selectedType !== 'note' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  {selectedType === 'project' ? 'Target Deadline' : 'Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
                />
                {date && (
                  <span className="block mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Nepali: {formatNepaliDisplay(date)}
                  </span>
                )}
              </div>

              {selectedType !== 'project' && selectedType !== 'shopping' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Specific controls for Exam */}
          {selectedType === 'exam' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Exam Type
                  </label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as ExamType)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {['IA', 'Internal', 'Lab', 'Practical', 'SEE', 'Quiz', 'Viva', 'Presentation', 'Other'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Room / Hall
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="e.g. LH-302"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Syllabus / Units
                  </label>
                  <input
                    type="text"
                    value={syllabus}
                    onChange={(e) => setSyllabus(e.target.value)}
                    placeholder="e.g. Units 1, 2, 3"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specific controls for Shopping */}
          {selectedType === 'shopping' && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={shoppingPriority}
                  onChange={(e) => setShoppingPriority(e.target.value as ShoppingPriority)}
                  className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="urgent">Urgent (Today)</option>
                  <option value="soon">Soon (This week)</option>
                  <option value="later">Later (Eventually)</option>
                  <option value="wishlist">Wishlist</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Qty
                </label>
                <input
                  type="text"
                  value={shoppingQty}
                  onChange={(e) => setShoppingQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Est. Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {/* Priority & Category for Task / Event / Project */}
          {selectedType !== 'exam' && selectedType !== 'shopping' && selectedType !== 'note' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="college">College</option>
                  <option value="project">Project</option>
                  <option value="personal">Personal</option>
                  <option value="meeting">Meeting</option>
                  <option value="travel">Travel</option>
                  <option value="health">Health</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Description / Content */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              {selectedType === 'note' ? 'Content' : 'Description / Notes'} (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Notification Checkbox */}
          {selectedType !== 'note' && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={addReminder}
                onChange={(e) => setAddReminder(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Set notification / reminder in Reminder Center</span>
            </label>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow disabled:opacity-50 transition-all cursor-pointer"
            >
              Save {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
