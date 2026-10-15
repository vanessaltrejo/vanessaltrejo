import { AuthUser } from '../types/auth';

const GOOGLE_CLIENT_ID =
  ((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string) ||
  '73019628667-hs6s1mv912qlmok41q9tujgnpif3p48p.apps.googleusercontent.com';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

const USER_STORAGE_KEY = 'nexus_auth_user';

let cachedAccessToken: string | null = null;
let tokenClient: any = null;

/**
 * Load Google Identity Services SDK script dynamically if not present
 */
export const loadGisScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
};

/**
 * Fetch Google User Info using the OAuth access token
 */
export const fetchGoogleUserInfo = async (token: string): Promise<AuthUser> => {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return {
        uid: data.sub || 'google-user',
        displayName: data.name || 'User',
        email: data.email || null,
        photoURL: data.picture || null,
      };
    }
  } catch (e) {
    console.warn('Could not fetch user profile details:', e);
  }

  return {
    uid: 'google-user',
    displayName: 'Google User',
    email: null,
    photoURL: null,
  };
};

/**
 * Sign in with Google using standard Google Identity Services Token Client
 */
export const googleSignIn = async (): Promise<{ user: AuthUser; accessToken: string }> => {
  await loadGisScript();

  return new Promise((resolve, reject) => {
    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        throw new Error('Google Identity Services not loaded');
      }

      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response: any) => {
          if (response.error) {
            console.error('Google OAuth error:', response);
            reject(new Error(response.error_description || response.error));
            return;
          }

          const accessToken = response.access_token;
          if (!accessToken) {
            reject(new Error('No access token received from Google'));
            return;
          }

          cachedAccessToken = accessToken;
          const user = await fetchGoogleUserInfo(accessToken);

          try {
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          } catch {
            // Ignore storage errors
          }

          resolve({ user, accessToken });
        },
        error_callback: (err: any) => {
          console.error('Google Auth Client Error:', err);
          reject(err);
        },
      });

      // Open Google Account popup to request access token
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      console.error('Failed to initialize Google Token Client:', err);
      reject(err);
    }
  });
};

/**
 * Get the currently cached access token
 */
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Set an access token manually (e.g. for testing or direct token linking)
 */
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Get stored user profile from session if available
 */
export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Logout and clear token
 */
export const logout = async (): Promise<void> => {
  if (cachedAccessToken && (window as any).google?.accounts?.oauth2?.revoke) {
    try {
      (window as any).google.accounts.oauth2.revoke(cachedAccessToken, () => {
        // Revoked
      });
    } catch (e) {
      console.warn('Revoke warning:', e);
    }
  }
  cachedAccessToken = null;
  try {
    sessionStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Ignore
  }
};
