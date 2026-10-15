import React, { useMemo } from 'react';
import {
  X,
  Flame,
  Trophy,
  CheckCircle2,
  Calendar,
  BarChart3,
  MessageSquare,
  FileSpreadsheet,
  Clock,
  Target,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Habit } from '../../types/habit';
import { useHabits } from '../../context/HabitContext';
import { formatDateKey } from '../../services/habitStorageService';

interface HabitDetailModalProps {
  habit: Habit | null;
  onClose: () => void;
  onOpenEdit: (habit: Habit) => void;
  onDeleteRequest: (habit: Habit) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habit,
  onClose,
  onOpenEdit,
  onDeleteRequest,
}) => {
  const { logs, statsMap, sheetConfig } = useHabits();

  if (!habit) return null;

  const stats = statsMap[habit.id] || {
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    completionRateLast30Days: 0,
    isCompletedToday: false,
  };

  // Get all logs for this habit sorted by date descending
  const habitLogs = useMemo(() => {
    return logs
      .filter((l) => l.habitId === habit.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [logs, habit.id]);

  // Calendar Heatmap for the past 60 days
  const heatmapDays = useMemo(() => {
    const completedSet = new Set(habitLogs.filter((l) => l.completed).map((l) => l.date));
    const days: Array<{ dateKey: string; completed: boolean; label: string }> = [];
    const now = new Date();

    for (let i = 59; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = formatDateKey(d);
      days.push({
        dateKey,
        completed: completedSet.has(dateKey),
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [habitLogs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-xs overflow-y-auto">
      <div
        id="habit-detail-modal-dialog"
        className="w-full max-w-2xl bg-white rounded-[28px] shadow-xl border border-[#f2ede8] overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#f2ede8] bg-[#f8f5f2]/60">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: habit.color || '#5a5a40' }}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#3d3d2e]">{habit.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#f2ede8] text-[#5a5a40] border border-[#e9e4df] rounded-full">
                  {habit.category}
                </span>
              </div>
              <p className="text-xs text-[#8a847c] mt-0.5">
                {habit.description || 'Continuous habit tracking & Google Sheets synchronized'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-edit-habit-btn"
              onClick={() => {
                onClose();
                onOpenEdit(habit);
              }}
              className="p-2 text-[#8a847c] hover:text-[#3d3d2e] hover:bg-[#f2ede8] rounded-full transition-colors cursor-pointer"
              title="Edit Habit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              id="detail-delete-habit-btn"
              onClick={() => {
                onClose();
                onDeleteRequest(habit);
              }}
              className="p-2 text-[#8a847c] hover:text-[#a35540] hover:bg-[#f2ede8] rounded-full transition-colors cursor-pointer"
              title="Delete Habit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="close-detail-modal-btn"
              onClick={onClose}
              className="p-2 text-[#a39d94] hover:text-[#3d3d2e] hover:bg-[#f2ede8] rounded-full transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#f8f5f2] border border-[#f2ede8] rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5a40]">
                <Flame className="w-4 h-4 text-[#5a5a40] fill-[#5a5a40]" />
                <span>Current Streak</span>
              </div>
              <div className="text-xl font-serif font-bold text-[#3d3d2e] mt-1">
                {stats.currentStreak} <span className="text-xs font-sans font-normal text-[#8a847c]">days</span>
              </div>
            </div>

            <div className="p-4 bg-[#f8f5f2] border border-[#f2ede8] rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5a40]">
                <Trophy className="w-4 h-4 text-[#5a5a40]" />
                <span>Best Streak</span>
              </div>
              <div className="text-xl font-serif font-bold text-[#3d3d2e] mt-1">
                {stats.longestStreak} <span className="text-xs font-sans font-normal text-[#8a847c]">days</span>
              </div>
            </div>

            <div className="p-4 bg-[#f8f5f2] border border-[#f2ede8] rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5a40]">
                <CheckCircle2 className="w-4 h-4 text-[#5a5a40]" />
                <span>Completions</span>
              </div>
              <div className="text-xl font-serif font-bold text-[#3d3d2e] mt-1">
                {stats.totalCompletions} <span className="text-xs font-sans font-normal text-[#8a847c]">total</span>
              </div>
            </div>

            <div className="p-4 bg-[#f8f5f2] border border-[#f2ede8] rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5a5a40]">
                <BarChart3 className="w-4 h-4 text-[#5a5a40]" />
                <span>30d Adherence</span>
              </div>
              <div className="text-xl font-serif font-bold text-[#3d3d2e] mt-1">
                {stats.completionRateLast30Days}%
              </div>
            </div>
          </div>

          {/* 60-Day Visual Activity Heatmap */}
          <div className="bg-[#f8f5f2] border border-[#f2ede8] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-bold text-[#a39d94] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5a5a40]" />
                <span>60-Day Consistency Heatmap</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#8a847c]">
                <span>Missed</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#e9e4df]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#5a5a40]" />
                <span>Done</span>
              </div>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-12 gap-1.5">
              {heatmapDays.map((d) => (
                <div
                  key={d.dateKey}
                  className={`h-5 rounded-xs transition-all ${
                    d.completed
                      ? 'bg-[#5a5a40] shadow-2xs hover:scale-110'
                      : 'bg-[#e9e4df] hover:bg-[#ded8d1]'
                  }`}
                  title={`${d.label} (${d.dateKey}): ${d.completed ? 'Completed' : 'Not completed'}`}
                />
              ))}
            </div>
          </div>

          {/* Google Sheets Sync Metadata */}
          <div className="bg-[#f8f5f2] border border-[#f2ede8] rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#5a5a40]" />
                <span className="text-xs font-serif font-bold text-[#3d3d2e]">Google Sheets Integration</span>
              </div>
              {sheetConfig && (
                <span className="text-[10px] font-semibold text-[#5a5a40] bg-[#f2ede8] border border-[#e9e4df] px-2.5 py-0.5 rounded-full">
                  Synchronized
                </span>
              )}
            </div>
            <div className="mt-2 text-xs text-[#8a847c] space-y-1">
              <div>
                <strong className="text-[#3d3d2e]">Sheet Column:</strong> <span className="font-mono text-[#5a5a40] font-semibold">{habit.sheetColumnName || habit.name}</span>
              </div>
              <div>
                <strong className="text-[#3d3d2e]">Connected Target:</strong> {sheetConfig ? sheetConfig.spreadsheetName : 'No Google Sheet connected yet'}
              </div>
            </div>
          </div>

          {/* Recent Check-ins and Notes Log */}
          <div>
            <h4 className="text-[10px] font-bold text-[#a39d94] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#5a5a40]" />
              <span>Recent Check-In History & Notes</span>
            </h4>

            {habitLogs.length > 0 ? (
              <div className="space-y-2">
                {habitLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#f8f5f2] border border-[#f2ede8] rounded-2xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-[#3d3d2e]">{log.date}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            log.completed ? 'bg-[#f2ede8] text-[#5a5a40] border border-[#e9e4df]' : 'bg-[#e9e4df] text-[#8a847c]'
                          }`}
                        >
                          {log.completed ? 'Completed' : 'Missed'}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-[#8a847c] mt-1.5 italic text-[11px] bg-white p-2.5 rounded-xl border border-[#f2ede8]">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                    <div className="text-[10px] text-[#a39d94] shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#a39d94] italic">No check-ins recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
