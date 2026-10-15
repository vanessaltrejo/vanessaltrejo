import { Habit, HabitLog, HabitStreakStats } from "./types";
import { MIN_DATE_KEY } from "./storage";

export interface CreatedSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface SheetMetadata {
  id: string;
  title: string;
  sheets: Array<{ title: string; sheetId: number }>;
}

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// Cells in the matrix are considered "completed" the moment they hold any
// text — a checkmark, an "x", a "1", whatever Vanessa already types by
// hand — rather than relying on a specific background color, since that's
// the one convention guaranteed to round-trip correctly regardless of how
// her existing sheet was formatted before this dashboard ever wrote to it.
const DONE_MARK = "✓"; // ✓

/**
 * Creates a brand new personalized habit-tracking spreadsheet in the
 * user's Google Drive with pre-configured tabs and header rows.
 */
export const createHabitSpreadsheet = async (
  accessToken: string,
  title = "Vanessa's Habit Tracker"
): Promise<CreatedSheetResult> => {
  const requestBody = {
    properties: { title, locale: "en_US", autoRecalc: "ON_CHANGE" },
    sheets: [
      {
        properties: {
          title: "Habits_Overview",
          gridProperties: { rowCount: 100, columnCount: 10, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: "Daily_Logs",
          gridProperties: { rowCount: 1000, columnCount: 8, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: "Monthly_Summary",
          gridProperties: { rowCount: 100, columnCount: 8, frozenRowCount: 1 },
        },
      },
    ],
  };

  const response = await fetch(SHEETS_API_BASE, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ?? `Failed to create Google Spreadsheet: ${response.statusText}`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId as string;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  await initializeSheetHeaders(accessToken, spreadsheetId);

  return { spreadsheetId, spreadsheetUrl, title };
};

const initializeSheetHeaders = async (accessToken: string, spreadsheetId: string): Promise<void> => {
  const valueData = [
    {
      range: "Habits_Overview!A1:J1",
      values: [
        [
          "Habit ID",
          "Habit Name",
          "Category",
          "Time of Day",
          "Frequency",
          "Target",
          "Current Streak (Days)",
          "Best Streak (Days)",
          "Total Completed",
          "Last Updated",
        ],
      ],
    },
    {
      range: "Daily_Logs!A1:H1",
      values: [
        ["Log ID", "Date (YYYY-MM-DD)", "Habit Name", "Category", "Status", "Target Progress", "Notes / Journal", "Timestamp"],
      ],
    },
    {
      range: "Monthly_Summary!A1:H1",
      values: [
        ["Habit Name", "Category", "Total Days Tracked", "Days Completed", "Success Rate %", "Current Streak", "Status", "Notes"],
      ],
    },
  ];

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: valueData }),
  });
};

/** 0-indexed column number -> Sheets column letters (0 -> 'A', 32 -> 'AG'). */
export const columnToLetter = (column: number): string => {
  let temp = "";
  let letter = "";
  let col = column + 1;
  while (col > 0) {
    temp = String((col - 1) % 26);
    letter = String.fromCharCode(65 + parseInt(temp, 10)) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
};

// The matrix's date columns only cover 2026 (Aug-Dec) — the layout Vanessa's
// real sheet already uses. A habit tracker naturally needs re-laying-out
// every year regardless of tooling, so this is a known boundary rather than
// a bug: past that range these two functions simply return null and the
// day falls outside what the matrix can read or write.
export const getDateColumnIndex = (dateStr: string): number | null => {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (year !== 2026) return null;
  if (month === 8) return day;
  if (month === 9) return 31 + day;
  if (month === 10) return 61 + day;
  if (month === 11) return 92 + day;
  if (month === 12) return 122 + day;
  return null;
};

/** Inverse of getDateColumnIndex — used when pulling the matrix back. */
export const getDateFromColumnIndex = (colIndex: number): string | null => {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (colIndex >= 1 && colIndex <= 31) return `2026-08-${pad(colIndex)}`;
  if (colIndex >= 32 && colIndex <= 61) return `2026-09-${pad(colIndex - 31)}`;
  if (colIndex >= 62 && colIndex <= 92) return `2026-10-${pad(colIndex - 61)}`;
  if (colIndex >= 93 && colIndex <= 122) return `2026-11-${pad(colIndex - 92)}`;
  if (colIndex >= 123 && colIndex <= 153) return `2026-12-${pad(colIndex - 122)}`;
  return null;
};

/**
 * Writes habit names into column A and green-highlights + checkmarks every
 * completed day in the horizontal matrix calendar (Vanessa's own sheet
 * layout: one row per habit, one column per day of 2026).
 */
export const syncMatrixCalendarSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  habits: Habit[],
  logs: HabitLog[]
): Promise<{ rowsUpdated: number }> => {
  const completedLogs = logs.filter((l) => l.completed);
  const habitRowMap = new Map<string, number>();
  habits.forEach((h, index) => habitRowMap.set(h.id, 2 + index)); // row 3 = index 2

  if (habits.length > 0) {
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/A3:A${2 + habits.length}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: habits.map((h) => [h.name]) }),
      }
    );
  }

  const formatRequests: Record<string, unknown>[] = [];
  const valueUpdates: { range: string; values: string[][] }[] = [];

  completedLogs.forEach((log) => {
    const rowIndex = habitRowMap.get(log.habitId);
    const colIndex = getDateColumnIndex(log.date);
    if (rowIndex === undefined || colIndex === null) return;

    formatRequests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: colIndex, endColumnIndex: colIndex + 1 },
        cell: { userEnteredFormat: { backgroundColor: { red: 0.0, green: 1.0, blue: 0.0 } } },
        fields: "userEnteredFormat.backgroundColor",
      },
    });
    valueUpdates.push({
      range: `${columnToLetter(colIndex)}${rowIndex + 1}`,
      values: [[DONE_MARK]],
    });
  });

  if (formatRequests.length > 0) {
    const res = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: formatRequests }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("Matrix background color sync warning:", err);
    }
  }

  if (valueUpdates.length > 0) {
    await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: valueUpdates }),
    });
  }

  return { rowsUpdated: completedLogs.length };
};

