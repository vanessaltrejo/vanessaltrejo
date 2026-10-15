import React, { useState } from 'react';
import {
  Check,
  Flame,
  Trophy,
  MoreVertical,
  Edit2,
  Trash2,
  BarChart2,
  Sparkles,
  Droplets,
  BookOpen,
  Dumbbell,
  Moon,
  Code2,
  Heart,
  Zap,
  Coffee,
  Target,
  Sun,
  Activity,
  PenLine,
} from 'lucide-react';
import { Habit, HabitLog, HabitStreakStats } from '../../types/habit';
import { useHabits } from '../../context/HabitContext';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  stats: HabitStreakStats;
  onOpenDetails: (habit: Habit) => void;
  onOpenEdit: (habit: Habit) => void;
  onDeleteRequest: (habit: Habit) => void;
}

// Icon helper map
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Droplets,
  BookOpen,
  Dumbbell,
  Sparkles,
  Moon,
  Heart,
  Zap,
  Coffee,
  Target,
  Sun,
  Activity,
  PenLine,
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  stats,
  onOpenDetails,
  onOpenEdit,
  onDeleteRequest,
}) => {
  const { toggleHabitCompletion, selectedDate } = useHabits();
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = log?.completed ?? false;
  const IconComponent = ICON_MAP[habit.iconName] || Target;

  const handleToggle = () => {
    toggleHabitCompletion(habit.id, selectedDate, habit.targetValue);
  };

  return (
    <div
      id={`habit-card-${habit.id}`}
      className={`group relative bg-white border rounded-[20px] p-3.5 sm:p-4 transition-all duration-200 shadow-2xs hover:shadow-xs ${
        isCompleted
          ? 'border-[#5a5a40]/30 bg-gradient-to-br from-white to-[#f8f5f2]'
          : 'border-[#f2ede8] hover:border-[#e9e4df]'
      }`}
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left Side: Checkbox, Habit Icon & Title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Main Interactive Check Button */}
          <button
            id={`check-habit-${habit.id}`}
            onClick={handleToggle}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isCompleted
                ? 'bg-[#5a5a40] text-white shadow-2xs scale-105 active:scale-95'
                : 'border-2 border-[#e9e4df] hover:border-[#5a5a40] text-transparent bg-[#f8f5f2]/60'
            }`}
            title={isCompleted ? 'Mark as incomplete' : 'Mark as completed for this day'}
          >
            <Check className={`w-3.5 h-3.5 stroke-[2.5] ${isCompleted ? 'opacity-100' : 'opacity-0'}`} />
          </button>

          {/* Habit Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
                style={{ backgroundColor: habit.color || '#5a5a40' }}
              >
                <IconComponent className="w-2.5 h-2.5" />
              </div>

              <h3
                onClick={() => onOpenDetails(habit)}
                className={`text-xs sm:text-sm font-serif font-bold text-[#3d3d2e] truncate hover:text-[#5a5a40] cursor-pointer transition-colors ${
                  isCompleted ? 'line-through text-[#8a847c]' : ''
                }`}
              >
                {habit.name}
              </h3>
            </div>

            {/* Target Value Pill */}
            {habit.targetValue && (
              <div className="flex items-center gap-1 mt-0.5 text-[10px] font-medium text-[#8a847c]">
                <Target className="w-2.5 h-2.5 text-[#5a5a40]" />
                <span>Target: {habit.targetValue} {habit.targetUnit}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Streaks & Options Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Current Streak Badge */}
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
              stats.currentStreak > 0
                ? 'bg-[#f2ede8] text-[#5a5a40] border border-[#e9e4df] shadow-2xs'
                : 'bg-[#f8f5f2] text-[#a39d94]'
            }`}
            title={`Current Streak: ${stats.currentStreak} days (Best: ${stats.longestStreak} days)`}
          >
            <Flame className={`w-3 h-3 ${stats.currentStreak > 0 ? 'text-[#5a5a40] fill-[#5a5a40]' : 'text-[#a39d94]'}`} />
            <span>{stats.currentStreak}d</span>
          </div>

          {/* Quick Menu */}
          <div className="relative">
            <button
              id={`habit-menu-btn-${habit.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-[#8a847c] hover:text-[#3d3d2e] hover:bg-[#f8f5f2] rounded-full transition-colors cursor-pointer"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-[#e9e4df] rounded-2xl shadow-lg p-1.5 z-20 text-xs">
                <button
                  id={`habit-open-details-${habit.id}`}
                  onClick={() => {
                    setShowMenu(false);
                    onOpenDetails(habit);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[#3d3d2e] hover:bg-[#f8f5f2] rounded-xl text-left cursor-pointer font-medium"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-[#5a5a40]" />
                  <span>Stats & History</span>
                </button>
                <button
                  id={`habit-open-edit-${habit.id}`}
                  onClick={() => {
                    setShowMenu(false);
                    onOpenEdit(habit);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[#3d3d2e] hover:bg-[#f8f5f2] rounded-xl text-left cursor-pointer font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#8a847c]" />
                  <span>Edit Habit</span>
                </button>
                <div className="border-t border-[#f2ede8] my-1" />
                <button
                  id={`habit-delete-req-${habit.id}`}
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteRequest(habit);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-red-700 hover:bg-red-50 rounded-xl text-left cursor-pointer font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Habit</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Footer: Best Streak */}
      <div className="mt-2.5 pt-2 border-t border-[#f2ede8] flex items-center justify-between text-[10px] text-[#8a847c]">
        <div className="flex items-center gap-1">
          <Trophy className="w-2.5 h-2.5 text-[#5a5a40]" />
          <span>Longest: <strong className="text-[#3d3d2e] font-serif">{stats.longestStreak}d</strong></span>
        </div>
        <span className="text-[#a39d94]">
          {isCompleted ? 'Done today' : 'Pending today'}
        </span>
      </div>
    </div>
  );
};
