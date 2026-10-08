import React from 'react';
import {
  Home,
  Calendar,
  CheckSquare,
  GraduationCap,
  FolderGit2,
  ShoppingCart,
  Sparkles,
  BarChart3,
  FileText,
  Settings,
  Flame,
  Bot
} from 'lucide-react';

export type NavTab = 
  | 'home'
  | 'calendar'
  | 'tasks'
  | 'college'
  | 'projects'
  | 'shopping'
  | 'festivals'
  | 'insights'
  | 'notes'
  | 'assistant'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  overdueTasksCount: number;
  urgentShoppingCount: number;
  upcomingExamsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  overdueTasksCount,
  urgentShoppingCount,
  upcomingExamsCount
}) => {
  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
      badge: overdueTasksCount > 0 ? `${overdueTasksCount} alert` : undefined,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'calendar' as NavTab,
      label: 'Calendar',
      icon: Calendar
    },
    {
      id: 'tasks' as NavTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: overdueTasksCount > 0 ? String(overdueTasksCount) : undefined,
      badgeColor: 'bg-red-500 text-white'
    },
    {
      id: 'college' as NavTab,
      label: 'College',
      icon: GraduationCap,
      badge: upcomingExamsCount > 0 ? `${upcomingExamsCount} exam` : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'projects' as NavTab,
      label: 'Projects',
      icon: FolderGit2
    },
    {
      id: 'shopping' as NavTab,
      label: 'Shopping',
      icon: ShoppingCart,
      badge: urgentShoppingCount > 0 ? String(urgentShoppingCount) : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
    {
      id: 'festivals' as NavTab,
      label: 'Festivals',
      icon: Flame
    },
    {
      id: 'insights' as NavTab,
      label: 'Insights',
      icon: BarChart3
    },
    {
      id: 'notes' as NavTab,
      label: 'Notes',
      icon: FileText
    },
    {
      id: 'assistant' as NavTab,
      label: 'AI Assistant',
      icon: Bot,
      special: true
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Life Command
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Local Operating System
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Minimal Privacy Badge */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Offline & Local-first
        </span>
        <span className="font-mono text-[10px]">v1.0</span>
      </div>

    </aside>
  );
};
