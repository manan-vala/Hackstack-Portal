import { apiClient } from './apiClient';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const leaderboardService = {
  getGlobalLeaderboard: async () => {
    try {
      const response = await apiClient.get('/leaderboards/global');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load global leaderboard.'), { cause: error });
    }
  },
  getModuleLeaderboard: async (moduleId) => {
    try {
      const response = await apiClient.get(`/leaderboards/module/${moduleId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load module leaderboard.'), { cause: error });
    }
  },
};
