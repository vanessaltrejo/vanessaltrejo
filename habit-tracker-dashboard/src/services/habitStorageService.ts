import { Habit, HabitLog, HabitStreakStats, GoogleSheetConfig, SyncLogEntry } from '../types/habit';

const STORAGE_KEYS = {
  HABITS: 'vanessa_habits_goals_v4',
  LOGS: 'vanessa_habits_logs_goals_v4',
  SHEET_CONFIG: 'vanessa_google_sheet_config_v4',
  SYNC_LOGS: 'vanessa_sheet_sync_logs_v4',
};

export const MIN_DATE_KEY = '2026-08-01';

/**
 * Format a Date object as YYYY-MM-DD string
 */
export const formatDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Return today's date formatted as YYYY-MM-DD (cannot be before MIN_DATE_KEY)
 */
export const getTodayKey = (): string => {
  const today = formatDateKey(new Date());
  return today < MIN_DATE_KEY ? MIN_DATE_KEY : today;
};

/**
 * Initial curated starter habits for Vanessa matching her 5 specific goals:
 * 1. Journaling - target 10 min
 * 2. Exercise - target 30 min
 * 3. Sleep - target 6 hours
 * 4. Meditate - target 10 min
 * 5. Reading - target 2 pages
 */
const DEFAULT_INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-journaling',
    name: 'Journaling',
    description: 'Daily journaling and reflection',
    category: 'mindfulness',
    color: '#8B5CF6', // Purple
    iconName: 'PenLine',
    frequency: { type: 'daily' },
    targetValue: 10,
    targetUnit: 'min',
    createdAt: '2026-08-01T00:00:00.000Z',
    archived: false,
    sheetColumnName: 'Journaling',
  },
  {
    id: 'habit-exercise',
    name: 'Exercise',
    description: 'Daily physical movement and workout',
    category: 'fitness',
    color: '#10B981', // Emerald
    iconName: 'Dumbbell',
    frequency: { type: 'daily' },
    targetValue: 30,
    targetUnit: 'min',
    createdAt: '2026-08-01T00:00:00.000Z',
    archived: false,
    sheetColumnName: 'Exercise',
  },
  {
    id: 'habit-sleep',
    name: 'Sleep',
    description: 'Restorative deep sleep',
    category: 'health',
    color: '#3B82F6', // Blue
    iconName: 'Moon',
    frequency: { type: 'daily' },
    targetValue: 6,
    targetUnit: 'hours',
    createdAt: '2026-08-01T00:00:00.000Z',
    archived: false,
    sheetColumnName: 'Sleep',
  },
  {
    id: 'habit-meditate',
    name: 'Meditate',
    description: 'Mindful meditation and breathwork',
    category: 'mindfulness',
    color: '#F59E0B', // Amber
    iconName: 'Sparkles',
    frequency: { type: 'daily' },
    targetValue: 10,
    targetUnit: 'min',
    createdAt: '2026-08-01T00:00:00.000Z',
    archived: false,
    sheetColumnName: 'Meditate',
  },
  {
    id: 'habit-reading',
    name: 'Reading',
    description: 'Daily book reading',
    category: 'learning',
    color: '#EC4899', // Pink
    iconName: 'BookOpen',
    frequency: { type: 'daily' },
    targetValue: 2,
    targetUnit: 'pages',
    createdAt: '2026-08-01T00:00:00.000Z',
    archived: false,
    sheetColumnName: 'Reading',
  },
];

/**
 * Generate historical logs matching Vanessa's exact Google Sheet check-ins for August 2026:
 * - Sleep: 1..23, 25
 * - Exercise: 5, 10, 11, 13, 17, 18, 19, 20, 23, 24
 * - Meditate: 6, 16
 * - Reading: 17
 * - Journaling: []
 */
