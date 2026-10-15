import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  CalendarDays,
  Sparkles,
  Plus,
  ListTodo,
} from 'lucide-react';
import { Habit } from '../../types/habit';
import { useHabits } from '../../context/HabitContext';
import { HabitCard } from './HabitCard';
import { WeeklyMatrix } from './WeeklyMatrix';
import { MonthlyMatrix } from './MonthlyMatrix';
import { AnalyticsSection } from '../analytics/AnalyticsSection';

interface HabitListProps {
  onOpenDetails: (habit: Habit) => void;
  onOpenEdit: (habit: Habit) => void;
  onDeleteRequest: (habit: Habit) => void;
  onOpenNewHabitModal: () => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  onOpenDetails,
  onOpenEdit,
  onDeleteRequest,
  onOpenNewHabitModal,
}) => {
  const { habits, logs, statsMap, selectedDate } = useHabits();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'weekly' | 'monthly'>('cards');

  // Filter habits by search query
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      if (habit.archived) return false;
      return (
        habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [habits, searchQuery]);

  // Today's completion rate
  const completedTodayCount = habits.filter((h) => statsMap[h.id]?.isCompletedToday).length;
  const totalHabitsCount = habits.length;
  const completionPercentage = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Compact Daily Momentum Banner */}
      <div className="bg-white px-4 sm:px-5 py-3 rounded-[20px] shadow-2xs border border-[#f2ede8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#5a5a40] tracking-tight">
              {completionPercentage}%
            </span>
            <span className="text-xs text-[#8a847c] font-medium">
              Daily Momentum ({completedTodayCount} of {totalHabitsCount} done)
            </span>
          </div>
          <div className="flex-1 max-w-xs bg-[#f8f5f2] h-2 rounded-full overflow-hidden border border-[#e9e4df] hidden md:block">
            <div
              className="bg-[#5a5a40] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-serif italic text-[#8a847c] shrink-0">
          <span>{selectedDate}</span>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="bg-white border border-[#f2ede8] rounded-[20px] p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a39d94]" />
            <input
              type="text"
              id="search-habits-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-full focus:outline-none focus:ring-1 focus:ring-[#5a5a40] focus:bg-white transition-all text-[#2d2a26]"
            />
          </div>

          {/* View Mode Toggle: Daily Cards, Weekly Grid, Monthly Grid */}
          <div className="flex items-center bg-[#f8f5f2] p-0.5 rounded-full border border-[#e9e4df] self-start md:self-auto">
            <button
              id="view-cards-btn"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#5a5a40] text-white shadow-2xs'
                  : 'text-[#8a847c] hover:text-[#3d3d2e]'
              }`}
            >
              <ListTodo className="w-3 h-3" />
              <span>Daily Cards</span>
            </button>
            <button
              id="view-weekly-btn"
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-[#5a5a40] text-white shadow-2xs'
                  : 'text-[#8a847c] hover:text-[#3d3d2e]'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Weekly Grid</span>
            </button>
            <button
              id="view-monthly-btn"
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-[#5a5a40] text-white shadow-2xs'
                  : 'text-[#8a847c] hover:text-[#3d3d2e]'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              <span>Monthly Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'weekly' && <WeeklyMatrix />}
      {viewMode === 'monthly' && <MonthlyMatrix />}
      {viewMode === 'cards' && (
        <>
          {filteredHabits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredHabits.map((habit) => {
                const log = logs.find((l) => l.habitId === habit.id && l.date === selectedDate);
                const stats = statsMap[habit.id] || {
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
            <div className="bg-white border border-[#f2ede8] rounded-[24px] p-10 text-center shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-[#f2ede8] text-[#5a5a40] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-serif font-bold text-[#3d3d2e]">No habits found</h3>
              <p className="text-xs text-[#8a847c] mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No habits matching "${searchQuery}". Try clearing search.`
                  : 'Start tracking new habits to unlock streaks and statistics!'}
              </p>
              <button
                id="empty-state-add-habit-btn"
                onClick={onOpenNewHabitModal}
                className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white bg-[#5a5a40] hover:bg-[#4b4b35] rounded-full transition-all shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Habit</span>
              </button>
            </div>
          )}
        </>
      )}
      {/* Analytics Section Integrated Directly */}
      <AnalyticsSection />
    </div>
  );
};
