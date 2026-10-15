"use client";

import { CheckSquare, ExternalLink, RefreshCw, Link2 } from "lucide-react";
import { useHabits } from "@/lib/habits/HabitsContext";
import { SYSTEM_FONT_STACK } from "@/lib/fonts";

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenLinkSheetModal: () => void;
}

export function Sidebar({ isMobileOpen, setIsMobileOpen, onOpenLinkSheetModal }: SidebarProps) {
  const { sheetConfig, isSyncing, syncWithGoogleSheets } = useHabits();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 flex w-56 flex-col justify-between border-r border-white/10 bg-white/[0.03] backdrop-blur-md transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ fontFamily: SYSTEM_FONT_STACK }}
      >
        <div>
          <div className="border-b border-white/10 p-5">
            <h1 className="text-sm font-semibold tracking-tight text-white">Habit Tracker</h1>
          </div>

          <nav className="space-y-1 p-3">
            <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white/30">
              Navegación
            </div>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex w-full items-center gap-2.5 rounded-full bg-[#ffd60a] px-3 py-2.5 text-left text-xs font-semibold text-[#171410]"
            >
              <CheckSquare className="h-4 w-4" />
              <span className="truncate">Hábitos</span>
            </button>
          </nav>
        </div>

        <div className="space-y-2 border-t border-white/10 p-3">
          {sheetConfig ? (
            <div className="space-y-1.5 rounded-2xl border border-white/10 bg-white/5 p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span>Sheets activo</span>
                </div>
                <button
                  type="button"
                  onClick={() => syncWithGoogleSheets()}
                  disabled={isSyncing}
                  title="Sincronizar ahora"
                  className="rounded-md border border-white/10 bg-white/5 p-1 text-white/60 transition-colors hover:text-white disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <a
                href={sheetConfig.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-1 truncate rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/70 transition-colors hover:text-white"
              >
                <span className="truncate">{sheetConfig.spreadsheetName}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={onOpenLinkSheetModal}
                className="block w-full pt-0.5 text-center text-[10px] text-white/40 hover:text-white/70"
              >
                Cambiar hoja
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLinkSheetModal}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Conectar Google Sheet</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
