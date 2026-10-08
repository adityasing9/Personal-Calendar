import React from 'react';
import { Search, Bell, Plus, Sun, Moon, Sparkles } from 'lucide-react';
import { getNepaliDate } from '../../utils/nepaliCalendar';
import { getGreeting } from '../../utils/dateUtils';
import { UserSettings } from '../../types';

interface HeaderProps {
  currentDate: Date;
  settings: UserSettings;
  activeRemindersCount: number;
  onOpenSearch: () => void;
  onOpenQuickAdd: () => void;
  onOpenReminders: () => void;
  onOpenAssistant: () => void;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  settings,
  activeRemindersCount,
  onOpenSearch,
  onOpenQuickAdd,
  onOpenReminders,
  onOpenAssistant,
  onToggleTheme
}) => {
  const nepaliDate = getNepaliDate(currentDate);
  const greeting = getGreeting(currentDate);

  const formattedGregorian = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Left: Greeting & Dual Calendar Dates */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {greeting}
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500">•</span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {formattedGregorian}
            </h1>
          </div>

          {settings.showNepaliCalendar && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="tracking-wide text-slate-700 dark:text-slate-300">
                {nepaliDate.formattedNepali}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ({nepaliDate.formattedShortEnglish})
              </span>
            </div>
          )}
        </div>

        {/* Center / Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Global Search (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline text-xs font-medium text-slate-500 dark:text-slate-400">Search</span>
            <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* AI Assistant Quick Pill */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/40 dark:to-blue-950/40 border border-purple-200/60 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 hover:shadow-xs transition-all cursor-pointer"
            title="Assistant & NLP Quick Add"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">Assistant</span>
          </button>

          {/* Reminder Center Bell */}
          <button
            onClick={onOpenReminders}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Reminder Center"
          >
            <Bell className="w-5 h-5" />
            {activeRemindersCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-bounce">
                {activeRemindersCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={`Toggle Theme (Current: ${settings.theme})`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Persistent Quick Add Button */}
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>

        </div>
      </div>
    </header>
  );
};
