import { Habit, HabitLog, HabitStreakStats } from '../types/habit';

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

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Creates a brand new personalized Habit Tracking spreadsheet in the user's Google Drive
 * with pre-configured sheets, beautiful header formatting, and frozen panes.
 */
export const createHabitSpreadsheet = async (
  accessToken: string,
  title = "Vanessa's Habit Tracker"
): Promise<CreatedSheetResult> => {
  const requestBody = {
    properties: {
      title,
      locale: 'en_US',
      autoRecalc: 'ON_CHANGE',
    },
    sheets: [
      {
        properties: {
          title: 'Habits_Overview',
          gridProperties: {
            rowCount: 100,
            columnCount: 10,
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Daily_Logs',
          gridProperties: {
            rowCount: 1000,
            columnCount: 8,
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'Monthly_Summary',
          gridProperties: {
            rowCount: 100,
            columnCount: 8,
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const response = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Spreadsheet: ${response.statusText}`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Apply initial header styling and column names
  await initializeSheetHeaders(accessToken, spreadsheetId);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
};

/**
 * Format headers and default layout for newly created spreadsheet
 */
const initializeSheetHeaders = async (accessToken: string, spreadsheetId: string): Promise<void> => {
  const overviewHeaders = [
    [
      'Habit ID',
      'Habit Name',
      'Category',
      'Time of Day',
      'Frequency',
      'Target',
      'Current Streak (Days)',
      'Best Streak (Days)',
      'Total Completed',
      'Last Updated',
    ],
  ];

  const logHeaders = [
    [
      'Log ID',
      'Date (YYYY-MM-DD)',
      'Habit Name',
      'Category',
      'Status',
      'Target Progress',
      'Notes / Journal',
      'Timestamp',
    ],
  ];

  const summaryHeaders = [
    [
      'Habit Name',
      'Category',
      'Total Days Tracked',
      'Days Completed',
      'Success Rate %',
      'Current Streak',
      'Status',
      'Notes',
    ],
  ];

  // Populate Header Values
  const valueData = [
    {
      range: 'Habits_Overview!A1:J1',
      values: overviewHeaders,
    },
    {
      range: 'Daily_Logs!A1:H1',
      values: logHeaders,
    },
    {
      range: 'Monthly_Summary!A1:H1',
      values: summaryHeaders,
    },
  ];

  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueData,
    }),
  });
};

/**
 * Converts 0-indexed column number to Excel/Sheets column letters (0 -> 'A', 1 -> 'B', 32 -> 'AG', etc.)
 */
export const columnToLetter = (column: number): string => {
  let temp = '';
  let letter = '';
  let col = column + 1;
  while (col > 0) {
    temp = ((col - 1) % 26) + '';
    letter = String.fromCharCode(65 + parseInt(temp, 10)) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
};

/**
 * Calculates column index for a given date string 'YYYY-MM-DD'
 * in the Horizontal Matrix format (Month headers in Row 1, Days in Row 2):
 * - August (Month 8): Day 1 -> Col 1 (B) ... Day 31 -> Col 31 (AF)
 * - September (Month 9): Day 1 -> Col 32 (AG) ... Day 30 -> Col 61 (BJ)
 * - October (Month 10): Day 1 -> Col 62 (BK) ... Day 31 -> Col 92 (CQ)
 */
export const getDateColumnIndex = (dateStr: string): number | null => {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (year !== 2026) {
    // Relative calculation for 2026
    return null;
  }

  if (month === 8) {
    // August: Col index 1 to 31 (Col B to AF)
    return day;
  } else if (month === 9) {
    // September: Col index 32 to 61 (Col AG to BJ)
    return 31 + day;
  } else if (month === 10) {
    // October: Col index 62 to 92 (Col BK to CQ)
    return 61 + day;
  } else if (month === 11) {
    // November: Col index 93 to 122
    return 92 + day;
  } else if (month === 12) {
    // December: Col index 123 to 153
    return 122 + day;
  }
  return null;
};

/**
 * Syncs habits and logs to a Matrix Calendar spreadsheet (like Vanessa's sheet)
 * Updates green cell background colors and checkmarks for every habit / day.
 */
export const syncMatrixCalendarSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  sheetId: number,
  habits: Habit[],
  logs: HabitLog[]
): Promise<{ rowsUpdated: number }> => {
  const requests: any[] = [];
  const completedLogs = logs.filter((l) => l.completed);

  // Group completed logs by habit ID
  const habitIndexMap = new Map<string, number>();
  habits.forEach((h, index) => {
    habitIndexMap.set(h.id, 2 + index); // Row index (0-indexed): Row 3 is index 2
  });

  // Ensure Habit names are written to Column A (Row 3, 4, 5, 6, 7)
  const habitNamesData = habits.map((h) => [h.name]);
  await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values/A3:A${2 + habits.length}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: habitNamesData,
    }),
  });

  // Build batchUpdate formatting requests for completed days (fill green #00FF00)
  completedLogs.forEach((log) => {
    const rowIndex = habitIndexMap.get(log.habitId);
    const colIndex = getDateColumnIndex(log.date);

    if (rowIndex !== undefined && colIndex !== null) {
      requests.push({
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: colIndex,
            endColumnIndex: colIndex + 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: {
                red: 0.0,
                green: 1.0,
                blue: 0.0,
              },
            },
          },
          fields: 'userEnteredFormat.backgroundColor',
        },
      });
    }
  });

  if (requests.length > 0) {
    const res = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('Matrix background color sync warning:', err);
    }
  }

  return { rowsUpdated: completedLogs.length };
};

/**
 * Sync all habits and all logs to the connected spreadsheet
 */
export const syncAllDataToSpreadsheet = async (
  accessToken: string,
  spreadsheetId: string,
  habits: Habit[],
  logs: HabitLog[],
  statsMap: Record<string, HabitStreakStats>
): Promise<{ rowsUpdated: number }> => {
  const info = await getSpreadsheetInfo(accessToken, spreadsheetId).catch(() => null);
  const primarySheet = info?.sheets[0];

  // Also sync matrix calendar formatting if primary sheet is present
  if (primarySheet) {
    try {
      await syncMatrixCalendarSpreadsheet(
        accessToken,
        spreadsheetId,
        primarySheet.sheetId,
        habits,
        logs
      );
    } catch (e) {
      console.warn('Matrix sync notice:', e);
    }
  }

  const nowStr = new Date().toLocaleString();

  // 1. Prepare Habits Overview Rows
  const overviewRows: (string | number)[][] = [
    [
      'Habit ID',
      'Habit Name',
      'Category',
      'Frequency',
      'Target',
      'Current Streak (Days)',
      'Best Streak (Days)',
      'Total Completed',
      'Last Updated',
    ],
  ];

  habits.forEach((habit) => {
    const stats = statsMap[habit.id] || {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
    };
    overviewRows.push([
      habit.id,
      habit.name,
      habit.category.toUpperCase(),
      habit.frequency.type,
      habit.targetValue ? `${habit.targetValue} ${habit.targetUnit || ''}` : 'Yes/No',
      stats.currentStreak,
      stats.longestStreak,
      stats.totalCompletions,
      nowStr,
    ]);
  });

  // 2. Prepare Daily Logs Rows (sorted by date descending)
  const habitMap = new Map(habits.map((h) => [h.id, h]));
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));

  const logRows: (string | number)[][] = [
    [
      'Log ID',
      'Date (YYYY-MM-DD)',
      'Habit Name',
      'Category',
      'Status',
      'Target Progress',
      'Notes / Journal',
      'Timestamp',
    ],
  ];

  sortedLogs.forEach((log) => {
    const habit = habitMap.get(log.habitId);
    logRows.push([
      log.id,
      log.date,
      habit ? habit.name : log.habitId,
      habit ? habit.category.toUpperCase() : 'UNKNOWN',
      log.completed ? 'COMPLETED (✓)' : 'MISSED (✗)',
      log.value ? `${log.value} ${habit?.targetUnit || ''}` : log.completed ? 'Done' : 'Pending',
      log.notes || '',
      new Date(log.timestamp).toLocaleString(),
    ]);
  });

  // 3. Prepare Monthly Summary Rows
  const summaryRows: (string | number)[][] = [
    [
      'Habit Name',
      'Category',
      'Total Days Tracked',
      'Days Completed',
      'Success Rate %',
      'Current Streak',
      'Status',
      'Notes',
    ],
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
      stats?.currentStreak || 0,
      rate >= 80 ? 'EXCELLENT' : rate >= 50 ? 'GOOD' : 'NEEDS FOCUS',
      h.description || '',
    ]);
  });

  // Batch clear and write to ensure complete synchronization
  const batchData = [
    {
      range: 'Habits_Overview!A1:J100',
      values: overviewRows,
    },
    {
      range: 'Daily_Logs!A1:H1000',
      values: logRows,
    },
    {
      range: 'Monthly_Summary!A1:H100',
      values: summaryRows,
    },
  ];

  try {
    const response = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData,
      }),
    });

    if (response.ok) {
      const resData = await response.json();
      return { rowsUpdated: resData.totalUpdatedRows || overviewRows.length + logRows.length };
    }
  } catch (err) {
    console.warn('Standard tabs batch write notice:', err);
  }

  return { rowsUpdated: habits.length + logs.length };
};

/**
 * Append or update a single habit log entry in Google Sheets,
 * and update the horizontal matrix calendar cell format in real-time.
 */
export const appendSingleLogToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  habit: Habit,
  log: HabitLog
): Promise<void> => {
  const info = await getSpreadsheetInfo(accessToken, spreadsheetId).catch(() => null);
  const primarySheet = info?.sheets[0];

  // 1. If Matrix layout exists, update cell background color immediately
  if (primarySheet) {
    const colIndex = getDateColumnIndex(log.date);
    // Find row index based on habit name
    // Row 3: Journaling (index 2), Row 4: Exercise (index 3), Row 5: Sleep (index 4), Row 6: Meditate (index 5), Row 7: Reading (index 6)
    const habitNameLower = habit.name.toLowerCase();
    let rowIndex = 2; // Default to row 3
    if (habitNameLower.includes('journal')) rowIndex = 2;
    else if (habitNameLower.includes('exercise')) rowIndex = 3;
    else if (habitNameLower.includes('sleep')) rowIndex = 4;
    else if (habitNameLower.includes('meditate')) rowIndex = 5;
    else if (habitNameLower.includes('read')) rowIndex = 6;

    if (colIndex !== null) {
      try {
        await fetch(`${SHEETS_API_BASE}/${spreadsheetId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: primarySheet.sheetId,
                    startRowIndex: rowIndex,
                    endRowIndex: rowIndex + 1,
                    startColumnIndex: colIndex,
                    endColumnIndex: colIndex + 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: log.completed
                        ? { red: 0.0, green: 1.0, blue: 0.0 }
                        : { red: 1.0, green: 1.0, blue: 1.0 },
                    },
                  },
                  fields: 'userEnteredFormat.backgroundColor',
                },
              },
            ],
          }),
        });
      } catch (e) {
        console.warn('Matrix cell update error:', e);
      }
    }
  }

  // 2. Also append/log to Daily_Logs if that sheet tab exists
  const row = [
    log.id,
    log.date,
    habit.name,
    habit.category.toUpperCase(),
    log.completed ? 'COMPLETED (✓)' : 'MISSED (✗)',
    log.value ? `${log.value} ${habit.targetUnit || ''}` : log.completed ? 'Done' : 'Pending',
    log.notes || '',
    new Date().toLocaleString(),
  ];

  try {
    await fetch(
      `${SHEETS_API_BASE}/${spreadsheetId}/values/Daily_Logs!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );
  } catch {
    // Ignore if Daily_Logs sheet is not used
  }
};

/**
 * Verify spreadsheet access and get title/sheet list
 */
export const getSpreadsheetInfo = async (
  accessToken: string,
  spreadsheetId: string
): Promise<SheetMetadata> => {
  const response = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Spreadsheet not found or access denied. Check your ID/permissions.');
  }

  const data = await response.json();
  const sheets = (data.sheets || []).map((s: { properties: { title: string; sheetId: number } }) => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
  }));

  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Habit Tracker Sheet',
    sheets,
  };
};

/**
 * Extract Spreadsheet ID from standard Google Sheets URL or raw ID
 */
export const parseSpreadsheetId = (input: string): string => {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it is already the raw alphanumeric ID
  return trimmed;
};
