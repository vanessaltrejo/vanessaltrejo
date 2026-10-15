export type HabitCategory =
  | 'health'
  | 'productivity'
  | 'learning'
  | 'mindfulness'
  | 'fitness'
  | 'finance'
  | 'creativity'
  | 'personal';

export type HabitFrequencyType = 'daily' | 'weekdays' | 'weekends' | 'weekly_target';

export interface HabitFrequency {
  type: HabitFrequencyType;
  targetDaysPerWeek?: number;
  customDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  color: string;
  iconName: string;
  frequency: HabitFrequency;
  targetValue?: number;
  targetUnit?: string;
  createdAt: string; // ISO string
  archived: boolean;
  sheetColumnName?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: number;
  notes?: string;
  timestamp: string; // ISO string
  syncedToSheets?: boolean;
}

export interface HabitStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRateLast30Days: number;
  isCompletedToday: boolean;
}

export interface GoogleSheetConfig {
  spreadsheetId: string;
  spreadsheetName: string;
  spreadsheetUrl: string;
  overviewSheetTitle: string;
  dailyLogsSheetTitle: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  type: 'export' | 'import' | 'auto_sync' | 'create_sheet';
  status: 'success' | 'error' | 'pending';
  recordsCount: number;
  message: string;
  details?: string;
}

export type ActiveTab = 'habits' | 'analytics';
