"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import confetti from "canvas-confetti";
import { Habit, HabitLog, HabitStreakStats, GoogleSheetConfig, SyncLogEntry } from "./types";
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
  MIN_DATE_KEY,
} from "./storage";
import {
  createHabitSpreadsheet,
  syncAllDataToSpreadsheet,
  appendSingleLogToSheet,
  pullMatrixFromSpreadsheet,
  getSpreadsheetInfo,
  parseSpreadsheetId,
  type PulledCompletion,
} from "./googleSheets";
import { useSheetsAuth } from "./SheetsAuthContext";

// How often the dashboard quietly re-reads the linked spreadsheet while
// it's open, so a check-in typed directly into Sheets shows up here without
// a manual refresh — kept fairly infrequent since it's a full values.get
// over the whole matrix range every time.
const AUTO_PULL_INTERVAL_MS = 45_000;

// The matrix layout only knows about 2026 (see getDateColumnIndex) — pull
// reconciliation never has to consider dates the sheet itself can't hold.
const MATRIX_MAX_DATE_KEY = "2026-12-31";

interface HabitContextType {
  habits: Habit[];
  logs: HabitLog[];
  statsMap: Record<string, HabitStreakStats>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  sheetConfig: GoogleSheetConfig | null;
  syncLogs: SyncLogEntry[];
  isSyncing: boolean;
  toastMessage: { text: string; type: "success" | "info" | "error" } | null;
  showToast: (text: string, type?: "success" | "info" | "error") => void;
  toggleHabitCompletion: (habitId: string, date?: string, customValue?: number, notes?: string) => Promise<void>;
  addHabit: (habitData: Omit<Habit, "id" | "createdAt" | "archived">) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  syncWithGoogleSheets: () => Promise<{ success: boolean; message: string }>;
  createNewGoogleSheet: (customTitle?: string) => Promise<{ success: boolean; spreadsheetUrl?: string; message: string }>;
  linkExistingGoogleSheet: (inputUrlOrId: string) => Promise<{ success: boolean; message: string }>;
  unlinkGoogleSheet: () => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Folds a pull's completion set into the current logs: for every
// habit/date pair the matrix layout can represent, the sheet wins — a
// pulled mark becomes (or stays) a completed log, and its absence clears
// any local completion for that same pair. Logs outside that coverage
// (older/archived habits, dates the matrix doesn't reach) are left as-is,
// since the sheet has no opinion on them.
function reconcilePulledCompletions(
  existingLogs: HabitLog[],
  habits: Habit[],
  pulled: PulledCompletion[]
): HabitLog[] {
  const pulledSet = new Set(pulled.map((p) => `${p.habitId}_${p.date}`));
  const habitIds = new Set(habits.map((h) => h.id));
  const nowIso = new Date().toISOString();

  const inCoverage = (log: HabitLog) =>
    habitIds.has(log.habitId) && log.date >= MIN_DATE_KEY && log.date <= MATRIX_MAX_DATE_KEY;

  const seenPairs = new Set<string>();
  const next: HabitLog[] = [];

  for (const log of existingLogs) {
    if (!inCoverage(log)) {
      next.push(log);
      continue;
    }
    const pairKey = `${log.habitId}_${log.date}`;
    seenPairs.add(pairKey);
    const shouldBeCompleted = pulledSet.has(pairKey);
    if (log.completed === shouldBeCompleted) {
      next.push(log);
    } else {
      next.push({ ...log, completed: shouldBeCompleted, syncedToSheets: true, timestamp: nowIso });
    }
  }

  // Any pulled completion that had no matching local log yet.
  for (const pair of pulled) {
    const pairKey = `${pair.habitId}_${pair.date}`;
    if (seenPairs.has(pairKey)) continue;
    next.push({
      id: `log-${pair.habitId}-${pair.date}-sheet`,
      habitId: pair.habitId,
      date: pair.date,
      completed: true,
      timestamp: nowIso,
      syncedToSheets: true,
    });
  }

  return next;
}

export function HabitProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useSheetsAuth();
  const [habits, setHabits] = useState<Habit[]>(getStoredHabits);
  const [logs, setLogs] = useState<HabitLog[]>(getStoredLogs);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig | null>(getStoredSheetConfig);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(getStoredSyncLogs);
  const [selectedDate, setSelectedDateState] = useState<string>(getTodayKey);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // Read inside the background-pull effect below without making `habits`
  // one of its dependencies — that effect should only restart when the
  // linked sheet/token changes, not on every single check-in. Synced via
  // its own effect (not written directly during render) per the
  // react-hooks/refs rule.
  const habitsRef = useRef(habits);
  useEffect(() => {
    habitsRef.current = habits;
  }, [habits]);

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date < MIN_DATE_KEY ? MIN_DATE_KEY : date);
  }, []);

  const statsMap = useMemo(() => calculateAllHabitsStats(habits, logs, selectedDate), [habits, logs, selectedDate]);

  const showToast = useCallback((text: string, type: "success" | "info" | "error" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  useEffect(() => saveStoredHabits(habits), [habits]);
  useEffect(() => saveStoredLogs(logs), [logs]);
  useEffect(() => saveStoredSheetConfig(sheetConfig), [sheetConfig]);

  const fireCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#ffd60a", "#ffffff", "#ffb454"],
      });
    } catch {
      // Confetti is a nice-to-have — a canvas failure shouldn't block anything.
    }
  }, []);

  const logSyncEvent = useCallback((entry: Omit<SyncLogEntry, "id">) => {
    setSyncLogs(appendSyncLog(entry));
  }, []);

  // Pushes the full current state (all habits + logs) — used after
  // metadata changes (create/edit/delete a habit) and by the manual sync
  // button, where a single-cell update wouldn't be enough.
  const pushFullState = useCallback(
    async (currentHabits: Habit[], currentLogs: HabitLog[], config: GoogleSheetConfig, token: string) => {
      const stats = calculateAllHabitsStats(currentHabits, currentLogs);
      await syncAllDataToSpreadsheet(token, config.spreadsheetId, currentHabits, currentLogs, stats);
    },
    []
  );

  const toggleHabitCompletion = useCallback(
    async (habitId: string, targetDate = selectedDate, customValue?: number, notes?: string) => {
      const existingLogIndex = logs.findIndex((l) => l.habitId === habitId && l.date === targetDate);
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
      if (newCompletedState) fireCelebration();

      if (sheetConfig?.autoSync && accessToken) {
        try {
          await appendSingleLogToSheet(accessToken, sheetConfig.spreadsheetId, habits, habit, targetLog);
          setLogs((prev) => prev.map((l) => (l.id === targetLog.id ? { ...l, syncedToSheets: true } : l)));
          logSyncEvent({
            timestamp: new Date().toISOString(),
            type: "auto_sync",
            status: "success",
            recordsCount: 1,
            message: `Auto-synced "${habit.name}" log for ${targetDate} to Google Sheets.`,
          });
        } catch (error) {
          logSyncEvent({
            timestamp: new Date().toISOString(),
            type: "auto_sync",
            status: "error",
            recordsCount: 1,
            message: `Auto-sync failed for "${habit.name}": ${(error as Error).message}`,
          });
        }
      }
    },
    [habits, logs, selectedDate, sheetConfig, accessToken, fireCelebration, logSyncEvent]
  );

  const addHabit = useCallback(
    async (habitData: Omit<Habit, "id" | "createdAt" | "archived">) => {
      const newHabit: Habit = { ...habitData, id: `habit-${Date.now()}`, createdAt: new Date().toISOString(), archived: false };
      const nextHabits = [...habits, newHabit];
      setHabits(nextHabits);
      showToast(`Hábito "${newHabit.name}" creado`, "success");

      if (sheetConfig?.autoSync && accessToken) {
        try {
          await pushFullState(nextHabits, logs, sheetConfig, accessToken);
        } catch (error) {
          console.warn("Push after addHabit failed:", error);
        }
      }
    },
    [habits, logs, sheetConfig, accessToken, showToast, pushFullState]
  );

  const updateHabit = useCallback(
    async (updated: Habit) => {
      const nextHabits = habits.map((h) => (h.id === updated.id ? updated : h));
      setHabits(nextHabits);
      showToast(`"${updated.name}" actualizado`, "success");

      if (sheetConfig?.autoSync && accessToken) {
        try {
          await pushFullState(nextHabits, logs, sheetConfig, accessToken);
        } catch (error) {
          console.warn("Push after updateHabit failed:", error);
        }
      }
    },
    [habits, logs, sheetConfig, accessToken, showToast, pushFullState]
  );

  const deleteHabit = useCallback(
    async (habitId: string) => {
      const habitToDelete = habits.find((h) => h.id === habitId);
      const nextHabits = habits.filter((h) => h.id !== habitId);
      const nextLogs = logs.filter((l) => l.habitId !== habitId);
      setHabits(nextHabits);
      setLogs(nextLogs);
      showToast(`Hábito "${habitToDelete?.name ?? ""}" eliminado`, "info");

      if (sheetConfig?.autoSync && accessToken) {
        try {
          await pushFullState(nextHabits, nextLogs, sheetConfig, accessToken);
        } catch (error) {
          console.warn("Push after deleteHabit failed:", error);
        }
      }
    },
    [habits, logs, sheetConfig, accessToken, showToast, pushFullState]
  );

  const unlinkGoogleSheet = useCallback(() => {
    setSheetConfig(null);
    logSyncEvent({
      timestamp: new Date().toISOString(),
      type: "export",
      status: "success",
      recordsCount: 0,
      message: "Unlinked Google Spreadsheet from tracker.",
    });
    showToast("Hoja de Google desconectada", "info");
  }, [showToast, logSyncEvent]);

  // Manual "Sincronizar" action: push everything first (so the sheet
  // reflects any change still pending), then pull it right back — picking
  // up anything edited directly in Sheets since the last sync.
  const syncWithGoogleSheets = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!sheetConfig) {
      return { success: false, message: "No hay ninguna hoja de Google conectada todavía." };
    }
    if (!accessToken) {
      return { success: false, message: "Conecta tu cuenta de Google para sincronizar." };
    }

    setIsSyncing(true);
    try {
      await pushFullState(habits, logs, sheetConfig, accessToken);
      const pulled = await pullMatrixFromSpreadsheet(accessToken, sheetConfig.spreadsheetId, habits);
      const mergedLogs = reconcilePulledCompletions(logs, habits, pulled);
      setLogs(mergedLogs);

      const nowStr = new Date().toISOString();
      setSheetConfig({ ...sheetConfig, lastSyncedAt: nowStr });
      logSyncEvent({
        timestamp: nowStr,
        type: "export",
        status: "success",
        recordsCount: habits.length + mergedLogs.length,
        message: `Sincronización completa: ${habits.length} hábitos, ${mergedLogs.length} registros.`,
      });
      showToast("¡Google Sheets sincronizado!", "success");
      return { success: true, message: "Sincronizado correctamente." };
    } catch (error) {
      const errMsg = (error as Error).message || "No se pudo sincronizar con Google Sheets";
      logSyncEvent({ timestamp: new Date().toISOString(), type: "export", status: "error", recordsCount: 0, message: errMsg });
      showToast(`Error al sincronizar: ${errMsg}`, "error");
      return { success: false, message: errMsg };
    } finally {
      setIsSyncing(false);
    }
  }, [sheetConfig, accessToken, habits, logs, pushFullState, logSyncEvent, showToast]);

  const createNewGoogleSheet = useCallback(
    async (customTitle?: string): Promise<{ success: boolean; spreadsheetUrl?: string; message: string }> => {
      if (!accessToken) {
        return { success: false, message: "Necesitas conectar tu cuenta de Google primero." };
      }
      setIsSyncing(true);
      try {
        const title = customTitle || "Vanessa's Habit Tracker";
        const result = await createHabitSpreadsheet(accessToken, title);
        const newConfig: GoogleSheetConfig = {
          spreadsheetId: result.spreadsheetId,
          spreadsheetName: result.title,
          spreadsheetUrl: result.spreadsheetUrl,
          overviewSheetTitle: "Habits_Overview",
          dailyLogsSheetTitle: "Daily_Logs",
          autoSync: true,
          lastSyncedAt: new Date().toISOString(),
        };
        setSheetConfig(newConfig);
        await pushFullState(habits, logs, newConfig, accessToken);
        logSyncEvent({
          timestamp: new Date().toISOString(),
          type: "create_sheet",
          status: "success",
          recordsCount: habits.length + logs.length,
          message: `Created new spreadsheet "${title}" and synced all habit data.`,
          details: result.spreadsheetUrl,
        });
        showToast(`Hoja "${title}" creada en Drive`, "success");
        return { success: true, spreadsheetUrl: result.spreadsheetUrl, message: "Spreadsheet created and synced." };
      } catch (error) {
        const errMsg = (error as Error).message || "No se pudo crear la hoja";
        logSyncEvent({ timestamp: new Date().toISOString(), type: "create_sheet", status: "error", recordsCount: 0, message: errMsg });
        showToast(`Error al crear la hoja: ${errMsg}`, "error");
        return { success: false, message: errMsg };
      } finally {
        setIsSyncing(false);
      }
    },
    [accessToken, habits, logs, pushFullState, logSyncEvent, showToast]
  );

  const linkExistingGoogleSheet = useCallback(
    async (inputUrlOrId: string): Promise<{ success: boolean; message: string }> => {
      if (!accessToken) {
        return { success: false, message: "Conecta tu cuenta de Google primero." };
      }
      const parsedId = parseSpreadsheetId(inputUrlOrId);
      if (!parsedId) {
        return { success: false, message: "Link o ID de Google Sheets inválido." };
      }

      setIsSyncing(true);
      try {
        const info = await getSpreadsheetInfo(accessToken, parsedId);
        const newConfig: GoogleSheetConfig = {
          spreadsheetId: info.id,
          spreadsheetName: info.title,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${info.id}/edit`,
          overviewSheetTitle: info.sheets[0]?.title ?? "Sheet1",
          dailyLogsSheetTitle: info.sheets[1]?.title ?? "Daily_Logs",
          autoSync: true,
          lastSyncedAt: new Date().toISOString(),
        };
        setSheetConfig(newConfig);

        // Pull first here (not push) — an existing sheet likely already
        // holds real history Vanessa wants reflected locally, and pushing
        // blindly first would overwrite it with whatever the app had
        // before this sheet was even linked.
        const pulled = await pullMatrixFromSpreadsheet(accessToken, info.id, habits);
        const mergedLogs = reconcilePulledCompletions(logs, habits, pulled);
        setLogs(mergedLogs);
        await pushFullState(habits, mergedLogs, newConfig, accessToken);

        logSyncEvent({
          timestamp: new Date().toISOString(),
          type: "import",
          status: "success",
          recordsCount: habits.length + mergedLogs.length,
          message: `Connected existing spreadsheet "${info.title}" and merged its data.`,
        });
        showToast(`Conectado a "${info.title}"`, "success");
        return { success: true, message: `Connected to "${info.title}"` };
      } catch (error) {
        const errMsg = (error as Error).message || "No se pudo conectar la hoja";
        showToast(`Error de conexión: ${errMsg}`, "error");
        return { success: false, message: errMsg };
      } finally {
        setIsSyncing(false);
      }
    },
    [accessToken, habits, logs, pushFullState, logSyncEvent, showToast]
  );

  // Quiet background pull — on connect, every AUTO_PULL_INTERVAL_MS while
  // a sheet is linked, and whenever the tab regains focus (the moment a
  // change made directly in Sheets is most likely to exist).
  useEffect(() => {
    if (!sheetConfig || !accessToken) return;

    let cancelled = false;
    const pullOnce = async () => {
      try {
        const pulled = await pullMatrixFromSpreadsheet(accessToken, sheetConfig.spreadsheetId, habitsRef.current);
        if (cancelled) return;
        setLogs((prev) => reconcilePulledCompletions(prev, habitsRef.current, pulled));
      } catch (error) {
        console.warn("Background pull failed:", error);
      }
    };

    pullOnce();
    const intervalId = setInterval(pullOnce, AUTO_PULL_INTERVAL_MS);
    const handleFocus = () => pullOnce();
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [sheetConfig, accessToken]);

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
      syncWithGoogleSheets,
      createNewGoogleSheet,
      linkExistingGoogleSheet,
      unlinkGoogleSheet,
    ]
  );

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabits(): HabitContextType {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitProvider");
  }
  return context;
}
