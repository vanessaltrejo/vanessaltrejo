"use client";

import { useMemo, useState } from "react";
import { Check, Flame, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useHabits } from "@/lib/habits/HabitsContext";
import { formatDateKey, getTodayKey, MIN_DATE_KEY } from "@/lib/habits/storage";
import { SYSTEM_FONT_STACK } from "@/lib/fonts";

export function WeeklyMatrix() {
  const { habits, logs, statsMap, selectedDate, toggleHabitCompletion } = useHabits();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const curr = new Date(y, m - 1, d);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7;
    const monday = new Date(curr.getFullYear(), curr.getMonth(), diff);
    const todayKey = getTodayKey();

    return Array.from({ length: 7 }, (_, i) => {
      const target = new Date(monday);
      target.setDate(monday.getDate() + i);
      const dateKey = formatDateKey(target);
      return {
        dateKey,
        dayName: target.toLocaleDateString("es-MX", { weekday: "short" }),
        dayNum: target.getDate(),
        isToday: dateKey === todayKey,
        isBeforeMin: dateKey < MIN_DATE_KEY,
      };
    });
  }, [selectedDate, weekOffset]);

  const isMinWeek = weekDays.some((d) => d.dateKey <= MIN_DATE_KEY);

  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    logs.forEach((l) => l.completed && map.set(`${l.habitId}_${l.date}`, true));
    return map;
  }, [logs]);

  const weekRangeLabel = `${weekDays[0].dayNum} ${new Date(`${weekDays[0].dateKey}T12:00:00`).toLocaleDateString("es-MX", { month: "short" })} - ${weekDays[6].dayNum} ${new Date(`${weekDays[6].dateKey}T12:00:00`).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}`;

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 sm:p-5" style={{ fontFamily: SYSTEM_FONT_STACK }}>
      <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-white sm:text-sm">
            <Calendar className="h-4 w-4 text-[#ffd60a]" />
            Matriz semanal
          </h3>
          <p className="mt-0.5 text-[11px] text-white/40">Marca tus metas diarias en toda la semana</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:self-center">
          <button type="button" onClick={() => setWeekOffset((p) => p - 1)} disabled={isMinWeek && weekOffset <= 0} className="rounded-full p-1 text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[140px] px-2 text-center text-xs font-semibold text-white">{weekRangeLabel}</span>
          <button type="button" onClick={() => setWeekOffset((p) => p + 1)} className="rounded-full p-1 text-white/50 transition-colors hover:text-white">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="w-1/3 pb-3 pl-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Hábito</th>
              {weekDays.map((d) => (
                <th key={d.dateKey} className={`pb-3 text-center text-xs font-semibold ${d.isToday ? "text-[#ffd60a]" : "text-white/40"}`}>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/30">{d.dayName}</span>
                    <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${d.isToday ? "bg-[#ffd60a] font-bold text-[#171410]" : d.isBeforeMin ? "text-white/20" : "text-white"}`}>
                      {d.dayNum}
                    </span>
                  </div>
                </th>
              ))}
              <th className="pb-3 pr-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">Racha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {habits.map((habit) => {
              const stats = statsMap[habit.id] ?? { currentStreak: 0 };
              return (
                <tr key={habit.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="py-2.5 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: habit.color || "#ffd60a" }} />
                      <span className="max-w-[180px] truncate text-xs font-semibold text-white">{habit.name}</span>
                    </div>
                  </td>
                  {weekDays.map((d) => {
                    const isDone = completionMap.has(`${habit.id}_${d.dateKey}`);
                    return (
                      <td key={d.dateKey} className="py-2 text-center">
                        {d.isBeforeMin ? (
                          <div className="mx-auto h-6 w-6 cursor-not-allowed rounded-full bg-white/5 opacity-40" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleHabitCompletion(habit.id, d.dateKey, habit.targetValue)}
                            title={`${habit.name} el ${d.dateKey}: ${isDone ? "completado" : "pendiente"}`}
                            className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full transition-all ${
                              isDone ? "scale-105 bg-[#ffd60a] text-[#171410]" : "bg-white/10 text-transparent hover:bg-white/20"
                            }`}
                          >
                            <Check className={`h-3 w-3 stroke-[3] ${isDone ? "opacity-100" : "opacity-0"}`} />
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-2.5 pr-2 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[#ffd60a]">
                      <Flame className="h-2.5 w-2.5 fill-[#ffd60a] text-[#ffd60a]" />
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
}
