import React from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ActiveTab } from '../../types/habit';
import { useHabits } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';
import { formatDateKey, getTodayKey, MIN_DATE_KEY } from '../../services/habitStorageService';

interface HeaderProps {
  activeTab?: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenNewHabitModal: () => void;
  onOpenLinkSheetModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewHabitModal,
  onOpenLinkSheetModal,
}) => {
  const { selectedDate, setSelectedDate, sheetConfig, isSyncing, syncWithGoogleSheets, toastMessage } = useHabits();
  const { user } = useAuth();

  const todayKey = getTodayKey();
  const isToday = selectedDate === todayKey;
  const isMinDate = selectedDate <= MIN_DATE_KEY;

  const navigateDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);
    currentDate.setDate(currentDate.getDate() + days);
    const targetKey = formatDateKey(currentDate);
    if (targetKey < MIN_DATE_KEY) {
      setSelectedDate(MIN_DATE_KEY);
    } else {
      setSelectedDate(targetKey);
    }
  };

  // Format date for readable display (e.g. "Monday, Aug 24")
  const formatReadableDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fdfcfb]/95 backdrop-blur-md border-b border-[#e9e4df] px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Toggle & View Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#8a847c] hover:bg-[#f2ede8] rounded-xl transition-colors cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#3d3d2e] leading-tight">
              Vanessa's Habit Tracker
            </h2>
            <p className="text-[11px] sm:text-xs text-[#8a847c] hidden sm:block">
              Daily habit check-ins, momentum analytics, and Google Sheets sync
            </p>
          </div>
        </div>

        {/* Right Side: Date Selector, Quick Actions, and Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Date Selector */}
          <div className="flex items-center bg-[#f8f5f2] border border-[#e9e4df] rounded-full p-0.5 shadow-2xs">
            <button
              id="prev-date-btn"
              onClick={() => navigateDate(-1)}
              disabled={isMinDate}
              className="p-1.5 text-[#8a847c] hover:text-[#3d3d2e] hover:bg-white rounded-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title={isMinDate ? 'August 1, 2026 is the earliest start date' : 'Previous Day'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#3d3d2e]">
              <CalendarIcon className="w-3.5 h-3.5 text-[#5a5a40]" />
              <span className="hidden md:inline">{formatReadableDate(selectedDate)}</span>
              <span className="md:hidden">{selectedDate}</span>
              {isToday && (
                <span className="text-[10px] bg-[#5a5a40] text-white font-bold px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </div>

            <button
              id="next-date-btn"
              onClick={() => navigateDate(1)}
              className="p-1.5 text-[#8a847c] hover:text-[#3d3d2e] hover:bg-white rounded-full transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                id="reset-today-btn"
                onClick={() => setSelectedDate(todayKey)}
                className="text-[11px] font-semibold text-[#5a5a40] hover:bg-white px-2.5 py-1 rounded-full transition-colors border-l border-[#e9e4df] ml-0.5 cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          {/* Sync Button */}
          {sheetConfig && (
            <button
              id="header-sync-sheets-btn"
              onClick={() => syncWithGoogleSheets()}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5a5a40] bg-[#f2ede8] hover:bg-[#e9e4df] border border-[#e9e4df] rounded-full transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              title={`Sync to ${sheetConfig.spreadsheetName}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#5a5a40]' : ''}`} />
              <span className="hidden sm:inline">Sync Sheets</span>
            </button>
          )}

          {/* New Habit Button */}
          <button
            id="header-add-habit-btn"
            onClick={onOpenNewHabitModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#5a5a40] hover:bg-[#4b4b35] active:bg-[#3d3d2e] rounded-full transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Habit</span>
          </button>

          {/* Google Auth status pill */}
          <GoogleSignInButton variant="compact" onOpenLinkSheetModal={onOpenLinkSheetModal} />
        </div>
      </div>

      {/* Dynamic Toast Banner */}
      {toastMessage && (
        <div
          id="global-toast-notification"
          className={`mt-2.5 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between animate-fadeIn transition-all ${
            toastMessage.type === 'success'
              ? 'bg-[#f2ede8] text-[#5a5a40] border border-[#e9e4df]'
              : toastMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-[#f8f5f2] text-[#3d3d2e] border border-[#e9e4df]'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#5a5a40] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#8a847c] shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </header>
  );
};
