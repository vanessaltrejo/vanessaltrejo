"use client";

import { useState, type FormEvent } from "react";
import { FileSpreadsheet, Link as LinkIcon, ExternalLink, X, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useHabits } from "@/lib/habits/HabitsContext";
import { useSheetsAuth } from "@/lib/habits/SheetsAuthContext";
import { SYSTEM_FONT_STACK, DISPLAY_SERIF_STYLE } from "@/lib/fonts";

interface LinkGoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_LABEL_CLASSNAME = "mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#ffd60a]";

export function LinkGoogleSheetModal({ isOpen, onClose }: LinkGoogleSheetModalProps) {
  const { sheetConfig, linkExistingGoogleSheet, createNewGoogleSheet, isSyncing, unlinkGoogleSheet } = useHabits();
  const { accessToken, connect } = useSheetsAuth();

  const [inputUrlOrId, setInputUrlOrId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [newTitle, setNewTitle] = useState("Vanessa's Habit Tracker");

  if (!isOpen) return null;

  const ensureConnected = async (): Promise<boolean> => {
    if (accessToken) return true;
    const ok = await connect();
    if (!ok) setErrorMessage("Necesitas conectar tu cuenta de Google para continuar.");
    return ok;
  };

  const handleLinkExisting = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!inputUrlOrId.trim()) {
      setErrorMessage("Ingresa el link o el ID de tu Google Sheet.");
      return;
    }
    if (!(await ensureConnected())) return;

    const res = await linkExistingGoogleSheet(inputUrlOrId.trim());
    if (res.success) {
      setSuccessMessage("¡Hoja conectada correctamente!");
      setTimeout(onClose, 1200);
    } else {
      setErrorMessage(res.message || "No se pudo conectar. Revisa el link o los permisos.");
    }
  };

  const handleCreateNew = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!(await ensureConnected())) return;

    const res = await createNewGoogleSheet(newTitle.trim() || undefined);
    if (res.success) {
      setSuccessMessage("¡Hoja creada y conectada!");
      setTimeout(onClose, 1200);
    } else {
      setErrorMessage(res.message || "No se pudo crear la hoja.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[24px] border border-white/10 bg-[#20222d] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-[#ffd60a]">
              <FileSpreadsheet className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm text-white" style={DISPLAY_SERIF_STYLE}>Vincular Google Sheet</h3>
              <p className="text-[11px] text-white/40" style={{ fontFamily: SYSTEM_FONT_STACK }}>
                {sheetConfig ? "Actualmente conectada" : "Conecta una hoja existente o crea una nueva"}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5 text-xs" style={{ fontFamily: SYSTEM_FONT_STACK }}>
          {sheetConfig && (
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Conectada</span>
                </div>
                <a href={sheetConfig.spreadsheetUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ffd60a] hover:underline">
                  <span>Abrir hoja</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="truncate text-[11px] text-white/50">
                Nombre: <span className="font-semibold text-white">{sheetConfig.spreadsheetName}</span>
              </div>
              <div className="flex justify-end pt-1">
                <button type="button" onClick={() => { unlinkGoogleSheet(); setSuccessMessage("Hoja desconectada."); }} className="text-[11px] font-medium text-red-400 hover:underline">
                  Desconectar esta hoja
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            {([
              { key: "existing", label: "Vincular hoja existente" },
              { key: "new", label: "Crear nueva en Drive" },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${activeTab === key ? "bg-[#ffd60a] text-[#171410]" : "text-white/50 hover:text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "existing" && (
            <form onSubmit={handleLinkExisting} className="space-y-3">
              <div>
                <label className={FIELD_LABEL_CLASSNAME}>Link o ID de Google Sheets</label>
                <input
                  value={inputUrlOrId}
                  onChange={(e) => setInputUrlOrId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMd…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 font-mono text-[11px] text-white focus:border-[#ffd60a]/50 focus:bg-white/10 focus:outline-none"
                />
              </div>

              <div className="space-y-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/50">
                <div className="flex items-center gap-1 font-semibold text-white">
                  <HelpCircle className="h-3 w-3 text-[#ffd60a]" />
                  <span>Cómo obtener tu link/ID:</span>
                </div>
                <p>1. Abre tu hoja de cálculo en Google Sheets.</p>
                <p>2. Copia la URL de la barra de direcciones (o el ID entre <code className="font-mono text-[#ffd60a]">/d/</code> y <code className="font-mono text-[#ffd60a]">/edit</code>).</p>
                <p>3. Pégala arriba y da clic en <strong>Conectar hoja</strong>.</p>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-2.5 text-[11px] text-red-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-2.5 text-[11px] text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-white/50 hover:bg-white/5 hover:text-white">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSyncing || !inputUrlOrId.trim()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd60a] px-5 py-2 font-semibold text-[#171410] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <span>{isSyncing ? "Conectando…" : "Conectar hoja"}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "new" && (
            <form onSubmit={handleCreateNew} className="space-y-3">
              <div>
                <label className={FIELD_LABEL_CLASSNAME}>Título de la hoja</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Vanessa's Habit Tracker"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-white focus:border-[#ffd60a]/50 focus:bg-white/10 focus:outline-none"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-2.5 text-[11px] text-red-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-2.5 text-[11px] text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-white/50 hover:bg-white/5 hover:text-white">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd60a] px-5 py-2 font-semibold text-[#171410] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{isSyncing ? "Creando…" : "Crear y conectar"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
