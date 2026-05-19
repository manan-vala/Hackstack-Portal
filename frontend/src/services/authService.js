const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Triggers the backend OAuth redirection handshake
  getGitHubRedirectUrl: () => {
    return `${API_URL}/auth/github`;
  },

  // Fetches the user using the HttpOnly cookie (automatically sent)
  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include', // Send cookies with the request
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Session validation failed.');
    return response.json();
  }
};
