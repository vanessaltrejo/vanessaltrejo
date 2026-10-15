export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  needsAuth: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
}
