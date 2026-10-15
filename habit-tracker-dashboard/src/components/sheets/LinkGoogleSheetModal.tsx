import React, { useState } from 'react';
import { FileSpreadsheet, Link as LinkIcon, ExternalLink, X, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';

interface LinkGoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkGoogleSheetModal: React.FC<LinkGoogleSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sheetConfig, linkExistingGoogleSheet, createNewGoogleSheet, isSyncing, unlinkGoogleSheet } = useHabits();
  const { user, accessToken, signIn } = useAuth();

  const [inputUrlOrId, setInputUrlOrId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [newTitle, setNewTitle] = useState("Vanessa's Habit Tracker");

  if (!isOpen) return null;

  const handleLinkExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!inputUrlOrId.trim()) {
      setErrorMessage('Please enter a Google Sheet URL or ID.');
      return;
    }

    if (!accessToken) {
      const ok = await signIn();
      if (!ok) {
        setErrorMessage('Google Sign-In is required to access your Google Sheet.');
        return;
      }
    }

    const res = await linkExistingGoogleSheet(inputUrlOrId.trim());
    if (res.success) {
      setSuccessMessage('Successfully connected to your Google Sheet!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.message || 'Could not connect to Google Sheet. Check link/permissions.');
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!accessToken) {
      const ok = await signIn();
      if (!ok) {
        setErrorMessage('Google Sign-In is required.');
        return;
      }
    }

    const res = await createNewGoogleSheet(newTitle.trim() || undefined);
    if (res.success) {
      setSuccessMessage('Created and linked new Google Sheet!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.message || 'Failed to create spreadsheet.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2a26]/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-[24px] border border-[#e9e4df] shadow-xl w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#f2ede8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f2ede8] text-[#5a5a40] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#3d3d2e]">
                Link Google Spreadsheet
              </h3>
              <p className="text-[11px] text-[#8a847c]">
                {sheetConfig ? 'Currently connected' : 'Connect your existing or new spreadsheet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8a847c] hover:text-[#3d3d2e] hover:bg-[#f8f5f2] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Current Status if linked */}
          {sheetConfig && (
            <div className="p-3.5 bg-[#f8f5f2] border border-[#e9e4df] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-[#3d3d2e]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Currently Linked</span>
                </div>
                <a
                  href={sheetConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5a5a40] hover:underline"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] text-[#8a847c] truncate">
                Name: <span className="font-semibold text-[#3d3d2e]">{sheetConfig.spreadsheetName}</span>
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    unlinkGoogleSheet();
                    setSuccessMessage('Spreadsheet disconnected.');
                  }}
                  className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                >
                  Disconnect this sheet
                </button>
              </div>
            </div>
          )}

          {/* Toggle Tab */}
          <div className="flex items-center gap-2 border-b border-[#f2ede8] pb-2">
            <button
              onClick={() => setActiveTab('existing')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                activeTab === 'existing'
                  ? 'bg-[#5a5a40] text-white shadow-2xs'
                  : 'text-[#8a847c] hover:text-[#3d3d2e]'
              }`}
            >
              Link Existing Sheet
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-[#5a5a40] text-white shadow-2xs'
                  : 'text-[#8a847c] hover:text-[#3d3d2e]'
              }`}
            >
              Create New in Drive
            </button>
          </div>

          {/* Tab 1: Link Existing */}
          {activeTab === 'existing' && (
            <form onSubmit={handleLinkExisting} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5a5a40] uppercase tracking-wider mb-1">
                  Google Sheet URL or ID
                </label>
                <input
                  type="text"
                  value={inputUrlOrId}
                  onChange={(e) => setInputUrlOrId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMd..."
                  className="w-full px-3.5 py-2 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5a5a40] focus:bg-white text-[#2d2a26] font-mono text-[11px]"
                />
              </div>

              {/* Helpful instructions */}
              <div className="p-3 bg-[#f8f5f2]/70 rounded-xl border border-[#e9e4df] text-[11px] text-[#8a847c] space-y-1">
                <div className="font-semibold text-[#3d3d2e] flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-[#5a5a40]" />
                  <span>How to get your URL / ID:</span>
                </div>
                <p>1. Open your existing spreadsheet in Google Sheets.</p>
                <p>2. Copy the URL from your browser's address bar (or copy the long ID between <code className="text-[#5a5a40] font-mono">/d/</code> and <code className="text-[#5a5a40] font-mono">/edit</code>).</p>
                <p>3. Paste it above and click <strong>Connect Sheet</strong>.</p>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-[#8a847c] hover:text-[#3d3d2e] hover:bg-[#f8f5f2] rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing || !inputUrlOrId.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#5a5a40] hover:bg-[#4b4b35] rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{isSyncing ? 'Connecting...' : 'Connect Sheet'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Create New */}
          {activeTab === 'new' && (
            <form onSubmit={handleCreateNew} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#5a5a40] uppercase tracking-wider mb-1">
                  Spreadsheet Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Vanessa's Habit Tracker"
                  className="w-full px-3.5 py-2 text-xs bg-[#f8f5f2] border border-[#e9e4df] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5a5a40] focus:bg-white text-[#2d2a26]"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-[#8a847c] hover:text-[#3d3d2e] hover:bg-[#f8f5f2] rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#5a5a40] hover:bg-[#4b4b35] rounded-full shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{isSyncing ? 'Creating...' : 'Create & Link'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