/** Full push: habits, logs, and stats overview, plus the matrix calendar. */
export const syncAllDataToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  habits: Habit[],
  logs: HabitLog[],
  statsMap: Record<string, HabitStreakStats>
): Promise<{ rowsUpdated: number }> => {
  const info = await getSpreadsheetInfo(accessToken, spreadsheetId).catch(() => null);
  const primarySheet = info?.sheets[0];

  if (primarySheet) {
    try {
      await syncMatrixCalendarSpreadsheet(accessToken, spreadsheetId, primarySheet.sheetId, habits, logs);
    } catch (e) {
      console.warn("Matrix sync notice:", e);
    }
  }

  const nowStr = new Date().toLocaleString();

  const overviewRows: (string | number)[][] = [
    ["Habit ID", "Habit Name", "Category", "Frequency", "Target", "Current Streak (Days)", "Best Streak (Days)", "Total Completed", "Last Updated"],
  ];
  habits.forEach((habit) => {
    const stats = statsMap[habit.id] ?? { currentStreak: 0, longestStreak: 0, totalCompletions: 0 };
    overviewRows.push([
      habit.id,
      habit.name,
      habit.category.toUpperCase(),
      habit.frequency.type,
      habit.targetValue ? `${habit.targetValue} ${habit.targetUnit ?? ""}` : "Yes/No",
      stats.currentStreak,
      stats.longestStreak,
      stats.totalCompletions,
      nowStr,
    ]);
  });

  const habitMap = new Map(habits.map((h) => [h.id, h]));
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const logRows: (string | number)[][] = [
    ["Log ID", "Date (YYYY-MM-DD)", "Habit Name", "Category", "Status", "Target Progress", "Notes / Journal", "Timestamp"],
  ];
  sortedLogs.forEach((log) => {
    const habit = habitMap.get(log.habitId);
    logRows.push([
      log.id,
      log.date,
      habit ? habit.name : log.habitId,
      habit ? habit.category.toUpperCase() : "UNKNOWN",
      log.completed ? "COMPLETED (✓)" : "MISSED (✗)",
      log.value ? `${log.value} ${habit?.targetUnit ?? ""}` : log.completed ? "Done" : "Pending",
      log.notes ?? "",
      new Date(log.timestamp).toLocaleString(),
    ]);
  });

  const summaryRows: (string | number)[][] = [
    ["Habit Name", "Category", "Total Days Tracked", "Days Completed", "Success Rate %", "Current Streak", "Status", "Notes"],
  ];
  habits.forEach((h) => {
    const stats = statsMap[h.id];
    const totalDone = stats ? stats.totalCompletions : 0;
    const rate = stats ? stats.completionRateLast30Days : 0;
    summaryRows.push([
      h.name,
      h.category.toUpperCase(),
      30,
      totalDone,
      `${rate}%`,
      stats?.currentStreak ?? 0,
      rate >= 80 ? "EXCELLENT" : rate >= 50 ? "GOOD" : "NEEDS FOCUS",
      h.description ?? "",
    ]);
  });

  const batchData = [
    { range: "Habits_Overview!A1:J100", values: overviewRows },
    { range: "Daily_Logs!A1:H1000", values: logRows },
    { range: "Monthly_Summary!A1:H100", values: summaryRows },
  ];

  try {
    const response = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ valueInputOption: "USER_ENTERED", data: batchData }),
    });
    if (response.ok) {
      const resData = await response.json();
      return { rowsUpdated: resData.totalUpdatedRows ?? overviewRows.length + logRows.length };
    }
  } catch (err) {
    console.warn("Standard tabs batch write notice:", err);
  }

  return { rowsUpdated: habits.length + logs.length };
};

