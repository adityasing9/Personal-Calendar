import { db } from '../database/db';
import { Reminder } from '../types';

export class ReminderService {
  private static timer: any = null;
  private static audioCtx: AudioContext | null = null;

  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  static isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  static getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }

  static playNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      // Harmonic gentle double chime
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, this.audioCtx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.5);
    } catch {
      // Audio not permitted or background muted
    }
  }

  static async checkDueReminders(): Promise<Reminder[]> {
    const nowIso = new Date().toISOString();
    const pendingReminders = await db.reminders
      .filter(r => r.status === 'pending' && r.targetDateTime <= nowIso)
      .toArray();

    const triggered: Reminder[] = [];
    const settings = await db.settings.get('default');

    for (const rem of pendingReminders) {
      // Mark as triggered
      await db.reminders.update(rem.id, { status: 'triggered' });
      triggered.push({ ...rem, status: 'triggered' });

      // Trigger Web Notification if allowed
      if (
        settings?.enableNotifications &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          new Notification(rem.title, {
            body: `Scheduled reminder for your ${rem.itemType}`,
            icon: '/favicon.svg'
          });
        } catch {
          // notification blocked
        }
      }

      if (settings?.audioAlerts) {
        this.playNotificationSound();
      }
    }

    return triggered;
  }

  static async snoozeReminder(id: string, minutes: number = 15) {
    const rem = await db.reminders.get(id);
    if (!rem) return;

    const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    await db.reminders.update(id, {
      targetDateTime: newTime,
      status: 'pending'
    });
  }

  static async dismissReminder(id: string) {
    await db.reminders.update(id, { status: 'dismissed' });
  }

  static async createReminder(params: {
    itemId: string;
    itemType: Reminder['itemType'];
    title: string;
    targetDateTime: string;
    offsetMinutes: number;
  }): Promise<Reminder> {
    const reminder: Reminder = {
      id: 'rem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      itemId: params.itemId,
      itemType: params.itemType,
      title: params.title,
      targetDateTime: params.targetDateTime,
      offsetMinutes: params.offsetMinutes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await db.reminders.put(reminder);
    return reminder;
  }
}
