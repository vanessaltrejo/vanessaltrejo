import React, { useState } from 'react';
import { LogIn, LogOut, CheckCircle2, Cloud, Loader2, ExternalLink, Link2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';

export const GoogleSignInButton: React.FC<{
  variant?: 'full' | 'compact';
  onOpenLinkSheetModal?: () => void;
}> = ({ variant = 'compact', onOpenLinkSheetModal }) => {
  const { user, accessToken, isLoading, signIn, signOut } = useAuth();
  const { sheetConfig } = useHabits();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#8a847c] bg-[#f8f5f2] rounded-full animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-[#5a5a40]" />
        <span>Checking Google Auth...</span>
      </div>
    );
  }

  if (user && accessToken) {
    if (variant === 'compact') {
      return (
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 pr-3 text-xs font-medium text-[#3d3d2e] bg-white hover:bg-[#f8f5f2] border border-[#e9e4df] rounded-full transition-all shadow-2xs cursor-pointer"
            title="Google Account Connected"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-6 h-6 rounded-full object-cover border border-[#e9e4df]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-xs">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'V'}
              </div>
            )}
            <span className="hidden sm:inline font-semibold text-[#3d3d2e] truncate max-w-[110px]">
              {user.displayName || 'Vanessa'}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected to Google Sheets" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e9e4df] rounded-2xl shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-[#f2ede8]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-9 h-9 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-sm">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'V'}
                  </div>
                )}
                <div className="truncate">
                  <div className="font-semibold text-[#3d3d2e] truncate">{user.displayName || 'Vanessa'}</div>
                  <div className="text-[#8a847c] text-[11px] truncate">{user.email}</div>
                </div>
              </div>

              <div className="py-2.5 space-y-2">
                <div className="flex items-center justify-between text-[#3d3d2e]">
                  <span className="flex items-center gap-1.5 text-[#8a847c]">
                    <Cloud className="w-3.5 h-3.5 text-[#5a5a40]" /> Sheets Sync
                  </span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
                {sheetConfig ? (
                  <div className="text-[11px] text-[#8a847c] truncate bg-[#f8f5f2] p-2 rounded-xl border border-[#e9e4df]">
                    Target: <span className="font-semibold text-[#3d3d2e]">{sheetConfig.spreadsheetName}</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#8a847c] bg-[#f8f5f2] p-2 rounded-xl border border-[#e9e4df]">
                    No spreadsheet linked yet.
                  </div>
                )}

                {onOpenLinkSheetModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenLinkSheetModal();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-[#f8f5f2] hover:bg-[#f2ede8] text-[#5a5a40] font-semibold rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{sheetConfig ? 'Switch / Link Another Sheet' : 'Link Existing Google Sheet'}</span>
                  </button>
                )}
              </div>

              <button
                id="sign-out-btn"
                onClick={() => {
                  setShowDropdown(false);
                  signOut();
                }}
                className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-red-600 hover:bg-red-50 font-medium rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-2.5 bg-[#f8f5f2] border border-[#e9e4df] rounded-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-7 h-7 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#5a5a40] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'V'}
            </div>
          )}
          <div className="min-w-0 truncate">
            <div className="text-xs font-semibold text-[#3d3d2e] truncate">{user.displayName || 'Vanessa'}</div>
            <div className="text-[10px] text-[#8a847c] truncate">{user.email}</div>
          </div>
        </div>
        <button
          id="sidebar-signout-btn"
          onClick={() => signOut()}
          className="text-xs text-[#8a847c] hover:text-red-600 transition-colors p-1 shrink-0 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Official styled "Connect Google Sheets" button
  return (
    <button
      id="google-signin-btn"
      onClick={() => {
        if (onOpenLinkSheetModal) {
          onOpenLinkSheetModal();
        } else {
          signIn();
        }
      }}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#3d3d2e] bg-white hover:bg-[#f8f5f2] border border-[#e9e4df] hover:border-[#5a5a40] rounded-full shadow-2xs transition-all active:scale-[0.99] cursor-pointer"
      title="Connect with Google account or link existing spreadsheet"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
        <path fill="none" d="M0 0h48v48H0z" />
      </svg>
      <span>Connect Sheets</span>
    </button>
  );
};