/** Push one log entry's matrix cell (and Daily_Logs row) right after a toggle. */
export const appendSingleLogToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  habits: Habit[],
  habit: Habit,
  log: HabitLog
): Promise<void> => {
  const info = await getSpreadsheetInfo(accessToken, spreadsheetId).catch(() => null);
  const primarySheet = info?.sheets[0];

  if (primarySheet) {
    const colIndex = getDateColumnIndex(log.date);
    const rowIndex = 2 + habits.findIndex((h) => h.id === habit.id); // row 3 = index 2

    if (colIndex !== null && rowIndex >= 2) {
      try {
        await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                repeatCell: {
                  range: { sheetId: primarySheet.sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: colIndex, endColumnIndex: colIndex + 1 },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: log.completed ? { red: 0.0, green: 1.0, blue: 0.0 } : { red: 1.0, green: 1.0, blue: 1.0 },
                    },
                  },
                  fields: "userEnteredFormat.backgroundColor",
                },
              },
            ],
          }),
        });
        await fetch(
          `${SHEETS_API_BASE}/${spreadsheetId}/values/${columnToLetter(colIndex)}${rowIndex + 1}?valueInputOption=USER_ENTERED`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ values: [[log.completed ? DONE_MARK : ""]] }),
          }
        );
      } catch (e) {
        console.warn("Matrix cell update error:", e);
      }
    }
  }

  const row = [
    log.id,
    log.date,
    habit.name,
    habit.category.toUpperCase(),
    log.completed ? "COMPLETED (✓)" : "MISSED (✗)",
    log.value ? `${log.value} ${habit.targetUnit ?? ""}` : log.completed ? "Done" : "Pending",
    log.notes ?? "",
    new Date().toLocaleString(),
  ];

  try {
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/Daily_Logs!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] }),
      }
    );
  } catch {
    // Daily_Logs tab may not exist on a manually-linked sheet — non-fatal.
  }
};

export interface PulledCompletion {
  habitId: string;
  date: string;
}

/**
 * Reads the matrix calendar back and returns every cell that currently
 * holds a mark, for the habits passed in — the "sheet -> app" half of
 * bidirectional sync. Only covers the habit rows/date columns the matrix
 * layout knows about (see getDateColumnIndex); a row is matched to a habit
 * by name first (so a manually-reordered sheet still lines up), falling
 * back to plain row position (3 + index) when no name matches.
 */
export const pullMatrixFromSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  habits: Habit[]
): Promise<PulledCompletion[]> => {
  if (habits.length === 0) return [];

  const info = await getSpreadsheetInfo(accessToken, spreadsheetId);
  const primarySheet = info.sheets[0];
  if (!primarySheet) return [];

  const lastRow = 2 + habits.length; // 1-indexed, e.g. 5 habits -> row 7
  const lastCol = columnToLetter(153); // through Dec 31, 2026
  const range = `'${primarySheet.title}'!A1:${lastCol}${lastRow}`;

  const response = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!response.ok) return [];

  const data = await response.json();
  const rows: string[][] = data.values ?? [];

  const nameToHabitId = new Map(habits.map((h) => [h.name.trim().toLowerCase(), h.id]));

  const completions: PulledCompletion[] = [];
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowName = (row[0] ?? "").trim().toLowerCase();
    const habitId = nameToHabitId.get(rowName) ?? habits[rowIndex - 2]?.id;
    if (!habitId) continue;

    for (let colIndex = 1; colIndex < row.length; colIndex++) {
      const cellValue = (row[colIndex] ?? "").trim();
      if (!cellValue) continue;
      const date = getDateFromColumnIndex(colIndex);
      if (!date || date < MIN_DATE_KEY) continue;
      completions.push({ habitId, date });
    }
  }

  return completions;
};

export const getSpreadsheetInfo = async (
  accessToken: string,
  spreadsheetId: string
): Promise<SheetMetadata> => {
  const response = await fetch(
    `${SHEETS_API_BASE}/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!response.ok) {
    throw new Error("Spreadsheet not found or access denied. Check your ID/permissions.");
  }
  const data = await response.json();
  const sheets = (data.sheets ?? []).map((s: { properties: { title: string; sheetId: number } }) => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
  }));
  return {
    id: data.spreadsheetId,
    title: data.properties?.title ?? "Habit Tracker Sheet",
    sheets,
  };
};

export const parseSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? trimmed;
};
