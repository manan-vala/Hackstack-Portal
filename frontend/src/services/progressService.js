import { apiClient } from './apiClient';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const progressService = {
  getMyProgress: async () => {
    try {
      const response = await apiClient.get('/progress/me');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load progress.'));
    }
  },

  updateProgress: async (progressId, payload) => {
    try {
      const response = await apiClient.patch(`/progress/${progressId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to update progress.'));
    }
  },

  completeDay: async (progressRecord, dayId, moduleTotalDays) => {
    const completedDays = progressRecord.completedDays || [];
    const dayKey = dayId?.toString();

    if (completedDays.some((id) => id.toString() === dayKey)) {
      return progressRecord;
    }

    const nextCompletedDays = [...completedDays, dayId];
    const moduleCompleted = nextCompletedDays.length >= moduleTotalDays && moduleTotalDays > 0;

    return progressService.updateProgress(progressRecord._id, {
      completedDays: nextCompletedDays,
      moduleCompleted,
    });
  },
};
