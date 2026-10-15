import React from 'react';
import {
  CheckSquare,
  ExternalLink,
  RefreshCw,
  Link2,
  LogOut,
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenLinkSheetModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  onOpenLinkSheetModal,
}) => {
  const { sheetConfig, isSyncing, syncWithGoogleSheets } = useHabits();

  const scrollToHabits = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-56 bg-[#f8f5f2] border-r border-[#e9e4df] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & App Branding */}
        <div>
          <div className="p-5 border-b border-[#e9e4df]">
            <h1 className="text-lg font-serif italic text-[#5a5a40] tracking-tight">
              Vanessa's Tracker
            </h1>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[#a39d94]">
              Navigation
            </div>
            <button
              id="nav-item-habits"
              onClick={scrollToHabits}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-full text-left transition-all cursor-pointer bg-[#5a5a40] text-white shadow-2xs font-semibold text-xs"
            >
              <CheckSquare className="w-4 h-4 text-white" />
              <span className="truncate">Habit Tracker</span>
            </button>
          </nav>
        </div>

        {/* Bottom Section: Google Sheets Connection & Log out */}
        <div className="p-3 border-t border-[#e9e4df] space-y-2">
          {sheetConfig ? (
            <div className="p-2.5 rounded-2xl bg-[#f2ede8] border border-[#e9e4df] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#3d3d2e]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Sheets Live</span>
                </div>
                <button
                  id="sidebar-sync-now-btn"
                  onClick={() => syncWithGoogleSheets()}
                  disabled={isSyncing}
                  className="p-1 text-[#5a5a40] hover:text-[#3d3d2e] bg-white border border-[#e9e4df] rounded-md hover:bg-[#fdfcfb] transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                  title="Sync now"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#5a5a40]' : ''}`} />
                </button>
              </div>
              <a
                id="open-spreadsheet-link"
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-1 py-1 px-2 text-[10px] font-semibold text-[#5a5a40] bg-white border border-[#e9e4df] rounded-lg hover:bg-[#fdfcfb] transition-colors shadow-2xs truncate"
              >
                <span className="truncate">{sheetConfig.spreadsheetName}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
              {onOpenLinkSheetModal && (
                <button
                  type="button"
                  onClick={onOpenLinkSheetModal}
                  className="w-full text-[10px] text-[#8a847c] hover:text-[#5a5a40] text-center pt-0.5 cursor-pointer block"
                >
                  Switch / Link Sheet
                </button>
              )}
            </div>
          ) : (
            onOpenLinkSheetModal && (
              <button
                type="button"
                id="sidebar-link-sheet-btn"
                onClick={onOpenLinkSheetModal}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-[#f2ede8] border border-[#e9e4df] text-[#5a5a40] text-[11px] font-semibold rounded-2xl transition-colors cursor-pointer shadow-2xs"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Link Google Sheet</span>
              </button>
            )
          )}

          {/* Non-functional Log Out button matching the exact design aesthetic */}
          <button
            type="button"
            id="sidebar-logout-btn"
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-[#f2ede8] border border-[#e9e4df] text-[#8a847c] hover:text-[#5a5a40] text-[11px] font-semibold rounded-2xl transition-colors cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
