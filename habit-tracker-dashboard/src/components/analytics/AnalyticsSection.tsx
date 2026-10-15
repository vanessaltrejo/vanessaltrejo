import React, { useMemo } from 'react';
import {
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

export const AnalyticsSection: React.FC = () => {
  const { habits, logs, statsMap } = useHabits();

  // Aggregate Metrics
  const averageAdherence = useMemo(() => {
    const statsList = Object.values(statsMap);
    if (statsList.length === 0) return 0;
    const sum = statsList.reduce((acc, s) => acc + s.completionRateLast30Days, 0);
    return Math.round(sum / statsList.length);
  }, [statsMap]);

  // Ranked Habit Champions (by current streak)
  const rankedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      const aStreak = statsMap[a.id]?.currentStreak || 0;
      const bStreak = statsMap[b.id]?.currentStreak || 0;
      return bStreak - aStreak;
    });
  }, [habits, statsMap]);

  // Day of Week Performance (Mon - Sun)
  const dayOfWeekStats = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    logs.filter((l) => l.completed).forEach((l) => {
      const [y, m, d] = l.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayIdx = dateObj.getDay();
      counts[dayIdx] += 1;
    });

    const maxCount = Math.max(...counts, 1);

    return dayNames.map((name, idx) => ({
      day: name,
      count: counts[idx],
      percentOfMax: Math.round((counts[idx] / maxCount) * 100),
    }));
  }, [logs]);

  return (
    <div id="analytics-section" className="space-y-4 pt-4 border-t border-[#f2ede8]">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-serif font-bold text-[#3d3d2e] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#5a5a40]" />
            Habit Analytics & Performance
          </h3>
          <p className="text-[11px] text-[#8a847c] mt-0.5">
            Adherence rates, streak champions, and consistency patterns
          </p>
        </div>
      </div>

      {/* 2 Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-[#f2ede8] rounded-[20px] p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a39d94]">
              Avg Adherence
            </span>
            <div className="p-1.5 rounded-full bg-[#f2ede8] text-[#5a5a40]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-serif font-bold text-[#3d3d2e] mt-1.5">
            {averageAdherence}%
          </div>
          <div className="text-[10px] text-[#8a847c] mt-0.5">30-day average consistency</div>
        </div>

        <div className="bg-white border border-[#f2ede8] rounded-[20px] p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a39d94]">
              Active Habits
            </span>
            <div className="p-1.5 rounded-full bg-[#f2ede8] text-[#5a5a40]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-serif font-bold text-[#3d3d2e] mt-1.5">
            {habits.length}
          </div>
          <div className="text-[10px] text-[#8a847c] mt-0.5">Habits in daily routine</div>
        </div>
      </div>

      {/* Main Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Streak Champions Leaderboard */}
        <div className="lg:col-span-2 bg-white border border-[#f2ede8] rounded-[20px] p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#f2ede8]">
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#3d3d2e] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#5a5a40] fill-[#5a5a40]" />
              Streak Leaderboard & Consistency
            </h4>
            <span className="text-[10px] text-[#8a847c]">Sorted by streak</span>
          </div>

          <div className="space-y-2">
            {rankedHabits.map((habit, index) => {
              const stats = statsMap[habit.id] || {
                currentStreak: 0,
                longestStreak: 0,
                completionRateLast30Days: 0,
                totalCompletions: 0,
              };

              return (
                <div
                  key={habit.id}
                  className="p-2.5 rounded-[14px] border border-[#f2ede8] bg-[#f8f5f2]/50 hover:bg-[#f8f5f2] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        index === 0
                          ? 'bg-[#5a5a40] text-white shadow-2xs'
                          : index === 1
                          ? 'bg-[#e9e4df] text-[#3d3d2e]'
                          : index === 2
                          ? 'bg-[#f2ede8] text-[#5a5a40]'
                          : 'bg-white text-[#8a847c] border border-[#e9e4df]'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color || '#5a5a40' }}
                        />
                        <span className="text-xs font-serif font-bold text-[#3d3d2e] truncate">
                          {habit.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8a847c]">
                        Longest streak: {stats.longestStreak} days
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f2ede8] text-[#5a5a40] border border-[#e9e4df]">
                      <Flame className="w-2.5 h-2.5 text-[#5a5a40] fill-[#5a5a40]" />
                      <span>{stats.currentStreak}d</span>
                    </div>

                    <div className="hidden sm:block w-20">
                      <div className="flex justify-between text-[9px] text-[#a39d94] mb-0.5">
                        <span>Rate</span>
                        <span className="font-semibold text-[#3d3d2e]">{stats.completionRateLast30Days}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#e9e4df] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#5a5a40] rounded-full"
                          style={{ width: `${stats.completionRateLast30Days}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day of Week Activity & Habit Overview */}
        <div className="bg-white border border-[#f2ede8] rounded-[20px] p-4 shadow-2xs space-y-3">
          <div className="pb-2.5 border-b border-[#f2ede8]">
            <h4 className="text-xs sm:text-sm font-serif font-bold text-[#3d3d2e] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#5a5a40]" />
              Day of Week Activity
            </h4>
            <p className="text-[10px] text-[#8a847c]">Completed check-ins by day</p>
          </div>

          <div className="space-y-2 pt-1">
            {dayOfWeekStats.map((item) => (
              <div key={item.day} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-[#3d3d2e]">{item.day}</span>
                  <span className="text-[#8a847c]">{item.count} check-ins</span>
                </div>
                <div className="w-full h-1.5 bg-[#f8f5f2] rounded-full overflow-hidden border border-[#e9e4df]">
                  <div
                    className="h-full bg-[#5a5a40] rounded-full transition-all duration-500"
                    style={{ width: `${item.percentOfMax}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Habit Total Check-Ins Overview */}
          <div className="pt-3 border-t border-[#f2ede8]">
            <h5 className="text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#5a5a40]" />
              <span>Habit Overview</span>
            </h5>
            <div className="space-y-1.5">
              {habits.slice(0, 5).map((h) => {
                const s = statsMap[h.id];
                return (
                  <div key={h.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8a847c] font-medium truncate max-w-[130px]">{h.name}</span>
                    <span className="font-bold text-[#3d3d2e]">{s?.totalCompletions || 0}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
