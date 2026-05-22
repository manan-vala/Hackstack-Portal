import { apiClient } from './apiClient';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const dashboardService = {
  getDashboard: async () => {
    try {
      const response = await apiClient.get('/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load dashboard data.'));
    }
  },
};