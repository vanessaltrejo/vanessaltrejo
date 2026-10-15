"use client";

import { useMemo } from "react";
import { X, Flame, Trophy, CheckCircle2, Calendar, BarChart3, MessageSquare, FileSpreadsheet, Target, Edit2, Trash2 } from "lucide-react";
import type { Habit } from "@/lib/habits/types";
import { useHabits } from "@/lib/habits/HabitsContext";
import { formatDateKey } from "@/lib/habits/storage";
import { SYSTEM_FONT_STACK, DISPLAY_SERIF_STYLE } from "@/lib/fonts";
import { HABIT_CATEGORY_LABELS } from "./icons";

interface HabitDetailModalProps {
  habit: Habit | null;
  onClose: () => void;
  onOpenEdit: (habit: Habit) => void;
  onDeleteRequest: (habit: Habit) => void;
}

export function HabitDetailModal({ habit, onClose, onOpenEdit, onDeleteRequest }: HabitDetailModalProps) {
  const { logs, statsMap, sheetConfig } = useHabits();

  // Hooks must run unconditionally, so the heatmap is computed against a
  // placeholder id (filters to nothing) whenever there's no habit — cheap
  // to discard versus branching the hooks themselves.
  const habitId = habit?.id ?? "";

  const habitLogs = useMemo(
    () => logs.filter((l) => l.habitId === habitId).sort((a, b) => b.date.localeCompare(a.date)),
    [logs, habitId]
  );

  const heatmapDays = useMemo(() => {
    const completedSet = new Set(habitLogs.filter((l) => l.completed).map((l) => l.date));
    const now = new Date();
    return Array.from({ length: 60 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (59 - i));
      const dateKey = formatDateKey(d);
      return { dateKey, completed: completedSet.has(dateKey), label: d.toLocaleDateString("es-MX", { month: "short", day: "numeric" }) };
    });
  }, [habitLogs]);

  if (!habit) return null;

  const stats = statsMap[habit.id] ?? { currentStreak: 0, longestStreak: 0, totalCompletions: 0, completionRateLast30Days: 0, isCompletedToday: false };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-[#20222d] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: habit.color || "#ffd60a" }}>
              <Target className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg text-white" style={DISPLAY_SERIF_STYLE}>{habit.name}</h3>
                <span
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ffd60a]"
                  style={{ fontFamily: SYSTEM_FONT_STACK }}
                >
                  {HABIT_CATEGORY_LABELS[habit.category]}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-white/40" style={{ fontFamily: SYSTEM_FONT_STACK }}>
                {habit.description || "Hábito sincronizado con Google Sheets"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { onClose(); onOpenEdit(habit); }} title="Editar" className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
              <Edit2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => { onClose(); onDeleteRequest(habit); }} title="Eliminar" className="rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onClose} className="ml-1 rounded-full p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6" style={{ fontFamily: SYSTEM_FONT_STACK }}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: Flame, label: "Racha actual", value: `${stats.currentStreak}`, unit: "días" },
              { icon: Trophy, label: "Mejor racha", value: `${stats.longestStreak}`, unit: "días" },
              { icon: CheckCircle2, label: "Completados", value: `${stats.totalCompletions}`, unit: "total" },
              { icon: BarChart3, label: "Adherencia 30d", value: `${stats.completionRateLast30Days}%`, unit: "" },
            ].map(({ icon: Icon, label, value, unit }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ffd60a]">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
                <div className="mt-1 text-xl font-bold text-white">
                  {value} {unit && <span className="text-xs font-normal text-white/40">{unit}</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
                <Calendar className="h-3.5 w-3.5 text-[#ffd60a]" />
                <span>Heatmap de 60 días</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-white/40">
                <span>Sin marcar</span>
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffd60a]" />
                <span>Hecho</span>
              </div>
            </div>
            <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-12">
              {heatmapDays.map((d) => (
                <div
                  key={d.dateKey}
                  title={`${d.label} (${d.dateKey}): ${d.completed ? "Completado" : "No completado"}`}
                  className={`h-5 rounded-sm transition-all ${d.completed ? "bg-[#ffd60a] hover:scale-110" : "bg-white/10 hover:bg-white/15"}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-[#ffd60a]" />
                <span className="text-xs font-semibold text-white">Integración con Google Sheets</span>
              </div>
              {sheetConfig && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-semibold text-[#ffd60a]">Sincronizado</span>
              )}
            </div>
            <div className="mt-2 space-y-1 text-xs text-white/40">
              <div>
                <strong className="text-white">Columna:</strong>{" "}
                <span className="font-mono font-semibold text-[#ffd60a]">{habit.sheetColumnName || habit.name}</span>
              </div>
              <div>
                <strong className="text-white">Hoja conectada:</strong> {sheetConfig ? sheetConfig.spreadsheetName : "Ninguna todavía"}
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
              <MessageSquare className="h-3.5 w-3.5 text-[#ffd60a]" />
              <span>Historial reciente</span>
            </h4>
            {habitLogs.length > 0 ? (
              <div className="space-y-2">
                {habitLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{log.date}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${log.completed ? "border border-white/10 bg-white/5 text-[#ffd60a]" : "bg-white/5 text-white/40"}`}>
                          {log.completed ? "Completado" : "No completado"}
                        </span>
                      </div>
                      {log.notes && <p className="mt-1.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-[11px] italic text-white/50">&ldquo;{log.notes}&rdquo;</p>}
                    </div>
                    <div className="shrink-0 font-mono text-[10px] text-white/30">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-white/30">Todavía no hay check-ins registrados.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