const generateStarterLogs = (habits: Habit[]): HabitLog[] => {
  const logs: HabitLog[] = [];
  const exerciseDays = [5, 10, 11, 13, 17, 18, 19, 20, 23, 24];
  const sleepDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25];
  const meditateDays = [6, 16];
  const readingDays = [17];

  habits.forEach((habit) => {
    let daysToMark: number[] = [];
    if (habit.name.toLowerCase() === 'exercise') daysToMark = exerciseDays;
    else if (habit.name.toLowerCase() === 'sleep') daysToMark = sleepDays;
    else if (habit.name.toLowerCase() === 'meditate') daysToMark = meditateDays;
    else if (habit.name.toLowerCase() === 'reading') daysToMark = readingDays;

    daysToMark.forEach((dayNum) => {
      const dayStr = String(dayNum).padStart(2, '0');
      const dateKey = `2026-08-${dayStr}`;
      logs.push({
        id: `log-${habit.id}-${dateKey}`,
        habitId: habit.id,
        date: dateKey,
        completed: true,
        value: habit.targetValue,
        timestamp: new Date(`${dateKey}T10:00:00.000Z`).toISOString(),
        syncedToSheets: true,
      });
    });
  });

  return logs;
};

export const getStoredHabits = (): Habit[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      const initial = DEFAULT_INITIAL_HABITS;
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_HABITS;
  }
};

export const saveStoredHabits = (habits: Habit[]): void => {
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const getStoredLogs = (): HabitLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      const initialLogs = generateStarterLogs(getStoredHabits());
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return generateStarterLogs(DEFAULT_INITIAL_HABITS);
  }
};

export const saveStoredLogs = (logs: HabitLog[]): void => {
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

export const getStoredSheetConfig = (): GoogleSheetConfig | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveStoredSheetConfig = (config: GoogleSheetConfig | null): void => {
  if (config) {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SHEET_CONFIG);
  }
};

export const getStoredSyncLogs = (): SyncLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const appendSyncLog = (entry: Omit<SyncLogEntry, 'id'>): void => {
  const current = getStoredSyncLogs();
  const newEntry: SyncLogEntry = {
    ...entry,
    id: `sync-log-${Date.now()}`,
  };
  const updated = [newEntry, ...current].slice(0, 50); // Keep latest 50
  localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(updated));
};

/**
 * Calculates current streak, best streak, total completions, and 30-day adherence rate
 */
export const calculateHabitStreak = (
  habit: Habit,
  logs: HabitLog[],
  selectedDateStr = getTodayKey()
): HabitStreakStats => {
  const habitLogs = logs.filter((l) => l.habitId === habit.id && l.completed);
  const completedDateSet = new Set(habitLogs.map((l) => l.date));

  const isCompletedToday = completedDateSet.has(selectedDateStr);
  const totalCompletions = habitLogs.length;

  // Calculate Current Streak
  let currentStreak = 0;
  const cursorDate = new Date();

  // If not completed today, check if yesterday was completed to keep active streak
  const todayStr = getTodayKey();
  let checkDate = new Date(cursorDate);

  if (!completedDateSet.has(todayStr)) {
    // Check yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(checkDate);
    if (completedDateSet.has(key)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate Longest Streak in history
  const sortedDates = Array.from(completedDateSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (prevDate) {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Calculate 30-day Completion Rate
  let completionsLast30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = formatDateKey(d);
    if (completedDateSet.has(k)) {
      completionsLast30++;
    }
  }
  const completionRateLast30Days = Math.round((completionsLast30 / 30) * 100);

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    completionRateLast30Days,
    isCompletedToday,
  };
};

/**
 * Calculates stats for all habits
 */
export const calculateAllHabitsStats = (
  habits: Habit[],
  logs: HabitLog[],
  dateStr = getTodayKey()
): Record<string, HabitStreakStats> => {
  const result: Record<string, HabitStreakStats> = {};
  habits.forEach((h) => {
    result[h.id] = calculateHabitStreak(h, logs, dateStr);
  });
  return result;
};
