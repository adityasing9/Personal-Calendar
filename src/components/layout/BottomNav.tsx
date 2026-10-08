import React, { useState } from 'react';
import {
  Home,
  Calendar,
  CheckSquare,
  GraduationCap,
  FolderGit2,
  Menu,
  X,
  ShoppingCart,
  Flame,
  BarChart3,
  FileText,
  Bot,
  Settings
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  overdueTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  overdueTasksCount
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs: { id: NavTab; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Home, badge: overdueTasksCount > 0 ? `${overdueTasksCount}` : undefined },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'college', label: 'College', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 }
  ];

  const moreTabs: { id: NavTab; label: string; icon: any }[] = [
    { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
    { id: 'festivals', label: 'Festivals', icon: Flame },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile "More" Drawer Modal */}
      {showMoreMenu && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-2xl p-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">More Sections</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] transition-colors cursor-pointer ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="absolute top-0 right-1 px-1.5 py-0.2 bg-red-500 text-white text-[9px] font-bold rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] transition-colors cursor-pointer ${
            moreTabs.some((m) => m.id === currentTab)
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
