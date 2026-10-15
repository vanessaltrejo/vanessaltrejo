import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

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

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-xs">
      <div
        id="confirmation-modal-dialog"
        className="w-full max-w-md bg-white rounded-[28px] shadow-xl border border-[#f2ede8] overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#f2ede8] bg-[#f8f5f2]/50">
          <div className="flex items-center gap-2.5 text-[#3d3d2e] font-serif font-bold text-sm">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-[#f8f2f0] text-[#a35540]' : 'bg-[#f2ede8] text-[#5a5a40]'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>{title}</span>
          </div>
          <button
            id="close-confirmation-modal-btn"
            onClick={onCancel}
            className="text-[#a39d94] hover:text-[#3d3d2e] p-1.5 rounded-full hover:bg-[#f2ede8] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-xs sm:text-sm text-[#8a847c] leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 bg-[#f8f5f2]/50 border-t border-[#f2ede8]">
          <button
            id="cancel-confirmation-btn"
            onClick={onCancel}
            className="px-5 py-2 text-xs font-semibold text-[#8a847c] hover:bg-[#f2ede8] bg-white border border-[#e9e4df] rounded-full transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="proceed-confirmation-btn"
            onClick={onConfirm}
            className={`px-6 py-2 text-xs font-bold text-white rounded-full transition-colors cursor-pointer shadow-xs ${
              isDestructive
                ? 'bg-[#a35540] hover:bg-[#8e4532] active:bg-[#7a3725]'
                : 'bg-[#5a5a40] hover:bg-[#484833] active:bg-[#3d3d2e]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
