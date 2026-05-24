// In dev, use relative /api so Vite proxies to the backend (same origin → cookies work).
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const authService = {
  getGoogleRedirectUrl: () => `${API_URL}/auth/google`,

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

  completeProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/auth/complete-profile`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'Failed to complete profile.');
    }

    return response.json();
  },

  checkUsername: async (username) => {
    const response = await fetch(
      `${API_URL}/auth/check-username?username=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }
    );
    return response.json();
  },

  logout: async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  },
};
