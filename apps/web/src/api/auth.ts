const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
  isNewUser: boolean;
}

// Token storage
const TOKEN_KEY = 'paddock_auth_token';
const USER_KEY = 'paddock_user';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const storeAuth = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('paddock_logged_in'); // Clear legacy
};

// API calls
export const authApi = {
  /**
   * Get OAuth config (Google Client ID)
   */
  getConfig: async (): Promise<{ googleClientId: string }> => {
    const res = await fetch(`${API_URL}/api/auth/config`);
    if (!res.ok) {
      throw new Error('Failed to get auth config');
    }
    return res.json();
  },

  /**
   * Login with Google ID token
   */
  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await res.json();
    storeAuth(data.token, data.user);
    return data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User | null> => {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          clearAuth();
          return null;
        }
        throw new Error('Failed to get user');
      }

      const data = await res.json();
      return data.user;
    } catch {
      clearAuth();
      return null;
    }
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    const token = getStoredToken();
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore errors
      }
    }
    clearAuth();
  },

  /**
   * Migrate existing work items to user
   */
  migrateWorkItems: async (): Promise<{ migratedCount: number }> => {
    const token = getStoredToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/api/auth/migrate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Migration failed');
    }

    return res.json();
  },
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = getStoredToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};
