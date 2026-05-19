const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Triggers the backend OAuth redirection handshake
  getGitHubRedirectUrl: () => {
    return `${API_URL}/auth/github`;
  },

  // Verifies the user using the token received during callback
  getCurrentUser: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Session validation failed.');
    return response.json();
  }
};
