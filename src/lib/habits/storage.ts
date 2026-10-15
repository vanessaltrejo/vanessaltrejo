import {
  GoogleSheetConfig,
  Habit,
  HabitLog,
  HabitStreakStats,
  SyncLogEntry,
} from "./types";

// Client-side cache, not the source of truth once a Google Sheet is linked
// (see HabitsContext) — this only keeps the dashboard usable offline and
// gives it something to show before the first pull from Sheets resolves.
const STORAGE_KEYS = {
  HABITS: "vt_habits_v1",
  LOGS: "vt_habits_logs_v1",
  SHEET_CONFIG: "vt_habits_sheet_config_v1",
  SYNC_LOGS: "vt_habits_sync_logs_v1",
};

export const MIN_DATE_KEY = "2026-08-01";

export const formatDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayKey = (): string => {
  const today = formatDateKey(new Date());
  return today < MIN_DATE_KEY ? MIN_DATE_KEY : today;
};

// Seed habits shown before a real Google Sheet is linked — matches
// Vanessa's 5 actual tracked goals so the dashboard isn't empty on first
// load, per the dummy-data rule in CLAUDE.md (real data takes over the
// moment a sheet is connected).
const DEFAULT_INITIAL_HABITS: Habit[] = [
  {
    id: "habit-journaling",
    name: "Journaling",
    description: "Daily journaling and reflection",
    category: "mindfulness",
    color: "#8B5CF6",
    iconName: "PenLine",
    frequency: { type: "daily" },
    targetValue: 10,
    targetUnit: "min",
    createdAt: "2026-08-01T00:00:00.000Z",
    archived: false,
    sheetColumnName: "Journaling",
  },
  {
    id: "habit-exercise",
    name: "Exercise",
    description: "Daily physical movement and workout",
    category: "fitness",
    color: "#10B981",
    iconName: "Dumbbell",
    frequency: { type: "daily" },
    targetValue: 30,
    targetUnit: "min",
    createdAt: "2026-08-01T00:00:00.000Z",
    archived: false,
    sheetColumnName: "Exercise",
  },
  {
    id: "habit-sleep",
    name: "Sleep",
    description: "Restorative deep sleep",
    category: "health",
    color: "#3B82F6",
    iconName: "Moon",
    frequency: { type: "daily" },
    targetValue: 6,
    targetUnit: "hours",
    createdAt: "2026-08-01T00:00:00.000Z",
    archived: false,
    sheetColumnName: "Sleep",
  },
  {
    id: "habit-meditate",
    name: "Meditate",
    description: "Mindful meditation and breathwork",
    category: "mindfulness",
    color: "#F59E0B",
    iconName: "Sparkles",
    frequency: { type: "daily" },
    targetValue: 10,
    targetUnit: "min",
    createdAt: "2026-08-01T00:00:00.000Z",
    archived: false,
    sheetColumnName: "Meditate",
  },
  {
    id: "habit-reading",
    name: "Reading",
    description: "Daily book reading",
    category: "learning",
    color: "#EC4899",
    iconName: "BookOpen",
    frequency: { type: "daily" },
    targetValue: 2,
    targetUnit: "pages",
    createdAt: "2026-08-01T00:00:00.000Z",
    archived: false,
    sheetColumnName: "Reading",
  },
];

const isBrowser = () => typeof window !== "undefined";

export const getStoredHabits = (): Habit[] => {
  if (!isBrowser()) return DEFAULT_INITIAL_HABITS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(DEFAULT_INITIAL_HABITS));
      return DEFAULT_INITIAL_HABITS;
    }
    return JSON.parse(raw) as Habit[];
  } catch {
    return DEFAULT_INITIAL_HABITS;
  }
};

export const saveStoredHabits = (habits: Habit[]): void => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const getStoredLogs = (): HabitLog[] => {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? (JSON.parse(raw) as HabitLog[]) : [];
  } catch {
    return [];
  }
};

export const saveStoredLogs = (logs: HabitLog[]): void => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

export const getStoredSheetConfig = (): GoogleSheetConfig | null => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    return raw ? (JSON.parse(raw) as GoogleSheetConfig) : null;
  } catch {
    return null;
  }
};

export const saveStoredSheetConfig = (config: GoogleSheetConfig | null): void => {
  if (!isBrowser()) return;
  if (config) {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
  } else {
    localStorage.removeItem(STORAGE_KEYS.SHEET_CONFIG);
  }
};

export const getStoredSyncLogs = (): SyncLogEntry[] => {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    return raw ? (JSON.parse(raw) as SyncLogEntry[]) : [];
  } catch {
    return [];
  }
};

export const appendSyncLog = (entry: Omit<SyncLogEntry, "id">): SyncLogEntry[] => {
  const current = getStoredSyncLogs();
  const newEntry: SyncLogEntry = { ...entry, id: `sync-log-${Date.now()}` };
  const updated = [newEntry, ...current].slice(0, 50);
  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(updated));
  }
  return updated;
};

/**
 * Current streak, best streak, total completions, and 30-day adherence for
 * one habit, computed from its logs.
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

  let currentStreak = 0;
  const todayStr = getTodayKey();
  const checkDate = new Date();
  if (!completedDateSet.has(todayStr)) {
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

  const sortedDates = Array.from(completedDateSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;
  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split("-").map(Number);
    const currentDate = new Date(y, m - 1, d);
    if (prevDate) {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / 86400000);
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak;
    prevDate = currentDate;
  }
  if (currentStreak > longestStreak) longestStreak = currentStreak;

  let completionsLast30 = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (completedDateSet.has(formatDateKey(d))) completionsLast30++;
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
