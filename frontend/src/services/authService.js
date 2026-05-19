// In dev, use relative /api so Vite proxies to the backend (same origin → cookies work).
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const authService = {
  getGitHubRedirectUrl: () => `${API_URL}/auth/github`,

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'Session validation failed.');
    }

    return response.json();
  },
};
