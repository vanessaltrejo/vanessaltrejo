import React, { useMemo, useState } from 'react';
import { Check, Flame, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { formatDateKey, getTodayKey, MIN_DATE_KEY } from '../../services/habitStorageService';

export const MonthlyMatrix: React.FC = () => {
  const { habits, logs, statsMap, selectedDate, toggleHabitCompletion } = useHabits();

  // Extract year and month from selectedDate or local state
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return { year: y || 2026, month: (m || 8) - 1 }; // month 0-indexed
  });

  const { year, month } = currentYearMonth;

  // Month navigation helpers (minimum is August 2026 -> year=2026, month=7)
  const isMinMonth = year === 2026 && month <= 7;

  const handlePrevMonth = () => {
    if (isMinMonth) return;
    setCurrentYearMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Generate days for this month
  const monthDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ dateKey: string; dayName: string; dayNum: number; isToday: boolean; isBeforeMin: boolean }> = [];
    const todayKey = getTodayKey();

    for (let d = 1; d <= daysInMonth; d++) {
      const targetDate = new Date(year, month, d);
      const dateKey = formatDateKey(targetDate);
      const isBeforeMin = dateKey < MIN_DATE_KEY;
      days.push({
        dateKey,
        dayName: targetDate.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d,
        isToday: dateKey === todayKey,
        isBeforeMin,
      });
    }

    return days;
  }, [year, month]);

  // Lookup map: habitId + dateKey -> completed boolean
  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    logs.forEach((l) => {
      if (l.completed) {
        map.set(`${l.habitId}_${l.date}`, true);
      }
    });
    return map;
  }, [logs]);

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white border border-[#f2ede8] rounded-[24px] p-4 sm:p-5 shadow-2xs">
      {/* Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#f2ede8]">
        <div>
          <h3 className="text-xs sm:text-sm font-serif font-bold text-[#3d3d2e] flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#5a5a40]" />
            Monthly Progress Grid
          </h3>
          <p className="text-[11px] text-[#8a847c] mt-0.5">
            Full view of daily repetitions for {monthLabel}
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-[#f8f5f2] px-2 py-1 rounded-full border border-[#e9e4df]">
          <button
            onClick={handlePrevMonth}
            disabled={isMinMonth}
            className="p-1 text-[#8a847c] hover:text-[#3d3d2e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-full"
            title={isMinMonth ? 'August 2026 is the start date' : 'Previous month'}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-serif font-bold text-[#3d3d2e] px-2 min-w-[110px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-[#8a847c] hover:text-[#3d3d2e] cursor-pointer transition-colors rounded-full"
            title="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Table with Sticky First Column */}
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#f2ede8]">
              <th className="sticky left-0 bg-white z-10 pb-3 text-[10px] font-bold text-[#a39d94] uppercase tracking-widest pl-2 pr-3 min-w-[150px]">
                Habit
              </th>
              {monthDays.map((d) => (
                <th
                  key={d.dateKey}
                  className={`pb-3 text-center px-1 text-[10px] font-semibold ${
                    d.isToday ? 'text-[#5a5a40] font-bold' : 'text-[#8a847c]'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-[#a39d94]">{d.dayName}</span>
                    <span
                      className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] mt-0.5 ${
                        d.isToday
                          ? 'bg-[#5a5a40] text-white font-bold'
                          : d.isBeforeMin
                          ? 'text-[#c5beb5]'
                          : 'text-[#3d3d2e]'
                      }`}
                    >
                      {d.dayNum}
                    </span>
                  </div>
                </th>
              ))}
              <th className="sticky right-0 bg-white z-10 pb-3 text-center text-[10px] font-bold text-[#a39d94] uppercase tracking-widest px-2 min-w-[60px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f8f5f2]">
            {habits.map((habit) => {
              // Count completed days in this month
              let monthCompletedCount = 0;
              monthDays.forEach((d) => {
                if (completionMap.has(`${habit.id}_${d.dateKey}`)) {
                  monthCompletedCount++;
                }
              });

              return (
                <tr key={habit.id} className="hover:bg-[#f8f5f2]/40 transition-colors">
                  <td className="sticky left-0 bg-white hover:bg-[#f8f5f2]/40 z-10 py-2.5 pl-2 pr-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color || '#5a5a40' }}
                      />
                      <span className="text-xs font-serif font-bold text-[#3d3d2e] truncate max-w-[140px]">
                        {habit.name}
                      </span>
                    </div>
                  </td>

                  {monthDays.map((d) => {
                    const isDone = completionMap.has(`${habit.id}_${d.dateKey}`);
                    return (
                      <td key={d.dateKey} className="py-2 px-1 text-center">
                        {d.isBeforeMin ? (
                          <div className="w-5 h-5 mx-auto rounded-full bg-[#f8f5f2] opacity-40 cursor-not-allowed" />
                        ) : (
                          <button
                            id={`monthly-matrix-toggle-${habit.id}-${d.dateKey}`}
                            onClick={() => toggleHabitCompletion(habit.id, d.dateKey, habit.targetValue)}
                            className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer ${
                              isDone
                                ? 'bg-[#5a5a40] text-white shadow-2xs scale-105 active:scale-95'
                                : 'bg-[#e9e4df] hover:bg-[#d8d3cd] text-transparent hover:text-[#8a847c]'
                            }`}
                            title={`${habit.name} on ${d.dateKey}: ${isDone ? 'Completed' : 'Pending'}`}
                          >
                            <Check className={`w-3 h-3 stroke-[3] ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                          </button>
                        )}
                      </td>
                    );
                  })}

                  <td className="sticky right-0 bg-white hover:bg-[#f8f5f2]/40 z-10 py-2.5 px-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f2ede8] text-[#5a5a40]">
                      {monthCompletedCount}d
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
