import { EventCategory, Priority, ShoppingPriority } from '../types';

export const CATEGORY_CONFIG: Record<EventCategory, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}> = {
  college: {
    label: 'College',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800/50',
    dotColor: 'bg-rose-500'
  },
  project: {
    label: 'Project',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/50',
    dotColor: 'bg-purple-500'
  },
  personal: {
    label: 'Personal',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/50',
    dotColor: 'bg-emerald-500'
  },
  meeting: {
    label: 'Meeting',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
    dotColor: 'bg-blue-500'
  },
  travel: {
    label: 'Travel',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderColor: 'border-cyan-200 dark:border-cyan-800/50',
    dotColor: 'bg-cyan-500'
  },
  health: {
    label: 'Health',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    borderColor: 'border-teal-200 dark:border-teal-800/50',
    dotColor: 'bg-teal-500'
  },
  festival: {
    label: 'Festival',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    dotColor: 'bg-amber-500'
  },
  other: {
    label: 'Other',
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-50 dark:bg-slate-800/40',
    borderColor: 'border-slate-200 dark:border-slate-700/50',
    dotColor: 'bg-slate-500'
  }
};

export const PRIORITY_CONFIG: Record<Priority, {
  label: string;
  color: string;
  badgeBg: string;
  borderColor: string;
}> = {
  critical: {
    label: 'Critical',
    color: 'text-red-700 dark:text-red-400',
    badgeBg: 'bg-red-100 dark:bg-red-950/60',
    borderColor: 'border-red-300 dark:border-red-800'
  },
  high: {
    label: 'High',
    color: 'text-orange-700 dark:text-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60',
    borderColor: 'border-orange-300 dark:border-orange-800'
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-700 dark:text-blue-400',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    borderColor: 'border-blue-300 dark:border-blue-800'
  },
  low: {
    label: 'Low',
    color: 'text-slate-700 dark:text-slate-400',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/60',
    borderColor: 'border-slate-300 dark:border-slate-700'
  }
};

export const SHOPPING_PRIORITY_CONFIG: Record<ShoppingPriority, {
  label: string;
  color: string;
  badgeBg: string;
}> = {
  urgent: {
    label: 'Urgent (Today)',
    color: 'text-red-600 dark:text-red-400',
    badgeBg: 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900'
  },
  soon: {
    label: 'Soon (This week)',
    color: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900'
  },
  later: {
    label: 'Later (Eventually)',
    color: 'text-blue-600 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900'
  },
  wishlist: {
    label: 'Wishlist',
    color: 'text-slate-600 dark:text-slate-400',
    badgeBg: 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
  }
};
