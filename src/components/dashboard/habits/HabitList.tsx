"use client";

import { useMemo, useState } from "react";
import { Search, Calendar, CalendarDays, Sparkles, Plus, ListTodo } from "lucide-react";
import type { Habit } from "@/lib/habits/types";
import { useHabits } from "@/lib/habits/HabitsContext";
import { SYSTEM_FONT_STACK, DISPLAY_SERIF_STYLE } from "@/lib/fonts";
import { HabitCard } from "./HabitCard";
import { WeeklyMatrix } from "./WeeklyMatrix";
import { MonthlyMatrix } from "./MonthlyMatrix";
import { AnalyticsSection } from "./AnalyticsSection";

interface HabitListProps {
  onOpenDetails: (habit: Habit) => void;
  onOpenEdit: (habit: Habit) => void;
  onDeleteRequest: (habit: Habit) => void;
  onOpenNewHabitModal: () => void;
}

export function HabitList({ onOpenDetails, onOpenEdit, onDeleteRequest, onOpenNewHabitModal }: HabitListProps) {
  const { habits, logs, statsMap, selectedDate } = useHabits();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "weekly" | "monthly">("cards");

  const filteredHabits = useMemo(
    () =>
      habits.filter(
        (habit) =>
          !habit.archived &&
          (habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            habit.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [habits, searchQuery]
  );

  const completedTodayCount = habits.filter((h) => statsMap[h.id]?.isCompletedToday).length;
  const completionPercentage = habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl leading-none text-[#ffd60a] sm:text-2xl" style={DISPLAY_SERIF_STYLE}>
              {completionPercentage}%
            </span>
            <span className="text-xs font-medium text-white/50" style={{ fontFamily: SYSTEM_FONT_STACK }}>
              Momentum diario ({completedTodayCount} de {habits.length})
            </span>
          </div>
          <div className="hidden h-2 max-w-xs flex-1 overflow-hidden rounded-full border border-white/10 bg-white/5 md:block">
            <div className="h-full rounded-full bg-[#ffd60a] transition-all duration-500 ease-out" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
        <div className="shrink-0 text-xs italic text-white/40" style={{ fontFamily: SYSTEM_FONT_STACK }}>
          {selectedDate}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] p-3 sm:p-3.5" style={{ fontFamily: SYSTEM_FONT_STACK }}>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar hábitos…"
              className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 pl-9 pr-4 text-xs text-white placeholder-white/30 transition-all focus:border-[#ffd60a]/50 focus:bg-white/10 focus:outline-none"
            />
          </div>

          <div className="flex items-center self-start rounded-full border border-white/10 bg-white/5 p-0.5 md:self-auto">
            {([
              { key: "cards", label: "Tarjetas", icon: ListTodo },
              { key: "weekly", label: "Semanal", icon: Calendar },
              { key: "monthly", label: "Mensual", icon: CalendarDays },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setViewMode(key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  viewMode === key ? "bg-[#ffd60a] text-[#171410]" : "text-white/50 hover:text-white"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === "weekly" && <WeeklyMatrix />}
      {viewMode === "monthly" && <MonthlyMatrix />}
      {viewMode === "cards" && (
        <>
          {filteredHabits.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredHabits.map((habit) => {
                const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
                const stats = statsMap[habit.id] ?? {
                  currentStreak: 0,
                  longestStreak: 0,
                  totalCompletions: 0,
                  completionRateLast30Days: 0,
                  isCompletedToday: false,
                };
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    log={log}
                    stats={stats}
                    onOpenDetails={onOpenDetails}
                    onOpenEdit={onOpenEdit}
                    onDeleteRequest={onDeleteRequest}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-10 text-center" style={{ fontFamily: SYSTEM_FONT_STACK }}>
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-[#ffd60a]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">No se encontraron hábitos</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-white/40">
                {searchQuery ? `Nada coincide con "${searchQuery}".` : "Empieza a trackear hábitos para desbloquear rachas y estadísticas."}
              </p>
              <button
                type="button"
                onClick={onOpenNewHabitModal}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ffd60a] px-4 py-1.5 text-xs font-semibold text-[#171410] transition-transform hover:scale-105"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Crear hábito</span>
              </button>
            </div>
          )}
        </>
      )}

      <AnalyticsSection />
    </div>
  );
}
