import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { formatDateKey } from '../../services/habitStorageService';

export const AnalyticsDashboard: React.FC = () => {
  const { habits, logs, statsMap } = useHabits();

  // Aggregate Metrics
  const totalCheckIns = useMemo(() => logs.filter((l) => l.completed).length, [logs]);

  const bestOverallStreak = useMemo(() => {
    return Math.max(...Object.values(statsMap).map((s) => s.longestStreak), 0);
  }, [statsMap]);

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

  // Category Distribution Calculation
  const categoryStats = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};

    habits.forEach((h) => {
      if (!counts[h.category]) {
        counts[h.category] = { total: 0, completed: 0 };
      }
      counts[h.category].total += 1;
      const stats = statsMap[h.id];
      if (stats) {
        counts[h.category].completed += stats.totalCompletions;
      }
    });

    return Object.entries(counts).map(([cat, val]) => ({
      category: cat,
      habitCount: val.total,
      completions: val.completed,
      percentage: totalCheckIns > 0 ? Math.round((val.completed / totalCheckIns) * 100) : 0,
    }));
  }, [habits, statsMap, totalCheckIns]);

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Headline Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#f2ede8] rounded-[28px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a39d94]">
              Avg Adherence
            </span>
            <div className="p-2 rounded-full bg-[#f2ede8] text-[#5a5a40]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#3d3d2e] mt-2">
            {averageAdherence}%
          </div>
          <div className="text-xs text-[#8a847c] mt-1">Across all 30 days</div>
        </div>

        <div className="bg-white border border-[#f2ede8] rounded-[28px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a39d94]">
              Total Check-Ins
            </span>
            <div className="p-2 rounded-full bg-[#f2ede8] text-[#5a5a40]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#3d3d2e] mt-2">
            {totalCheckIns}
          </div>
          <div className="text-xs text-[#8a847c] mt-1">Logged in app & sheets</div>
        </div>

        <div className="bg-white border border-[#f2ede8] rounded-[28px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a39d94]">
              Record Streak
            </span>
            <div className="p-2 rounded-full bg-[#f2ede8] text-[#5a5a40]">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#3d3d2e] mt-2">
            {bestOverallStreak} <span className="text-sm font-sans font-normal text-[#8a847c]">days</span>
          </div>
          <div className="text-xs text-[#8a847c] mt-1">Personal milestone</div>
        </div>

        <div className="bg-white border border-[#f2ede8] rounded-[28px] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a39d94]">
              Active Habits
            </span>
            <div className="p-2 rounded-full bg-[#f2ede8] text-[#5a5a40]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#3d3d2e] mt-2">
            {habits.length}
          </div>
          <div className="text-xs text-[#8a847c] mt-1">In active rotation</div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak Champions Leaderboard */}
        <div className="lg:col-span-2 bg-white border border-[#f2ede8] rounded-[28px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f2ede8]">
            <div>
              <h3 className="text-base font-serif font-bold text-[#3d3d2e] flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#5a5a40] fill-[#5a5a40]" />
                Streak Champions & Consistency Leaderboard
              </h3>
              <p className="text-xs text-[#8a847c]">Ranked by current active unbroken streak</p>
            </div>
          </div>

          <div className="space-y-3">
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
                  className="p-3.5 rounded-2xl border border-[#f2ede8] bg-[#f8f5f2]/60 hover:bg-[#f8f5f2] transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
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
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: habit.color || '#5a5a40' }}
                        />
                        <span className="text-xs sm:text-sm font-serif font-bold text-[#3d3d2e] truncate">
                          {habit.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8a847c]">
                        Record streak: {stats.longestStreak} days • {stats.totalCompletions} total check-ins
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-[#f2ede8] text-[#5a5a40] border border-[#e9e4df]">
                        <Flame className="w-3.5 h-3.5 text-[#5a5a40] fill-[#5a5a40]" />
                        <span>{stats.currentStreak} days</span>
                      </div>
                    </div>

                    <div className="hidden sm:block w-24">
                      <div className="flex justify-between text-[10px] text-[#a39d94] mb-1">
                        <span>Adherence</span>
                        <span className="font-semibold text-[#3d3d2e]">{stats.completionRateLast30Days}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#e9e4df] rounded-full overflow-hidden">
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

        {/* Day of Week Consistency Distribution */}
        <div className="bg-white border border-[#f2ede8] rounded-[28px] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-serif font-bold text-[#3d3d2e] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5a5a40]" />
              Day of Week Activity
            </h3>
            <p className="text-xs text-[#8a847c]">Distribution of completed check-ins</p>
          </div>

          <div className="space-y-3 pt-2">
            {dayOfWeekStats.map((item) => (
              <div key={item.day} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#3d3d2e]">{item.day}</span>
                  <span className="text-[#8a847c]">{item.count} check-ins</span>
                </div>
                <div className="w-full h-2 bg-[#f8f5f2] rounded-full overflow-hidden border border-[#e9e4df]">
                  <div
                    className="h-full bg-[#5a5a40] rounded-full transition-all duration-500"
                    style={{ width: `${item.percentOfMax}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Habit Completion Breakdown */}
          <div className="pt-4 border-t border-[#f2ede8]">
            <h4 className="text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#5a5a40]" />
              <span>Habit Overview</span>
            </h4>
            <div className="space-y-2">
              {habits.slice(0, 5).map((h) => {
                const s = statsMap[h.id];
                return (
                  <div key={h.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#8a847c] font-medium truncate max-w-[140px]">{h.name}</span>
                    <span className="font-bold text-[#3d3d2e]">{s?.totalCompletions || 0} check-ins</span>
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
