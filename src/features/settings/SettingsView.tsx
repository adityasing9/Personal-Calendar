import React, { useState, useRef } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Sparkles,
  Bell,
  Volume2,
  Calendar,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Bot
} from 'lucide-react';
import { db, seedDemoData, clearDemoData, clearAllUserData } from '../../database/db';
import { UserSettings } from '../../types';
import {
  exportAllData,
  downloadBackupFile,
  validateBackupJson,
  restoreData,
  ImportValidationResult
} from '../../services/dataService';

interface SettingsViewProps {
  settings: UserSettings;
  onRefreshData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onRefreshData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<ImportValidationResult | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);

  // Danger zone state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');

  // Update Settings in DB
  const updateSetting = async (fields: Partial<UserSettings>) => {
    await db.settings.update('default', fields);
    onRefreshData();
  };

  // Export
  const handleExport = async () => {
    const jsonStr = await exportAllData();
    downloadBackupFile(jsonStr);
  };

  // File selected for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupJson(content);
      setImportPreview(validation);
    };
    reader.readAsText(file);
  };

  // Confirm restore
  const handleConfirmRestore = async () => {
    if (!importPreview?.valid || !importPreview.parsedData) return;
    try {
      await restoreData(importPreview.parsedData);
      setImportStatusMessage('Database successfully restored from backup!');
      setImportPreview(null);
      onRefreshData();
    } catch (err: any) {
      setImportStatusMessage('Restore failed: ' + err.message);
    }
  };

  // Clear demo data
  const handleClearDemoData = async () => {
    if (window.confirm('Remove all demo data items? (Personal items you added will be preserved)')) {
      await clearDemoData();
      onRefreshData();
    }
  };

  // Reload demo data
  const handleReloadDemoData = async () => {
    await seedDemoData();
    onRefreshData();
  };

  // Danger clear all
  const handleExecuteClearAll = async () => {
    if (confirmPhrase.trim().toUpperCase() !== 'DELETE ALL DATA') {
      alert('Confirmation phrase does not match.');
      return;
    }
    await clearAllUserData();
    setShowClearConfirm(false);
    setConfirmPhrase('');
    onRefreshData();
    alert('All local personal data, tasks, exams, and notes have been permanently cleared.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Local database management, appearance, reminders, and data safety
        </p>
      </div>

      {/* 1. APPEARANCE */}
      <section className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
          Appearance & Theme
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Sparkles }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => updateSetting({ theme: t.id as any })}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                settings.theme === t.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. CALENDAR & DUAL SYSTEM */}
      <section className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
          Calendar Configuration
        </h3>

        <div className="space-y-3 text-xs">
          {/* Nepali Calendar toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Dual Nepali Calendar (बिक्रम सम्बत)
              </span>
              <span className="text-slate-400">
                Display Nepali month and day numbers alongside Gregorian dates
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.showNepaliCalendar}
              onChange={(e) => updateSetting({ showNepaliCalendar: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 cursor-pointer"
            />
          </div>

          {/* First day of week */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                First Day of Week
              </span>
              <span className="text-slate-400">
                Choose start column for month and week calendar grids
              </span>
            </div>
            <select
              value={settings.firstDayOfWeek}
              onChange={(e) => updateSetting({ firstDayOfWeek: Number(e.target.value) as 0 | 1 })}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. TASKS & AUTOMATIC CARRY-FORWARD */}
      <section className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
          Tasks & Deadlines
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs">
          <div className="pr-3">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              Automatic Carry-Forward for Incomplete Work
            </span>
            <span className="text-slate-400">
              When enabled, tasks past their due date are carried forward to today while keeping full original deadline audit history.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.autoCarryForward}
            onChange={(e) => updateSetting({ autoCarryForward: e.target.checked })}
            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
          />
        </div>
      </section>

      {/* 4. NOTIFICATIONS & REMINDERS */}
      <section className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
          Reminders & Audio Alerts
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Enable Browser Notifications
              </span>
              <span className="text-slate-400">
                Trigger push alerts when an event or task deadline arrives
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={(e) => updateSetting({ enableNotifications: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Audio Chimes on Reminders
              </span>
              <span className="text-slate-400">
                Plays harmonic Web Audio double chime locally without external files
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.audioAlerts}
              onChange={(e) => updateSetting({ audioAlerts: e.target.checked })}
              className="w-5 h-5 rounded text-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* 5. BACKUP & RESTORE */}
      <section className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
          Backup & Data Restoration
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your entire personal command center as a portable JSON file, or restore from an existing backup.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (.json)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Restore from File...</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Import Preview Modal / Banner */}
        {importPreview && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3 text-xs">
            {importPreview.valid ? (
              <>
                <h4 className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Valid Backup File Detected
                </h4>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  <span>Events: {importPreview.summary?.eventsCount}</span>
                  <span>Tasks: {importPreview.summary?.tasksCount}</span>
                  <span>Exams: {importPreview.summary?.examsCount}</span>
                  <span>Projects: {importPreview.summary?.projectsCount}</span>
                  <span>Subjects: {importPreview.summary?.subjectsCount}</span>
                  <span>Shopping: {importPreview.summary?.shoppingCount}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setImportPreview(null)}
                    className="px-3 py-1 text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmRestore}
                    className="px-4 py-1 font-bold bg-blue-600 text-white rounded-xl shadow-xs"
                  >
                    Restore Data Now
                  </button>
                </div>
              </>
            ) : (
              <div className="text-red-600">
                Invalid file: {importPreview.error}
              </div>
            )}
          </div>
        )}

        {importStatusMessage && (
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {importStatusMessage}
          </p>
        )}
      </section>

      {/* 6. DEMO DATA MANAGEMENT */}
      <section className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
          Sample Demo Data
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Used to preview all modules (StudyAI, DBMS, Indian/Nepali festivals). You can safely remove it at any time.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearDemoData}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 cursor-pointer"
          >
            Remove Demo Data
          </button>
          <button
            onClick={handleReloadDemoData}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
          >
            Reload Sample Data
          </button>
        </div>
      </section>

      {/* 7. DANGER ZONE: Clear All Data */}
      <section className="p-5 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h3 className="text-sm font-bold text-red-900 dark:text-red-300 uppercase tracking-wider text-xs">
            Danger Zone
          </h3>
        </div>

        <p className="text-xs text-red-700 dark:text-red-400">
          Permanently wipes all local IndexedDB tables including tasks, exams, projects, notes, and calendar items.
        </p>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data...</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 space-y-3 text-xs">
            <p className="font-bold text-red-600">
              Type <span className="font-mono bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded">DELETE ALL DATA</span> below to confirm destruction:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder="DELETE ALL DATA"
                className="flex-1 px-3 py-2 rounded-xl border border-red-300 dark:border-red-800 font-mono text-xs text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/30 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setConfirmPhrase('DELETE ALL DATA')}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                title="Quick fill confirmation text"
              >
                Auto-fill
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirm(false);
                  setConfirmPhrase('');
                }}
                className="px-3 py-1.5 text-slate-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteClearAll}
                disabled={confirmPhrase.trim().toUpperCase() !== 'DELETE ALL DATA'}
                className="px-4 py-1.5 font-bold bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};
