import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Habit, HabitLog, HabitStreakStats, GoogleSheetConfig, SyncLogEntry } from '../types/habit';
import {
  getStoredHabits,
  saveStoredHabits,
  getStoredLogs,
  saveStoredLogs,
  getStoredSheetConfig,
  saveStoredSheetConfig,
  getStoredSyncLogs,
  appendSyncLog,
  getTodayKey,
  calculateAllHabitsStats,
  formatDateKey,
  MIN_DATE_KEY,
} from '../services/habitStorageService';
import {
  createHabitSpreadsheet,
  syncAllDataToSpreadsheet,
  appendSingleLogToSheet,
  getSpreadsheetInfo,
  parseSpreadsheetId,
} from '../services/googleSheetsService';
import { useAuth } from './AuthContext';

interface HabitContextType {
  habits: Habit[];
  logs: HabitLog[];
  statsMap: Record<string, HabitStreakStats>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  sheetConfig: GoogleSheetConfig | null;
  syncLogs: SyncLogEntry[];
  isSyncing: boolean;
  toastMessage: { text: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  toggleHabitCompletion: (habitId: string, date?: string, customValue?: number, notes?: string) => Promise<void>;
  addHabit: (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  setSheetConfigState: (config: GoogleSheetConfig | null) => void;
  syncWithGoogleSheets: (force?: boolean) => Promise<{ success: boolean; message: string }>;
  createNewGoogleSheet: (customTitle?: string) => Promise<{ success: boolean; spreadsheetUrl?: string; message: string }>;
  linkExistingGoogleSheet: (inputUrlOrId: string) => Promise<{ success: boolean; message: string }>;
  unlinkGoogleSheet: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accessToken } = useAuth();
  const [habits, setHabits] = useState<Habit[]>(getStoredHabits);
  const [logs, setLogs] = useState<HabitLog[]>(getStoredLogs);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(getStoredSheetConfig);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(getStoredSyncLogs);
  const [selectedDateState, setSelectedDateState] = useState<string>(getTodayKey);

  const setSelectedDate = useCallback((date: string) => {
    const clamped = date < MIN_DATE_KEY ? MIN_DATE_KEY : date;
    setSelectedDateState(clamped);
  }, []);

  const selectedDate = selectedDateState;
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Compute stats dynamically whenever habits, logs, or selectedDate changes
  const statsMap = useMemo(() => {
    return calculateAllHabitsStats(habits, logs, selectedDate);
  }, [habits, logs, selectedDate]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Save changes to local storage whenever habits or logs update
  useEffect(() => {
    saveStoredHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveStoredLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveStoredSheetConfig(sheetConfig);
  }, [sheetConfig]);

  const fireCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
      });
    } catch {
      // Confetti fallback safely ignored
    }
  }, []);

  // Toggle habit completion on a given date
  const toggleHabitCompletion = useCallback(
    async (habitId: string, targetDate = selectedDate, customValue?: number, notes?: string) => {
      const existingLogIndex = logs.findIndex(
        (l) => l.habitId === habitId && l.date === targetDate
      );

      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      let newCompletedState = true;
      let updatedLogs: HabitLog[];
      let targetLog: HabitLog;

      if (existingLogIndex >= 0) {
        const existing = logs[existingLogIndex];
        newCompletedState = !existing.completed;
        targetLog = {
          ...existing,
          completed: newCompletedState,
          value: customValue !== undefined ? customValue : existing.value,
          notes: notes !== undefined ? notes : existing.notes,
          timestamp: new Date().toISOString(),
          syncedToSheets: false,
        };
        updatedLogs = [...logs];
        updatedLogs[existingLogIndex] = targetLog;
      } else {
        newCompletedState = true;
        targetLog = {
          id: `log-${habitId}-${targetDate}-${Date.now()}`,
          habitId,
          date: targetDate,
          completed: true,
          value: customValue !== undefined ? customValue : habit.targetValue,
          notes,
          timestamp: new Date().toISOString(),
          syncedToSheets: false,
        };
        updatedLogs = [targetLog, ...logs];
      }

      setLogs(updatedLogs);

      if (newCompletedState) {
        fireCelebration();
      }

      // Auto-sync to Google Sheets in background if configured and token available
      if (sheetConfig && sheetConfig.autoSync && accessToken) {
        try {
          await appendSingleLogToSheet(accessToken, sheetConfig.spreadsheetId, habit, targetLog);
          // Mark as synced
          setLogs((prev) =>
            prev.map((l) => (l.id === targetLog.id ? { ...l, syncedToSheets: true } : l))
          );
          appendSyncLog({
            timestamp: new Date().toISOString(),
            type: 'auto_sync',
            status: 'success',
            recordsCount: 1,
            message: `Auto-synced "${habit.name}" log for ${targetDate} to Google Sheets.`,
          });
          setSyncLogs(getStoredSyncLogs());
        } catch (error) {
          console.warn('Auto-sync single log error:', error);
          appendSyncLog({
            timestamp: new Date().toISOString(),
            type: 'auto_sync',
            status: 'error',
            recordsCount: 1,
            message: `Auto-sync failed for "${habit.name}": ${(error as Error).message}`,
          });
          setSyncLogs(getStoredSyncLogs());
        }
      }
    },
    [habits, logs, selectedDate, sheetConfig, accessToken, fireCelebration, showToast]
  );

  const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setHabits((prev) => [...prev, newHabit]);
    showToast(`Created habit "${newHabit.name}"`, 'success');
  }, [showToast]);

  const updateHabit = useCallback(async (updated: Habit) => {
    setHabits((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
    showToast(`Updated "${updated.name}"`, 'success');
  }, [showToast]);

  const deleteHabit = useCallback(async (habitId: string) => {
    const habitToDelete = habits.find((h) => h.id === habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
    showToast(`Deleted habit "${habitToDelete?.name || ''}"`, 'info');
  }, [habits, showToast]);

  const setSheetConfigState = useCallback((config: GoogleSheetConfig | null) => {
    setSheetConfig(config);
  }, []);

  const unlinkGoogleSheet = useCallback(() => {
    setSheetConfig(null);
    appendSyncLog({
      timestamp: new Date().toISOString(),
      type: 'export',
      status: 'info' as unknown as 'success',
      recordsCount: 0,
      message: 'Unlinked Google Spreadsheet from tracker.',
    });
    setSyncLogs(getStoredSyncLogs());
    showToast('Unlinked Google Spreadsheet', 'info');
  }, [showToast]);

  // Full manual synchronization with Google Sheets
  const syncWithGoogleSheets = useCallback(async (force = false): Promise<{ success: boolean; message: string }> => {
    if (!sheetConfig) {
      return { success: false, message: 'No Google Sheet currently connected. Create or connect one below!' };
    }
    if (!accessToken) {
      return { success: false, message: 'Please sign in with Google to sync with your spreadsheet.' };
    }

    setIsSyncing(true);
    try {
      const result = await syncAllDataToSpreadsheet(
        accessToken,
        sheetConfig.spreadsheetId,
        habits,
        logs,
        statsMap
      );

      const nowStr = new Date().toISOString();
      const updatedConfig: GoogleSheetConfig = {
        ...sheetConfig,
        lastSyncedAt: nowStr,
      };
      setSheetConfig(updatedConfig);

      appendSyncLog({
        timestamp: nowStr,
        type: 'export',
        status: 'success',
        recordsCount: result.rowsUpdated,
        message: `Successfully synchronized ${habits.length} habits and ${logs.length} historical logs to Google Sheets.`,
      });
      setSyncLogs(getStoredSyncLogs());

      showToast(`Google Sheets successfully updated! (${result.rowsUpdated} rows)`, 'success');
      return { success: true, message: `Synced ${result.rowsUpdated} rows to "${sheetConfig.spreadsheetName}"` };
    } catch (error) {
      const errMsg = (error as Error).message || 'Failed to sync with Google Sheets';
      appendSyncLog({
        timestamp: new Date().toISOString(),
        type: 'export',
        status: 'error',
        recordsCount: 0,
        message: errMsg,
      });
      setSyncLogs(getStoredSyncLogs());
      showToast(`Sync error: ${errMsg}`, 'error');
      return { success: false, message: errMsg };
    } finally {
      setIsSyncing(false);
    }
  }, [sheetConfig, accessToken, habits, logs, statsMap, showToast]);

  // Create a brand new Google Sheet in Drive with customized headers
  const createNewGoogleSheet = useCallback(
    async (customTitle?: string): Promise<{ success: boolean; spreadsheetUrl?: string; message: string }> => {
      if (!accessToken) {
        return { success: false, message: 'Google Authentication required to create spreadsheets.' };
      }

      setIsSyncing(true);
      try {
        const title = customTitle || "Vanessa's Habit Tracker";
        const result = await createHabitSpreadsheet(accessToken, title);

        const newConfig: GoogleSheetConfig = {
          spreadsheetId: result.spreadsheetId,
          spreadsheetName: result.title,
          spreadsheetUrl: result.spreadsheetUrl,
          overviewSheetTitle: 'Habits_Overview',
          dailyLogsSheetTitle: 'Daily_Logs',
          autoSync: true,
          lastSyncedAt: new Date().toISOString(),
        };

        setSheetConfig(newConfig);

        // Perform initial synchronization of existing habits and logs
        await syncAllDataToSpreadsheet(accessToken, result.spreadsheetId, habits, logs, statsMap);

        appendSyncLog({
          timestamp: new Date().toISOString(),
          type: 'create_sheet',
          status: 'success',
          recordsCount: habits.length + logs.length,
          message: `Created new spreadsheet "${title}" and synced all habit data!`,
          details: result.spreadsheetUrl,
        });
        setSyncLogs(getStoredSyncLogs());

        showToast(`Created spreadsheet "${title}" in Google Drive! 📊`, 'success');
        return {
          success: true,
          spreadsheetUrl: result.spreadsheetUrl,
          message: `Spreadsheet created and synced successfully.`,
        };
      } catch (error) {
        const errMsg = (error as Error).message || 'Could not create spreadsheet';
        appendSyncLog({
          timestamp: new Date().toISOString(),
          type: 'create_sheet',
          status: 'error',
          recordsCount: 0,
          message: errMsg,
        });
        setSyncLogs(getStoredSyncLogs());
        showToast(`Creation failed: ${errMsg}`, 'error');
        return { success: false, message: errMsg };
      } finally {
        setIsSyncing(false);
      }
    },
    [accessToken, habits, logs, statsMap, showToast]
  );

  // Link an existing Google Sheet by ID or URL
  const linkExistingGoogleSheet = useCallback(
    async (inputUrlOrId: string): Promise<{ success: boolean; message: string }> => {
      if (!accessToken) {
        return { success: false, message: 'Please sign in with Google first.' };
      }

      const parsedId = parseSpreadsheetId(inputUrlOrId);
      if (!parsedId) {
        return { success: false, message: 'Invalid Google Spreadsheet ID or URL.' };
      }

      setIsSyncing(true);
      try {
        const info = await getSpreadsheetInfo(accessToken, parsedId);

        const newConfig: GoogleSheetConfig = {
          spreadsheetId: info.id,
          spreadsheetName: info.title,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${info.id}/edit`,
          overviewSheetTitle: info.sheets[0]?.title || 'Sheet1',
          dailyLogsSheetTitle: info.sheets[1]?.title || 'Daily_Logs',
          autoSync: true,
          lastSyncedAt: new Date().toISOString(),
        };

        setSheetConfig(newConfig);

        // Sync local data into this spreadsheet
        await syncAllDataToSpreadsheet(accessToken, info.id, habits, logs, statsMap);

        appendSyncLog({
          timestamp: new Date().toISOString(),
          type: 'export',
          status: 'success',
          recordsCount: habits.length + logs.length,
          message: `Connected existing spreadsheet "${info.title}" and pushed initial habits.`,
        });
        setSyncLogs(getStoredSyncLogs());

        showToast(`Connected to "${info.title}"!`, 'success');
        return { success: true, message: `Connected to "${info.title}"` };
      } catch (error) {
        const errMsg = (error as Error).message || 'Failed to connect spreadsheet';
        showToast(`Connection error: ${errMsg}`, 'error');
        return { success: false, message: errMsg };
      } finally {
        setIsSyncing(false);
      }
    },
    [accessToken, habits, logs, statsMap, showToast]
  );

  const value = useMemo(
    () => ({
      habits,
      logs,
      statsMap,
      selectedDate,
      setSelectedDate,
      sheetConfig,
      syncLogs,
      isSyncing,
      toastMessage,
      showToast,
      toggleHabitCompletion,
      addHabit,
      updateHabit,
      deleteHabit,
      setSheetConfigState,
      syncWithGoogleSheets,
      createNewGoogleSheet,
      linkExistingGoogleSheet,
      unlinkGoogleSheet,
    }),
    [
      habits,
      logs,
      statsMap,
      selectedDate,
      sheetConfig,
      syncLogs,
      isSyncing,
      toastMessage,
      showToast,
      toggleHabitCompletion,
      addHabit,
      updateHabit,
      deleteHabit,
      setSheetConfigState,
      syncWithGoogleSheets,
      createNewGoogleSheet,
      linkExistingGoogleSheet,
      unlinkGoogleSheet,
    ]
  );

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
};

export const useHabits = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
