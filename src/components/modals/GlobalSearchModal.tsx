import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Calendar, CheckSquare, GraduationCap, FolderGit2, ShoppingCart, Flame, FileText } from 'lucide-react';
import { db } from '../../database/db';
import { NavTab } from '../layout/Sidebar';
import { formatShortDate } from '../../utils/dateUtils';

interface SearchResult {
  id: string;
  type: 'event' | 'task' | 'exam' | 'project' | 'subject' | 'shopping' | 'festival' | 'note';
  title: string;
  subtitle: string;
  date?: string;
  targetTab: NavTab;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const runSearch = async () => {
      setIsSearching(true);
      const q = query.toLowerCase().trim();

      const [events, tasks, projects, subjects, exams, shopping, notes, festivals] = await Promise.all([
        db.events.toArray(),
        db.tasks.toArray(),
        db.projects.toArray(),
        db.subjects.toArray(),
        db.exams.toArray(),
        db.shoppingItems.toArray(),
        db.notes.toArray(),
        db.festivals.toArray()
      ]);

      const items: SearchResult[] = [];

      // Events
      events.forEach((e) => {
        if (e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q)) {
          items.push({
            id: e.id,
            type: 'event',
            title: e.title,
            subtitle: e.location ? `Event • ${e.location}` : 'Event',
            date: e.startDate,
            targetTab: 'calendar'
          });
        }
      });

      // Tasks
      tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some(tag => tag.toLowerCase().includes(q))) {
          items.push({
            id: t.id,
            type: 'task',
            title: t.title,
            subtitle: `Task • Priority: ${t.priority} • Status: ${t.status}`,
            date: t.dueDate,
            targetTab: 'tasks'
          });
        }
      });

      // Subjects
      subjects.forEach((s) => {
        if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.faculty?.toLowerCase().includes(q)) {
          items.push({
            id: s.id,
            type: 'subject',
            title: `${s.name} (${s.code})`,
            subtitle: s.faculty ? `Subject • Faculty: ${s.faculty}` : 'Subject',
            targetTab: 'college'
          });
        }
      });

      // Exams
      exams.forEach((ex) => {
        const sub = subjects.find(s => s.id === ex.subjectId);
        const subName = sub ? sub.name : 'College Subject';
        if (ex.type.toLowerCase().includes(q) || subName.toLowerCase().includes(q) || ex.syllabus?.toLowerCase().includes(q)) {
          items.push({
            id: ex.id,
            type: 'exam',
            title: `${subName} ${ex.type} Exam`,
            subtitle: ex.room ? `Exam • Room: ${ex.room}` : 'College Exam',
            date: ex.date,
            targetTab: 'college'
          });
        }
      });

      // Projects
      projects.forEach((p) => {
        if (p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)) {
          items.push({
            id: p.id,
            type: 'project',
            title: p.name,
            subtitle: `Project • ${p.progress}% completed`,
            date: p.deadline,
            targetTab: 'projects'
          });
        }
      });

      // Shopping
      shopping.forEach((s) => {
        if (s.name.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
          items.push({
            id: s.id,
            type: 'shopping',
            title: s.name,
            subtitle: `Shopping • Priority: ${s.priority} • Est: $${s.estimatedPrice || 0}`,
            date: s.targetDate,
            targetTab: 'shopping'
          });
        }
      });

      // Festivals
      festivals.forEach((f) => {
        if (f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.region?.toLowerCase().includes(q)) {
          items.push({
            id: f.id,
            type: 'festival',
            title: f.name,
            subtitle: `Festival • ${f.region || f.calendarType}`,
            date: f.date,
            targetTab: 'festivals'
          });
        }
      });

      // Notes
      notes.forEach((n) => {
        if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
          items.push({
            id: n.id,
            type: 'note',
            title: n.title,
            subtitle: 'Personal Note',
            targetTab: 'notes'
          });
        }
      });

      setResults(items);
      setIsSearching(false);
    };

    const debounce = setTimeout(runSearch, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  const filteredResults = filterType === 'all'
    ? results
    : results.filter(r => r.type === filterType);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'subject':
      case 'exam': return <GraduationCap className="w-4 h-4 text-rose-500" />;
      case 'project': return <FolderGit2 className="w-4 h-4 text-purple-500" />;
      case 'shopping': return <ShoppingCart className="w-4 h-4 text-amber-500" />;
      case 'festival': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'note': return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, tasks, college exams, shopping, notes..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden text-sm sm:text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30 overflow-x-auto text-xs">
          {['all', 'task', 'event', 'exam', 'project', 'shopping', 'festival', 'note'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer shrink-0 ${
                filterType === f
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              {f === 'all' ? 'All Results' : f}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {isSearching ? (
            <div className="p-8 text-center text-sm text-slate-400">Searching your local data...</div>
          ) : query && filteredResults.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try another keyword or filter</p>
            </div>
          ) : !query ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium">Type something to search</p>
              <p className="text-xs text-slate-500 mt-1">Example: "DBMS", "StudyAI", "cable", "exam"</p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => {
                  onNavigateTab(item.targetTab);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {item.date && (
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0 ml-3">
                    {formatShortDate(item.date)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{filteredResults.length} item(s) found</span>
          <span>Press <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border text-slate-500">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};
