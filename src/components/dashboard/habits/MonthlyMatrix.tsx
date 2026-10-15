"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useHabits } from "@/lib/habits/HabitsContext";
import { formatDateKey, getTodayKey, MIN_DATE_KEY } from "@/lib/habits/storage";
import { SYSTEM_FONT_STACK } from "@/lib/fonts";

export function MonthlyMatrix() {
  const { habits, logs, selectedDate, toggleHabitCompletion } = useHabits();

  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const [y, m] = selectedDate.split("-").map(Number);
    return { year: y || 2026, month: (m || 8) - 1 };
  });
  const { year, month } = currentYearMonth;
  const isMinMonth = year === 2026 && month <= 7;

  const handlePrevMonth = () => {
    if (isMinMonth) return;
    setCurrentYearMonth((prev) => (prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }));
  };
  const handleNextMonth = () => {
    setCurrentYearMonth((prev) => (prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }));
  };

  const monthDays = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = getTodayKey();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const targetDate = new Date(year, month, d);
      const dateKey = formatDateKey(targetDate);
      return {
        dateKey,
        dayName: targetDate.toLocaleDateString("es-MX", { weekday: "narrow" }),
        dayNum: d,
        isToday: dateKey === todayKey,
        isBeforeMin: dateKey < MIN_DATE_KEY,
      };
    });
  }, [year, month]);

  const completionMap = useMemo(() => {
    const map = new Map<string, boolean>();
    logs.forEach((l) => l.completed && map.set(`${l.habitId}_${l.date}`, true));
    return map;
  }, [logs]);

  const monthLabel = new Date(year, month, 1).toLocaleDateString("es-MX", { month: "long", year: "numeric" });

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 sm:p-5" style={{ fontFamily: SYSTEM_FONT_STACK }}>
      <div className="mb-4 flex flex-col gap-3 border-b border-white/10 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-xs font-semibold text-white sm:text-sm">
            <CalendarDays className="h-4 w-4 text-[#ffd60a]" />
            Matriz mensual
          </h3>
          <p className="mt-0.5 text-[11px] capitalize text-white/40">Vista completa de {monthLabel}</p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-2 py-1 sm:self-center">
          <button type="button" onClick={handlePrevMonth} disabled={isMinMonth} className="rounded-full p-1 text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[110px] px-2 text-center text-xs font-semibold capitalize text-white">{monthLabel}</span>
          <button type="button" onClick={handleNextMonth} className="rounded-full p-1 text-white/50 transition-colors hover:text-white">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="sticky left-0 z-10 min-w-[150px] bg-[#1a1d29] pb-3 pl-2 pr-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Hábito</th>
              {monthDays.map((d) => (
                <th key={d.dateKey} className={`px-1 pb-3 text-center text-[10px] font-semibold ${d.isToday ? "text-[#ffd60a]" : "text-white/40"}`}>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/30">{d.dayName}</span>
                    <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${d.isToday ? "bg-[#ffd60a] font-bold text-[#171410]" : d.isBeforeMin ? "text-white/20" : "text-white"}`}>
                      {d.dayNum}
                    </span>
                  </div>
                </th>
              ))}
              <th className="sticky right-0 z-10 min-w-[60px] bg-[#1a1d29] px-2 pb-3 text-center text-[10px] font-bold uppercase tracking-widest text-white/30">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {habits.map((habit) => {
              let monthCompletedCount = 0;
              monthDays.forEach((d) => completionMap.has(`${habit.id}_${d.dateKey}`) && monthCompletedCount++);

              return (
                <tr key={habit.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="sticky left-0 z-10 bg-[#1a1d29] py-2.5 pl-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: habit.color || "#ffd60a" }} />
                      <span className="max-w-[140px] truncate text-xs font-semibold text-white">{habit.name}</span>
                    </div>
                  </td>
                  {monthDays.map((d) => {
                    const isDone = completionMap.has(`${habit.id}_${d.dateKey}`);
                    return (
                      <td key={d.dateKey} className="px-1 py-2 text-center">
                        {d.isBeforeMin ? (
                          <div className="mx-auto h-5 w-5 cursor-not-allowed rounded-full bg-white/5 opacity-40" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleHabitCompletion(habit.id, d.dateKey, habit.targetValue)}
                            title={`${habit.name} el ${d.dateKey}: ${isDone ? "completado" : "pendiente"}`}
                            className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full transition-all ${
                              isDone ? "scale-105 bg-[#ffd60a] text-[#171410]" : "bg-white/10 text-transparent hover:bg-white/20"
                            }`}
                          >
                            <Check className={`h-3 w-3 stroke-[3] ${isDone ? "opacity-100" : "opacity-0"}`} />
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="sticky right-0 z-10 bg-[#1a1d29] px-2 py-2.5 text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[#ffd60a]">
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
}
