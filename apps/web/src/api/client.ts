const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic API client for making HTTP requests
 */
export const apiClient = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    return res.json();
  },

  async post<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    return res.json();
  },

  async patch<T>(path: string, body: any): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
    return res.json();
  },

  async delete(path: string): Promise<void> {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.statusText}`);
    }
  },
};
