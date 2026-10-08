import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  GraduationCap,
  FolderGit2,
  ShoppingCart
} from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isToday
} from 'date-fns';
import {
  LifeEvent,
  LifeTask,
  Exam,
  ShoppingItem,
  Festival,
  UserSettings
} from '../../types';
import { getNepaliDate, formatNepaliDisplay } from '../../utils/nepaliCalendar';
import { formatTimeDisplay, formatDisplayDate } from '../../utils/dateUtils';
import { QuickAddType } from '../../components/modals/QuickAddModal';

export type CalendarDisplayView = 'month' | 'week' | 'day' | 'agenda';

interface CalendarViewProps {
  events: LifeEvent[];
  tasks: LifeTask[];
  exams: Exam[];
  shoppingItems: ShoppingItem[];
  festivals: Festival[];
  settings: UserSettings;
  onOpenQuickAdd: (type?: QuickAddType, date?: string) => void;
  onRefreshData: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  exams,
  shoppingItems,
  festivals,
  settings,
  onOpenQuickAdd,
  onRefreshData
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 8)); // Oct 8, 2026
  const [viewMode, setViewMode] = useState<CalendarDisplayView>('month');
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(new Date(2026, 9, 8));
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);

  // Month interval calculation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: settings.firstDayOfWeek });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: settings.firstDayOfWeek });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDayDate(today);
  };

  // Day data retrieval
  const getItemsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEvents = events.filter((e) => e.startDate === dateStr);
    const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
    const dayExams = exams.filter((e) => e.date === dateStr);
    const dayShopping = shoppingItems.filter((s) => s.targetDate === dateStr);
    const dayFestivals = festivals.filter((f) => f.date === dateStr);

    return {
      dateStr,
      events: dayEvents,
      tasks: dayTasks,
      exams: dayExams,
      shopping: dayShopping,
      festivals: dayFestivals,
      totalCount: dayEvents.length + dayTasks.length + dayExams.length + dayShopping.length + dayFestivals.length
    };
  };

  const selectedDateData = selectedDayDate ? getItemsForDate(selectedDayDate) : null;
  const selectedNepaliInfo = selectedDayDate ? getNepaliDate(selectedDayDate) : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Month Title & Nav */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            {settings.showNepaliCalendar && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {getNepaliDate(currentDate).monthNameNepali} {getNepaliDate(currentDate).year} BS
              </span>
            )}
          </div>

          <button
            onClick={handleToday}
            className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* View Switcher Pills & Add button */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-xs">
            {(['month', 'week', 'day', 'agenda'] as CalendarDisplayView[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                  viewMode === v
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenQuickAdd('event', selectedDateData?.dateStr || format(currentDate, 'yyyy-MM-dd'))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* MONTH VIEW GRID */}
      {/* ======================================================== */}
      {viewMode === 'month' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md overflow-hidden shadow-xs">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {(settings.firstDayOfWeek === 0
              ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
              : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            ).map((dayName) => (
              <div key={dayName}>{dayName}</div>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
            {calendarDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              const isSelected = selectedDayDate ? isSameDay(day, selectedDayDate) : false;
              const nepaliDate = getNepaliDate(day);
              const items = getItemsForDate(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDayDate(day);
                    setIsDayDrawerOpen(true);
                  }}
                  className={`min-h-[92px] sm:min-h-[105px] p-1.5 sm:p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                    !isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600'
                      : isSelected
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500 ring-inset'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Date Header: Primary Gregorian + Secondary Nepali */}
                  <div className="flex items-start justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold flex items-center justify-center w-6 h-6 rounded-full ${
                        isDayToday
                          ? 'bg-blue-600 text-white'
                          : isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>

                    {/* Subtle Nepali Date underneath/beside */}
                    {settings.showNepaliCalendar && (
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                        {nepaliDate.formattedShortNepali}
                      </span>
                    )}
                  </div>

                  {/* Indicators for Day Items */}
                  <div className="mt-1 space-y-1">
                    {/* Festivals highlight pill */}
                    {items.festivals.slice(0, 1).map((f) => (
                      <div
                        key={f.id}
                        className="truncate text-[10px] font-semibold px-1 py-0.2 rounded bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
                        title={f.name}
                      >
                        🎉 {f.name}
                      </div>
                    ))}

                    {/* Exams indicator pill */}
                    {items.exams.slice(0, 1).map((ex) => (
                      <div
                        key={ex.id}
                        className="truncate text-[10px] font-bold px-1 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
                        title={`Exam: ${ex.type}`}
                      >
                        🎓 {ex.type} Exam
                      </div>
                    ))}

                    {/* Dot indicators row */}
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {items.events.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`${items.events.length} event(s)`} />
                      )}
                      {items.tasks.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`${items.tasks.length} task(s)`} />
                      )}
                      {items.shopping.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title={`${items.shopping.length} shopping item(s)`} />
                      )}
                      {items.totalCount > 3 && (
                        <span className="text-[9px] font-semibold text-slate-400">
                          +{items.totalCount - 2}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* AGENDA VIEW */}
      {/* ======================================================== */}
      {viewMode === 'agenda' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Agenda View — Upcoming Schedule
          </h3>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            {calendarDays
              .filter((d) => getItemsForDate(d).totalCount > 0)
              .map((day) => {
                const items = getItemsForDate(day);
                const nepaliDate = getNepaliDate(day);

                return (
                  <div key={day.toISOString()} className="pt-4 first:pt-0">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {format(day, 'EEEE, MMMM d, yyyy')}
                      </span>
                      {settings.showNepaliCalendar && (
                        <span className="text-xs text-slate-400">
                          • {nepaliDate.formattedNepali}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                      {items.festivals.map((f) => (
                        <div key={f.id} className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 text-xs">
                          <span className="font-bold text-orange-700 dark:text-orange-400">Festival: </span>
                          <span className="text-slate-900 dark:text-slate-100 font-semibold">{f.name}</span>
                        </div>
                      ))}

                      {items.exams.map((ex) => (
                        <div key={ex.id} className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs">
                          <span className="font-bold text-rose-700 dark:text-rose-400">Exam ({ex.type}): </span>
                          <span className="text-slate-900 dark:text-slate-100 font-semibold">{ex.startTime || 'Scheduled'} {ex.room ? `in ${ex.room}` : ''}</span>
                        </div>
                      ))}

                      {items.events.map((e) => (
                        <div key={e.id} className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs">
                          <span className="font-bold text-blue-700 dark:text-blue-400">{e.startTime || 'All Day'}: </span>
                          <span className="text-slate-900 dark:text-slate-100 font-semibold">{e.title}</span>
                        </div>
                      ))}

                      {items.tasks.map((t) => (
                        <div key={t.id} className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">Task: </span>
                          <span className="text-slate-900 dark:text-slate-100 font-semibold">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* WEEK & DAY VIEWS */}
      {/* ======================================================== */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-6 text-center text-slate-500">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {viewMode === 'day' ? formatDisplayDate(format(currentDate, 'yyyy-MM-dd')) : `Week of ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`}
          </p>
          <div className="mt-4 max-w-lg mx-auto text-left space-y-3">
            {getItemsForDate(currentDate).events.map((e) => (
              <div key={e.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs flex justify-between">
                <span className="font-bold text-blue-600">{e.startTime || 'All Day'}</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">{e.title}</span>
              </div>
            ))}
            {getItemsForDate(currentDate).events.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">No events on this day.</div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONTEXTUAL DAY PANEL / DRAWER */}
      {/* ======================================================== */}
      {isDayDrawerOpen && selectedDayDate && selectedDateData && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          onClick={() => setIsDayDrawerOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Day Overview
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatDisplayDate(selectedDateData.dateStr)}
                </h3>
                {settings.showNepaliCalendar && selectedNepaliInfo && (
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedNepaliInfo.formattedNepali} ({selectedNepaliInfo.formattedShortEnglish})
                  </p>
                )}
              </div>

              <button
                onClick={() => setIsDayDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add for this day */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDayDrawerOpen(false);
                  onOpenQuickAdd('event', selectedDateData.dateStr);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
              >
                + Add Event
              </button>
              <button
                onClick={() => {
                  setIsDayDrawerOpen(false);
                  onOpenQuickAdd('task', selectedDateData.dateStr);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              >
                + Add Task
              </button>
            </div>

            {/* Festivals on this day */}
            {selectedDateData.festivals.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Festivals & Holidays
                </h4>
                <div className="space-y-2">
                  {selectedDateData.festivals.map((f) => (
                    <div key={f.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{f.name}</h5>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exams on this day */}
            {selectedDateData.exams.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Exams
                </h4>
                <div className="space-y-2">
                  {selectedDateData.exams.map((ex) => (
                    <div key={ex.id} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-200 text-rose-800">
                        {ex.type}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                        Time: {formatTimeDisplay(ex.startTime)} {ex.room ? `• Room: ${ex.room}` : ''}
                      </h5>
                      {ex.syllabus && <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Syllabus: {ex.syllabus}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events on this day */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Events ({selectedDateData.events.length})
              </h4>
              {selectedDateData.events.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No events scheduled.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateData.events.map((e) => (
                    <div key={e.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{e.startTime || 'All Day'}</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400">{e.category}</span>
                      </div>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100">{e.title}</h5>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks due on this day */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tasks ({selectedDateData.tasks.length})
              </h4>
              {selectedDateData.tasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No tasks due.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDateData.tasks.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-[10px] uppercase font-bold text-amber-600">{t.priority}</span>
                      <h5 className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{t.title}</h5>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
