import React, { useState } from 'react';
import { Sparkles, Calendar, Bell, Moon, Sun, ArrowRight } from 'lucide-react';
import { db } from '../../database/db';
import { UserSettings } from '../../types';
import { ReminderService } from '../../services/reminderService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState<0 | 1>(0);
  const [showNepaliCalendar, setShowNepaliCalendar] = useState(true);
  const [autoCarryForward, setAutoCarryForward] = useState(true);

  if (!isOpen) return null;

  const handleFinish = async () => {
    // Attempt notification permission if requested
    try {
      await ReminderService.requestNotificationPermission();
    } catch {
      // ignore
    }

    await db.settings.update('default', {
      theme,
      firstDayOfWeek,
      showNepaliCalendar,
      autoCarryForward,
      hasCompletedOnboarding: true
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sparkle Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome to Life Command
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            "Your personal calendar, built around your life."
          </p>
        </div>

        {/* Configuration Steps */}
        <div className="space-y-4 text-sm">
          
          {/* 1. Theme Choice */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Sparkles }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    theme === t.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Nepali Calendar Integration */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div className="pr-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Nepali Calendar (बिक्रम सम्बत)
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Display authentic Bikram Sambat dates alongside Gregorian
              </p>
            </div>
            <input
              type="checkbox"
              checked={showNepaliCalendar}
              onChange={(e) => setShowNepaliCalendar(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* 3. Automatic Carry-forward */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div className="pr-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Auto Carry-Forward
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Move incomplete tasks to the next day with original deadline history
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoCarryForward}
              onChange={(e) => setAutoCarryForward(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
          </div>

          {/* 4. First Day of Week */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                First Day of Week
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Calendar column layout preference
              </p>
            </div>
            <select
              value={firstDayOfWeek}
              onChange={(e) => setFirstDayOfWeek(Number(e.target.value) as 0 | 1)}
              className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </select>
          </div>

        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={handleFinish}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
          >
            Skip Setup
          </button>

          <button
            onClick={handleFinish}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Start Organizing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
