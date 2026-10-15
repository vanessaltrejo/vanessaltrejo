import { SheetsAuthUser } from "./types";

// This is a SEPARATE Google connection from the site's own login
// (src/auth.ts / next-auth) — that one only ever asks for basic
// profile/email so any visitor can sign in without a scary permissions
// screen. Sheets/Drive access is requested here instead, only when Vanessa
// actually opens "Link Google Sheet" inside the dashboard, using the same
// OAuth Client ID (Client IDs aren't secret) via Google Identity Services'
// client-side token flow — the standard approach for browser-only apps,
// same one habit-tracker-dashboard/ (the reference app) already used.
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const SHEETS_SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

const USER_STORAGE_KEY = "vt_habits_sheets_user";

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (options: { prompt: string }) => void;
}

interface GoogleAccountsOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: unknown) => void;
  }) => GoogleTokenClient;
  revoke: (token: string, callback: () => void) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: GoogleAccountsOAuth2;
      };
    };
  }
}

let cachedAccessToken: string | null = null;

export const loadGisScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existingScript = document.getElementById("google-gsi-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services"))
      );
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
};

export const fetchGoogleUserInfo = async (token: string): Promise<SheetsAuthUser> => {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        uid: data.sub ?? "google-user",
        displayName: data.name ?? null,
        email: data.email ?? null,
        photoURL: data.picture ?? null,
      };
    }
  } catch {
    // Falls through to the placeholder profile below.
  }
  return { uid: "google-user", displayName: null, email: null, photoURL: null };
};

export const sheetsSignIn = async (): Promise<{ user: SheetsAuthUser; accessToken: string }> => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID en .env.local — necesario para conectar Google Sheets."
    );
  }

  await loadGisScript();

  return new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error("Google Identity Services not loaded"));
      return;
    }

    const tokenClient = oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SHEETS_SCOPES,
      callback: async (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description ?? response.error ?? "No access token"));
          return;
        }
        cachedAccessToken = response.access_token;
        const user = await fetchGoogleUserInfo(response.access_token);
        try {
          sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch {
          // Ignore storage errors (e.g. private browsing).
        }
        resolve({ user, accessToken: response.access_token });
      },
      error_callback: (err) => reject(err instanceof Error ? err : new Error(String(err))),
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const getStoredSheetsUser = (): SheetsAuthUser | null => {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SheetsAuthUser) : null;
  } catch {
    return null;
  }
};

export const sheetsSignOut = async (): Promise<void> => {
  const oauth2 = window.google?.accounts?.oauth2;
  if (cachedAccessToken && oauth2) {
    try {
      oauth2.revoke(cachedAccessToken, () => {});
    } catch {
      // Ignore revoke errors — clearing the local token below is enough.
    }
  }
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
};
