import { apiClient } from './apiClient';

export const authService = {
  getGoogleRedirectUrl: () => apiClient.defaults.baseURL + '/auth/google',

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  completeProfile: async (profileData) => {
    const response = await apiClient.post('/auth/complete-profile', profileData);
    return response.data;
  },

  checkUsername: async (username) => {
    const response = await apiClient.get(
      `/auth/check-username?username=${encodeURIComponent(username)}`
    );
    return response.data;
  },

  getColleges: async () => {
    const response = await apiClient.get('/auth/colleges');
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout').catch(() => {});
  },
};
