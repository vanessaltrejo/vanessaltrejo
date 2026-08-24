"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { translations, type Language, type Translations } from "@/lib/translations";

// Shared with any other route (e.g. not-found.tsx) that needs to read the
// visitor's last-picked language without being inside this same provider —
// localStorage, not just component state, is what makes that possible.
export const LANGUAGE_STORAGE_KEY = "vt-language";

// localStorage's own "storage" event only fires in *other* tabs, never the
// one that made the write — this custom event is what lets this same tab's
// useSyncExternalStore subscribers notice a change made a moment ago by
// setStoredLanguage below.
const LANGUAGE_CHANGE_EVENT = "vt-language-change";

function isLanguage(value: string | null): value is Language {
  return value === "es" || value === "en";
}

function getStoredLanguage(): Language {
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(stored) ? stored : "es";
}

// Matches the default above — used during server rendering, when
// localStorage doesn't exist, so the server and the client's first render
// agree (avoiding a hydration mismatch) before this reads the real stored
// value.
function getServerSnapshot(): Language {
  return "es";
}

function subscribeToStoredLanguage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, callback);
  };
}

export function setStoredLanguage(next: Language) {
  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}

// Reads the visitor's persisted language choice — usable on its own (e.g.
// by not-found.tsx, which sits outside LanguageProvider entirely) or as the
// backing store for the provider below.
export function useStoredLanguage(): Language {
  return useSyncExternalStore(
    subscribeToStoredLanguage,
    getStoredLanguage,
    getServerSnapshot
  );
}

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useStoredLanguage();

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage: setStoredLanguage, t: translations[language] }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Only used inside <LanguageProvider>, which wraps the whole homepage
// experience in ScrollExperience — throwing on a missing provider surfaces
// that mistake immediately instead of silently falling back to Spanish.
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
