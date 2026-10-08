import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Calendar,
  Sparkles,
  Tag
} from 'lucide-react';
import { db } from '../../database/db';
import { Note } from '../../types';
import { formatShortDate } from '../../utils/dateUtils';
import { QuickAddType } from '../../components/modals/QuickAddModal';

interface NotesViewProps {
  notes: Note[];
  onOpenQuickAdd: (type?: QuickAddType) => void;
  onRefreshData: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onOpenQuickAdd,
  onRefreshData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes.length > 0 ? notes[0] : null);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this note?')) {
      await db.notes.delete(id);
      if (selectedNote?.id === id) setSelectedNote(null);
      onRefreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            Personal Notes & Study Cheatsheets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quick memos linked to subjects, exams, or projects
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('note')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Notes List Column */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">No notes found.</div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setSelectedNote(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedNote?.id === n.id
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 shadow-xs'
                      : 'bg-white/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {n.linkedType || 'general'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatShortDate(n.createdAt)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {n.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Note Reader */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
          {selectedNote ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Linked: {selectedNote.linkedType || 'general'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedNote.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedNote.content}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Select a note on the left or click "+ New Note" to create one.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
