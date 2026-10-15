"use client";

import { useMemo } from "react";
import { TrendingUp, Flame, Calendar, Layers, Sparkles } from "lucide-react";
import { useHabits } from "@/lib/habits/HabitsContext";
import { SYSTEM_FONT_STACK } from "@/lib/fonts";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function AnalyticsSection() {
  const { habits, logs, statsMap } = useHabits();

  const averageAdherence = useMemo(() => {
    const statsList = Object.values(statsMap);
    if (statsList.length === 0) return 0;
    return Math.round(statsList.reduce((acc, s) => acc + s.completionRateLast30Days, 0) / statsList.length);
  }, [statsMap]);

  const rankedHabits = useMemo(
    () => [...habits].sort((a, b) => (statsMap[b.id]?.currentStreak ?? 0) - (statsMap[a.id]?.currentStreak ?? 0)),
    [habits, statsMap]
  );

  const dayOfWeekStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    logs.filter((l) => l.completed).forEach((l) => {
      const [y, m, d] = l.date.split("-").map(Number);
      counts[new Date(y, m - 1, d).getDay()] += 1;
    });
    const maxCount = Math.max(...counts, 1);
    return DAY_NAMES.map((name, idx) => ({ day: name, count: counts[idx], percentOfMax: Math.round((counts[idx] / maxCount) * 100) }));
  }, [logs]);

  return (
    <div className="space-y-4 border-t border-white/10 pt-4" style={{ fontFamily: SYSTEM_FONT_STACK }}>
      <div>
        <h3 className="flex items-center gap-2 text-xs font-semibold text-white sm:text-sm">
          <TrendingUp className="h-4 w-4 text-[#ffd60a]" />
          Analítica de hábitos
        </h3>
        <p className="mt-0.5 text-[11px] text-white/40">Adherencia, campeones de racha y patrones de consistencia</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Adherencia prom.</span>
            <span className="rounded-full bg-white/5 p-1.5 text-[#ffd60a]"><TrendingUp className="h-3.5 w-3.5" /></span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white sm:text-xl">{averageAdherence}%</div>
          <div className="mt-0.5 text-[10px] text-white/40">Consistencia de 30 días</div>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Hábitos activos</span>
            <span className="rounded-full bg-white/5 p-1.5 text-[#ffd60a]"><Layers className="h-3.5 w-3.5" /></span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-white sm:text-xl">{habits.length}</div>
          <div className="mt-0.5 text-[10px] text-white/40">En tu rutina diaria</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="space-y-3 rounded-[20px] border border-white/10 bg-white/[0.05] p-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-white sm:text-sm">
              <Flame className="h-3.5 w-3.5 fill-[#ffd60a] text-[#ffd60a]" />
              Tabla de rachas
            </h4>
            <span className="text-[10px] text-white/40">Ordenado por racha</span>
          </div>
          <div className="space-y-2">
            {rankedHabits.map((habit, index) => {
              const stats = statsMap[habit.id] ?? { currentStreak: 0, longestStreak: 0, completionRateLast30Days: 0, totalCompletions: 0 };
              return (
                <div key={habit.id} className="flex items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-2.5 transition-colors hover:bg-white/[0.06]">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        index === 0 ? "bg-[#ffd60a] text-[#171410]" : index < 3 ? "bg-white/15 text-white" : "border border-white/10 text-white/50"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: habit.color || "#ffd60a" }} />
                        <span className="truncate text-xs font-semibold text-white">{habit.name}</span>
                      </div>
                      <div className="text-[10px] text-white/40">Mejor racha: {stats.longestStreak} días</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-[#ffd60a]">
                      <Flame className="h-2.5 w-2.5 fill-[#ffd60a] text-[#ffd60a]" />
                      <span>{stats.currentStreak}d</span>
                    </div>
                    <div className="hidden w-20 sm:block">
                      <div className="mb-0.5 flex justify-between text-[9px] text-white/30">
                        <span>Tasa</span>
                        <span className="font-semibold text-white">{stats.completionRateLast30Days}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#ffd60a]" style={{ width: `${stats.completionRateLast30Days}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-[20px] border border-white/10 bg-white/[0.05] p-4">
          <div className="border-b border-white/10 pb-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-white sm:text-sm">
              <Calendar className="h-3.5 w-3.5 text-[#ffd60a]" />
              Actividad por día
            </h4>
            <p className="text-[10px] text-white/40">Check-ins completados por día</p>
          </div>
          <div className="space-y-2 pt-1">
            {dayOfWeekStats.map((item) => (
              <div key={item.day} className="space-y-0.5">
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span className="text-white">{item.day}</span>
                  <span className="text-white/40">{item.count} check-ins</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <div className="h-full rounded-full bg-[#ffd60a] transition-all duration-500" style={{ width: `${item.percentOfMax}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3">
            <h5 className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/30">
              <Sparkles className="h-3 w-3 text-[#ffd60a]" />
              <span>Resumen</span>
            </h5>
            <div className="space-y-1.5">
              {habits.slice(0, 5).map((h) => (
                <div key={h.id} className="flex items-center justify-between text-[11px]">
                  <span className="max-w-[130px] truncate font-medium text-white/50">{h.name}</span>
                  <span className="font-bold text-white">{statsMap[h.id]?.totalCompletions ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
