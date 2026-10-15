"use client";

import { useState } from "react";
import { Check, Flame, Trophy, MoreVertical, Edit2, Trash2, BarChart2, Target } from "lucide-react";
import type { Habit, HabitLog, HabitStreakStats } from "@/lib/habits/types";
import { useHabits } from "@/lib/habits/HabitsContext";
import { SYSTEM_FONT_STACK } from "@/lib/fonts";
import { HABIT_ICON_MAP } from "./icons";

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  stats: HabitStreakStats;
  onOpenDetails: (habit: Habit) => void;
  onOpenEdit: (habit: Habit) => void;
  onDeleteRequest: (habit: Habit) => void;
}

export function HabitCard({ habit, log, stats, onOpenDetails, onOpenEdit, onDeleteRequest }: HabitCardProps) {
  const { toggleHabitCompletion, selectedDate } = useHabits();
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = log?.completed ?? false;
  const IconComponent = HABIT_ICON_MAP[habit.iconName] ?? Target;

  return (
    <div
      className={`group relative rounded-[20px] border p-3.5 transition-all duration-200 sm:p-4 ${
        isCompleted ? "border-[#ffd60a]/30 bg-[#ffd60a]/[0.06]" : "border-white/10 bg-white/[0.05] hover:border-white/20"
      }`}
      style={{ fontFamily: SYSTEM_FONT_STACK }}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <button
            type="button"
            onClick={() => toggleHabitCompletion(habit.id, selectedDate, habit.targetValue)}
            title={isCompleted ? "Marcar como pendiente" : "Marcar como completado"}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all sm:h-7 sm:w-7 ${
              isCompleted ? "scale-105 bg-[#ffd60a] text-[#171410]" : "border-2 border-white/20 bg-white/5 text-transparent hover:border-[#ffd60a]/60"
            }`}
          >
            <Check className={`h-3.5 w-3.5 stroke-[2.5] ${isCompleted ? "opacity-100" : "opacity-0"}`} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: habit.color || "#ffd60a" }}
              >
                <IconComponent className="h-2.5 w-2.5" />
              </span>
              <h3
                onClick={() => onOpenDetails(habit)}
                className={`cursor-pointer truncate text-xs font-semibold transition-colors hover:text-[#ffd60a] sm:text-sm ${
                  isCompleted ? "text-white/50 line-through" : "text-white"
                }`}
              >
                {habit.name}
              </h3>
            </div>
            {habit.targetValue && (
              <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-white/40">
                <Target className="h-2.5 w-2.5 text-white/40" />
                <span>Meta: {habit.targetValue} {habit.targetUnit}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div
            title={`Racha actual: ${stats.currentStreak} días (mejor: ${stats.longestStreak})`}
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              stats.currentStreak > 0 ? "border border-white/10 bg-white/5 text-[#ffd60a]" : "text-white/30"
            }`}
          >
            <Flame className={`h-3 w-3 ${stats.currentStreak > 0 ? "fill-[#ffd60a] text-[#ffd60a]" : "text-white/30"}`} />
            <span>{stats.currentStreak}d</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              className="rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 z-20 mt-1 w-40 rounded-2xl border border-white/10 bg-[#20222d] p-1.5 text-xs shadow-xl">
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); onOpenDetails(habit); }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-medium text-white hover:bg-white/10"
                >
                  <BarChart2 className="h-3.5 w-3.5 text-[#ffd60a]" />
                  <span>Estadísticas</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); onOpenEdit(habit); }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-medium text-white hover:bg-white/10"
                >
                  <Edit2 className="h-3.5 w-3.5 text-white/60" />
                  <span>Editar</span>
                </button>
                <div className="my-1 border-t border-white/10" />
                <button
                  type="button"
                  onClick={() => { setShowMenu(false); onDeleteRequest(habit); }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left font-medium text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/40">
        <div className="flex items-center gap-1">
          <Trophy className="h-2.5 w-2.5 text-[#ffd60a]" />
          <span>Mejor: <strong className="font-semibold text-white">{stats.longestStreak}d</strong></span>
        </div>
        <span>{isCompleted ? "Completado hoy" : "Pendiente hoy"}</span>
      </div>
    </div>
  );
}
