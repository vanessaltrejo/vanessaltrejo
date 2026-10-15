"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Menu, ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { useHabits } from "@/lib/habits/HabitsContext";
import { formatDateKey, getTodayKey, MIN_DATE_KEY } from "@/lib/habits/storage";
import { SYSTEM_FONT_STACK, DISPLAY_SERIF_STYLE } from "@/lib/fonts";
import { GoogleSheetsConnectButton } from "./GoogleSheetsConnectButton";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewHabitModal: () => void;
  onOpenLinkSheetModal: () => void;
  siteUser: { name: string | null | undefined; image: string | null | undefined };
  signOutSlot: ReactNode;
}

export function Header({ onOpenMobileMenu, onOpenNewHabitModal, onOpenLinkSheetModal, siteUser, signOutSlot }: HeaderProps) {
  const { selectedDate, setSelectedDate, sheetConfig, isSyncing, syncWithGoogleSheets, toastMessage } = useHabits();

  const todayKey = getTodayKey();
  const isToday = selectedDate === todayKey;
  const isMinDate = selectedDate <= MIN_DATE_KEY;

  const navigateDate = (days: number) => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const currentDate = new Date(y, m - 1, d);
    currentDate.setDate(currentDate.getDate() + days);
    const targetKey = formatDateKey(currentDate);
    setSelectedDate(targetKey < MIN_DATE_KEY ? MIN_DATE_KEY : targetKey);
  };

  const formatReadableDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-MX", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#1a1d29]/90 px-4 py-3.5 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Abrir navegación"
            className="rounded-xl p-2 text-white/60 transition-colors hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg leading-tight text-white sm:text-2xl" style={DISPLAY_SERIF_STYLE}>
              Habit Tracker
            </h2>
            <p className="hidden text-[11px] text-white/40 sm:block" style={{ fontFamily: SYSTEM_FONT_STACK }}>
              Check-ins diarios, rachas y sincronización con Google Sheets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3" style={{ fontFamily: SYSTEM_FONT_STACK }}>
          <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => navigateDate(-1)}
              disabled={isMinDate}
              title={isMinDate ? "1 de agosto de 2026 es la fecha mínima" : "Día anterior"}
              className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white">
              <CalendarIcon className="h-3.5 w-3.5 text-[#ffd60a]" />
              <span className="hidden md:inline">{formatReadableDate(selectedDate)}</span>
              <span className="md:hidden">{selectedDate}</span>
              {isToday && (
                <span className="rounded-full bg-[#ffd60a] px-2 py-0.5 text-[10px] font-bold text-[#171410]">Hoy</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigateDate(1)}
              title="Día siguiente"
              className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayKey)}
                className="ml-0.5 rounded-full border-l border-white/10 px-2.5 py-1 text-[11px] font-semibold text-[#ffd60a] hover:bg-white/10"
              >
                Hoy
              </button>
            )}
          </div>

          {sheetConfig && (
            <button
              type="button"
              onClick={() => syncWithGoogleSheets()}
              disabled={isSyncing}
              title={`Sincronizar con ${sheetConfig.spreadsheetName}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNewHabitModal}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd60a] px-4 py-2 text-xs font-bold text-[#171410] transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo hábito</span>
          </button>

          <GoogleSheetsConnectButton onOpenLinkSheetModal={onOpenLinkSheetModal} />

          <div className="hidden items-center gap-2 border-l border-white/10 pl-2.5 sm:flex">
            {siteUser.image && (
              <Image src={siteUser.image} alt={siteUser.name ?? "Avatar"} width={28} height={28} className="rounded-full" />
            )}
            {signOutSlot}
          </div>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`mt-2.5 flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium ${
            toastMessage.type === "success"
              ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : toastMessage.type === "error"
                ? "border border-red-400/20 bg-red-400/10 text-red-300"
                : "border border-white/10 bg-white/5 text-white/70"
          }`}
          style={{ fontFamily: SYSTEM_FONT_STACK }}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </header>
  );
}
