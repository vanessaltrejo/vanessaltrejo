"use client";

import { AlertTriangle, X } from "lucide-react";
import { SYSTEM_FONT_STACK } from "@/lib/fonts";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#20222d] shadow-xl"
        style={{ fontFamily: SYSTEM_FONT_STACK }}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-white">
            <span className={`rounded-full p-2 ${isDestructive ? "bg-red-500/10 text-red-400" : "bg-white/5 text-[#ffd60a]"}`}>
              <AlertTriangle className="h-4 w-4" />
            </span>
            <span>{title}</span>
          </div>
          <button type="button" onClick={onCancel} className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 text-xs leading-relaxed text-white/60 sm:text-sm">{message}</div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/[0.03] p-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-6 py-2 text-xs font-bold text-white transition-colors ${
              isDestructive ? "bg-red-500/80 hover:bg-red-500" : "bg-[#ffd60a] text-[#171410] hover:brightness-95"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
