"use client";

import { useState } from "react";
import { Cloud, CheckCircle2, Link2, LogOut, Loader2 } from "lucide-react";
import { useSheetsAuth } from "@/lib/habits/SheetsAuthContext";
import { useHabits } from "@/lib/habits/HabitsContext";
import { SYSTEM_FONT_STACK } from "@/lib/fonts";

// Distinct from src/components/auth/GoogleSignInButton.tsx (the site's own
// login button) — this one requests the Sheets/Drive scopes, on demand,
// only when Vanessa actually wants to link a spreadsheet.
export function GoogleSheetsConnectButton({ onOpenLinkSheetModal }: { onOpenLinkSheetModal: () => void }) {
  const { user, accessToken, isLoading, disconnect } = useSheetsAuth();
  const { sheetConfig } = useHabits();
  const [showMenu, setShowMenu] = useState(false);

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/50"
        style={{ fontFamily: SYSTEM_FONT_STACK }}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Conectando…</span>
      </div>
    );
  }

  if (user && accessToken) {
    return (
      <div className="relative" style={{ fontFamily: SYSTEM_FONT_STACK }}>
        <button
          type="button"
          onClick={() => setShowMenu((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element -- external Google avatar URL, not worth next/image's optimization pipeline for a 24px icon
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffd60a] text-xs font-semibold text-[#171410]">
              {user.displayName?.charAt(0).toUpperCase() ?? "V"}
            </span>
          )}
          <span className="hidden max-w-[110px] truncate sm:inline">{user.displayName ?? "Google"}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" title="Google Sheets conectado" />
        </button>

        {showMenu && (
          <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-white/10 bg-[#20222d] p-3 text-xs shadow-xl">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffd60a] text-sm font-semibold text-[#171410]">
                  {user.displayName?.charAt(0).toUpperCase() ?? "V"}
                </span>
              )}
              <div className="min-w-0 truncate">
                <div className="truncate font-semibold text-white">{user.displayName ?? "Google"}</div>
                <div className="truncate text-[11px] text-white/50">{user.email}</div>
              </div>
            </div>

            <div className="space-y-2 py-2.5">
              <div className="flex items-center justify-between text-white/70">
                <span className="flex items-center gap-1.5">
                  <Cloud className="h-3.5 w-3.5 text-[#ffd60a]" /> Sheets
                </span>
                <span className="flex items-center gap-1 font-medium text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Conectado
                </span>
              </div>
              {sheetConfig ? (
                <div className="truncate rounded-xl border border-white/10 bg-white/5 p-2 text-[11px] text-white/60">
                  Hoja: <span className="font-semibold text-white">{sheetConfig.spreadsheetName}</span>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-[11px] text-white/60">
                  Todavía no hay hoja conectada.
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onOpenLinkSheetModal();
                }}
                className="flex w-full items-center gap-2 rounded-xl bg-white/5 px-2.5 py-1.5 text-left font-semibold text-[#ffd60a] transition-colors hover:bg-white/10"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>{sheetConfig ? "Cambiar hoja" : "Conectar hoja"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                disconnect();
              }}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
              Desconectar Google
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenLinkSheetModal}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
      style={{ fontFamily: SYSTEM_FONT_STACK }}
      title="Conectar con Google Sheets"
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      <span>Conectar Sheets</span>
    </button>
  );
}
