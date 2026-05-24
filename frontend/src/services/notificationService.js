import { apiClient } from './apiClient';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const notificationService = {
  listActiveNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load notifications.'), { cause: error });
    }
  },
};
