import React, { useState } from 'react';
import {
  Flame,
  Search,
  Plus,
  Calendar,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';
import { db } from '../../database/db';
import { Festival, UserSettings } from '../../types';
import { formatNepaliDisplay } from '../../utils/nepaliCalendar';
import { formatShortDate, formatDisplayDate } from '../../utils/dateUtils';
import { getTodayStr } from '../../services/carryForward';

interface FestivalsViewProps {
  festivals: Festival[];
  settings: UserSettings;
  onRefreshData: () => void;
}

export const FestivalsView: React.FC<FestivalsViewProps> = ({
  festivals,
  settings,
  onRefreshData
}) => {
  const todayStr = getTodayStr();
  const [filterType, setFilterType] = useState<'all' | 'indian' | 'nepali' | 'holiday'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFestival, setShowAddFestival] = useState(false);

  // New Festival form state
  const [newFestName, setNewFestName] = useState('');
  const [newFestDate, setNewFestDate] = useState(todayStr);
  const [newFestType, setNewFestType] = useState<'indian' | 'nepali' | 'both'>('nepali');
  const [newFestRegion, setNewFestRegion] = useState('');
  const [newFestDesc, setNewFestDesc] = useState('');
  const [newFestIsHoliday, setNewFestIsHoliday] = useState(true);

  // Filter & Search
  let list = festivals;
  if (filterType === 'indian') {
    list = list.filter((f) => f.calendarType === 'indian' || f.calendarType === 'both');
  } else if (filterType === 'nepali') {
    list = list.filter((f) => f.calendarType === 'nepali' || f.calendarType === 'both');
  } else if (filterType === 'holiday') {
    list = list.filter((f) => f.isHoliday);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.region?.toLowerCase().includes(q)
    );
  }

  // Sort chronologically
  list.sort((a, b) => a.date.localeCompare(b.date));

  const handleAddFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFestName.trim() || !newFestDate) return;

    await db.festivals.put({
      id: `fest-custom-${Date.now()}`,
      name: newFestName.trim(),
      date: newFestDate,
      calendarType: newFestType,
      region: newFestRegion.trim() || 'Custom',
      description: newFestDesc.trim() || 'Custom celebration',
      isHoliday: newFestIsHoliday,
      isCustom: true
    });

    setNewFestName('');
    setNewFestDesc('');
    setShowAddFestival(false);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Cultural & Festival Calendar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Authentic Indian and Nepali festivals with dual Bikram Sambat date conversion
          </p>
        </div>

        <button
          onClick={() => setShowAddFestival(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Festival</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Festivals' },
            { id: 'nepali', label: 'Nepali (बिक्रम सम्बत)' },
            { id: 'indian', label: 'Indian Festivals' },
            { id: 'holiday', label: 'Official Holidays' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0 ${
                filterType === t.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Dashain, Tihar, Holi..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Festivals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((fest) => {
          const isPast = fest.date < todayStr;
          const isToday = fest.date === todayStr;
          const nepaliStr = formatNepaliDisplay(fest.date);

          return (
            <div
              key={fest.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isToday
                  ? 'bg-orange-50/70 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 ring-2 ring-orange-500 shadow-md'
                  : isPast
                  ? 'bg-slate-50/40 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/80 opacity-60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-orange-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                      {fest.calendarType}
                    </span>
                    {fest.isHoliday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
                        Holiday
                      </span>
                    )}
                  </div>

                  {isToday && (
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400 animate-pulse">
                      TODAY!
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {fest.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {fest.description}
                </p>
              </div>

              {/* Dual Dates Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDisplayDate(fest.date)}</span>
                </div>

                {settings.showNepaliCalendar && (
                  <span className="font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-lg text-[11px]">
                    {nepaliStr}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Festival Modal */}
      {showAddFestival && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddFestival(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Custom Festival / Holiday</h3>
            <form onSubmit={handleAddFestival} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Festival Name *</label>
                <input
                  type="text"
                  required
                  value={newFestName}
                  onChange={(e) => setNewFestName(e.target.value)}
                  placeholder="e.g. College Foundation Day"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newFestDate}
                    onChange={(e) => setNewFestDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Type</label>
                  <select
                    value={newFestType}
                    onChange={(e) => setNewFestType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="nepali">Nepali</option>
                    <option value="indian">Indian</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newFestDesc}
                  onChange={(e) => setNewFestDesc(e.target.value)}
                  placeholder="Significance or details..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFestIsHoliday}
                  onChange={(e) => setNewFestIsHoliday(e.target.checked)}
                  className="rounded text-orange-600"
                />
                <span>Official / College Holiday</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFestival(false)}
                  className="px-3 py-1.5 text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                >
                  Save Festival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
