import React, { useMemo, useState } from 'react';
import { Check, Flame, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { formatDateKey, getTodayKey, MIN_DATE_KEY } from '../../services/habitStorageService';

export const WeeklyMatrix: React.FC = () => {
  const { habits, logs, statsMap, selectedDate, toggleHabitCompletion } = useHabits();

  // Selected week offset (in weeks relative to selectedDate)
  const [weekOffset, setWeekOffset] = useState(0);

  // Compute base monday for current selected week
  const weekDays = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
    const monday = new Date(curr.getFullYear(), curr.getMonth(), diff);

    const days: Array<{ dateKey: string; dayName: string; dayNum: number; isToday: boolean; isBeforeMin: boolean }> = [];
    const todayKey = getTodayKey();

    for (let i = 0; i < 7; i++) {
      const target = new Date(monday);
      target.setDate(monday.getDate() + i);
      const dateKey = formatDateKey(target);
      const isBeforeMin = dateKey < MIN_DATE_KEY;
      days.push({
        dateKey,
        dayName: target.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: target.getDate(),
        isToday: dateKey === todayKey,
        isBeforeMin,
      });
    }

    return days;
  }, [selectedDate, weekOffset]);

  const isMinWeek = weekDays.some((d) => d.dateKey <= MIN_DATE_KEY);

  // Quick lookup map: habitId + dateKey -> completed boolean
  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    logs.forEach((l) => {
      if (l.completed) {
        map.set(`${l.habitId}_${l.date}`, true);
      }
    });
    return map;
  }, [logs]);

  const weekRangeLabel = `${weekDays[0].dayNum} ${new Date(weekDays[0].dateKey + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })} - ${weekDays[6].dayNum} ${new Date(weekDays[6].dateKey + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

  return (
    <div className="bg-white border border-[#f2ede8] rounded-[24px] p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-[#f2ede8]">
        <div>
          <h3 className="text-xs sm:text-sm font-serif font-bold text-[#3d3d2e] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#5a5a40]" />
            Weekly Progress Matrix
          </h3>
          <p className="text-[11px] text-[#8a847c] mt-0.5">
            Check off daily targets across the entire week
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-[#f8f5f2] px-2 py-1 rounded-full border border-[#e9e4df]">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            disabled={isMinWeek && weekOffset <= 0}
            className="p-1 text-[#8a847c] hover:text-[#3d3d2e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors rounded-full"
            title="Previous week"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-serif font-bold text-[#3d3d2e] px-2 min-w-[140px] text-center">
            {weekRangeLabel}
          </span>
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="p-1 text-[#8a847c] hover:text-[#3d3d2e] cursor-pointer transition-colors rounded-full"
            title="Next week"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-[#f2ede8]">
              <th className="pb-3 text-[10px] font-bold text-[#a39d94] uppercase tracking-widest pl-2 w-1/3">
                Habit
              </th>
              {weekDays.map((d) => (
                <th
                  key={d.dateKey}
                  className={`pb-3 text-center text-xs font-semibold ${
                    d.isToday ? 'text-[#5a5a40] font-bold' : 'text-[#8a847c]'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#a39d94]">{d.dayName}</span>
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
              <th className="pb-3 text-center text-[10px] font-bold text-[#a39d94] uppercase tracking-widest pr-2">
                Streak
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f8f5f2]">
            {habits.map((habit) => {
              const stats = statsMap[habit.id] || { currentStreak: 0 };
              return (
                <tr key={habit.id} className="hover:bg-[#f8f5f2]/40 transition-colors">
                  <td className="py-2.5 pl-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color || '#5a5a40' }}
                      />
                      <span className="text-xs font-serif font-bold text-[#3d3d2e] truncate max-w-[180px]">
                        {habit.name}
                      </span>
                    </div>
                  </td>
                  {weekDays.map((d) => {
                    const isDone = completionMap.has(`${habit.id}_${d.dateKey}`);
                    return (
                      <td key={d.dateKey} className="py-2 text-center">
                        {d.isBeforeMin ? (
                          <div className="w-6 h-6 mx-auto rounded-full bg-[#f8f5f2] opacity-40 cursor-not-allowed" />
                        ) : (
                          <button
                            id={`matrix-toggle-${habit.id}-${d.dateKey}`}
                            onClick={() => toggleHabitCompletion(habit.id, d.dateKey, habit.targetValue)}
                            className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center transition-all cursor-pointer ${
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
                  <td className="py-2.5 pr-2 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f2ede8] text-[#5a5a40] border border-[#e9e4df]">
                      <Flame className="w-2.5 h-2.5 text-[#5a5a40] fill-[#5a5a40]" />
                      {stats.currentStreak}d
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
