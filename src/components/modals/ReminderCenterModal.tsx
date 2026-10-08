import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, Volume2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { db } from '../../database/db';
import { Reminder } from '../../types';
import { ReminderService } from '../../services/reminderService';
import { formatDisplayDate, formatTimeDisplay } from '../../utils/dateUtils';

interface ReminderCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReminderCenterModal: React.FC<ReminderCenterModalProps> = ({
  isOpen,
  onClose
}) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const loadReminders = async () => {
    const list = await db.reminders.toArray();
    // sort by targetDateTime descending
    list.sort((a, b) => a.targetDateTime.localeCompare(b.targetDateTime));
    setReminders(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadReminders();
      setPermission(ReminderService.getPermissionStatus());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggeredList = reminders.filter(r => r.status === 'triggered');
  const pendingList = reminders.filter(r => r.status === 'pending');

  const handleRequestPermission = async () => {
    const res = await ReminderService.requestNotificationPermission();
    setPermission(res);
  };

  const handleSnooze = async (id: string, mins: number) => {
    await ReminderService.snoozeReminder(id, mins);
    loadReminders();
  };

  const handleDismiss = async (id: string) => {
    await ReminderService.dismissReminder(id);
    loadReminders();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Reminder Center</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Offline & internal notification system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Banner */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Browser alerts active</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Push permissions: {permission}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => ReminderService.playNotificationSound()}
              className="px-2 py-1 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
              title="Play gentle chime"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Chime</span>
            </button>

            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Reminders Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Triggered / Due Now Reminders */}
          {triggeredList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Due / Triggered Now ({triggeredList.length})
                </h4>
              </div>
              <div className="space-y-2">
                {triggeredList.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <span className="text-xs uppercase font-semibold text-red-600 dark:text-red-400">
                          {rem.itemType}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {rem.title}
                        </h5>
                      </div>
                      <button
                        onClick={() => handleDismiss(rem.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Dismiss"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                      </button>
                    </div>

                    {/* Actions: Snooze */}
                    <div className="flex items-center gap-2 pt-1 border-t border-red-200/40 dark:border-red-900/40 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Snooze:</span>
                      <button
                        onClick={() => handleSnooze(rem.id, 15)}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      >
                        +15m
                      </button>
                      <button
                        onClick={() => handleSnooze(rem.id, 60)}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                      >
                        +1 hour
                      </button>
                      <button
                        onClick={() => handleDismiss(rem.id)}
                        className="ml-auto px-2.5 py-0.5 rounded bg-red-600 text-white font-medium hover:bg-red-700 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Upcoming Scheduled Reminders ({pendingList.length})
            </h4>

            {pendingList.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                No upcoming reminders scheduled.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingList.map((rem) => {
                  const target = new Date(rem.targetDateTime);
                  const dateStr = rem.targetDateTime.split('T')[0];
                  const timeStr = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;

                  return (
                    <div
                      key={rem.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {rem.itemType}
                        </span>
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {rem.title}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatDisplayDate(dateStr)} at {formatTimeDisplay(timeStr)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDismiss(rem.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title="Delete Reminder"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
