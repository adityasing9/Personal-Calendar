import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus } from 'lucide-react';

import { db, initializeDatabase, DEFAULT_SETTINGS } from './database/db';
import { processTaskDeadlines, getTodayStr } from './services/carryForward';
import { ReminderService } from './services/reminderService';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

// Modals
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { ReminderCenterModal } from './components/modals/ReminderCenterModal';
import { QuickAddModal, QuickAddType } from './components/modals/QuickAddModal';
import { OnboardingModal } from './components/modals/OnboardingModal';

// Views
import { HomeView } from './features/home/HomeView';
import { CalendarView } from './features/calendar/CalendarView';
import { TasksView } from './features/tasks/TasksView';
import { CollegeView } from './features/college/CollegeView';
import { ProjectsView } from './features/projects/ProjectsView';
import { ShoppingView } from './features/shopping/ShoppingView';
import { FestivalsView } from './features/festivals/FestivalsView';
import { InsightsView } from './features/insights/InsightsView';
import { NotesView } from './features/notes/NotesView';
import { AssistantView } from './features/ai/AssistantView';
import { SettingsView } from './features/settings/SettingsView';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<QuickAddType>('task');
  const [quickAddDate, setQuickAddDate] = useState<string | undefined>(undefined);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Live queries from Dexie IndexedDB
  const settings = useLiveQuery(() => db.settings.get('default')) || DEFAULT_SETTINGS;
  const events = useLiveQuery(() => db.events.toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const projects = useLiveQuery(() => db.projects.toArray()) || [];
  const milestones = useLiveQuery(() => db.milestones.toArray()) || [];
  const subjects = useLiveQuery(() => db.subjects.toArray()) || [];
  const exams = useLiveQuery(() => db.exams.toArray()) || [];
  const shoppingItems = useLiveQuery(() => db.shoppingItems.toArray()) || [];
  const festivals = useLiveQuery(() => db.festivals.toArray()) || [];
  const notes = useLiveQuery(() => db.notes.toArray()) || [];
  const reminders = useLiveQuery(() => db.reminders.toArray()) || [];

  // Initialize DB & Process Deadlines on startup
  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      await processTaskDeadlines();
      await ReminderService.checkDueReminders();

      const userSettings = await db.settings.get('default');
      if (userSettings && !userSettings.hasCompletedOnboarding) {
        setIsOnboardingOpen(true);
      }
    };
    init();

    // Periodic reminder check every 30 seconds
    const interval = setInterval(() => {
      ReminderService.checkDueReminders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculated badge counts
  const todayStr = getTodayStr();
  const overdueTasksCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled' && (t.status === 'overdue' || t.dueDate < todayStr)
  ).length;

  const urgentShoppingCount = shoppingItems.filter(
    (s) => s.status === 'pending' && (s.priority === 'urgent' || s.targetDate === todayStr)
  ).length;

  const upcomingExamsCount = exams.filter((e) => e.date >= todayStr).length;

  const activeRemindersCount = reminders.filter((r) => r.status === 'triggered').length;

  const handleOpenQuickAdd = (type?: QuickAddType, date?: string) => {
    setQuickAddType(type || 'task');
    setQuickAddDate(date);
    setIsQuickAddOpen(true);
  };

  const handleToggleTheme = async () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    await db.settings.update('default', { theme: nextTheme });
  };

  const refreshTrigger = () => {
    // triggers automatic re-render via liveQuery
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Header */}
      <Header
        currentDate={currentDate}
        settings={settings}
        activeRemindersCount={activeRemindersCount}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenQuickAdd={() => handleOpenQuickAdd('task')}
        onOpenReminders={() => setIsReminderCenterOpen(true)}
        onOpenAssistant={() => setCurrentTab('assistant')}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main App Body with Sidebar & Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          overdueTasksCount={overdueTasksCount}
          urgentShoppingCount={urgentShoppingCount}
          upcomingExamsCount={upcomingExamsCount}
        />

        {/* Dynamic View Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto min-w-0">
          {currentTab === 'home' && (
            <HomeView
              events={events}
              tasks={tasks}
              exams={exams}
              shoppingItems={shoppingItems}
              festivals={festivals}
              subjects={subjects}
              settings={settings}
              onOpenQuickAdd={handleOpenQuickAdd}
              onNavigateTab={setCurrentTab}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              events={events}
              tasks={tasks}
              exams={exams}
              shoppingItems={shoppingItems}
              festivals={festivals}
              settings={settings}
              onOpenQuickAdd={handleOpenQuickAdd}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              subjects={subjects}
              projects={projects}
              onOpenQuickAdd={handleOpenQuickAdd}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'college' && (
            <CollegeView
              subjects={subjects}
              exams={exams}
              tasks={tasks}
              onOpenQuickAdd={handleOpenQuickAdd}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              projects={projects}
              milestones={milestones}
              tasks={tasks}
              onOpenQuickAdd={handleOpenQuickAdd}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'shopping' && (
            <ShoppingView
              items={shoppingItems}
              onOpenQuickAdd={handleOpenQuickAdd}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'festivals' && (
            <FestivalsView
              festivals={festivals}
              settings={settings}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'insights' && (
            <InsightsView
              tasks={tasks}
              events={events}
              exams={exams}
              projects={projects}
              shoppingItems={shoppingItems}
            />
          )}

          {currentTab === 'notes' && (
            <NotesView
              notes={notes}
              onOpenQuickAdd={handleOpenQuickAdd}
              onRefreshData={refreshTrigger}
            />
          )}

          {currentTab === 'assistant' && (
            <AssistantView onRefreshData={refreshTrigger} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onRefreshData={refreshTrigger}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        overdueTasksCount={overdueTasksCount}
      />

      {/* Floating Action Button (Mobile only) */}
      <button
        onClick={() => handleOpenQuickAdd('task')}
        className="md:hidden fixed right-4 bottom-20 z-40 p-3.5 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
        title="Quick Add"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={setCurrentTab}
      />

      <ReminderCenterModal
        isOpen={isReminderCenterOpen}
        onClose={() => setIsReminderCenterOpen(false)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialType={quickAddType}
        initialDate={quickAddDate}
        onSuccess={refreshTrigger}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => setIsOnboardingOpen(false)}
      />

    </div>
  );
}

export default App;
