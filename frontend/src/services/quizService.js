import { apiClient } from './apiClient';

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const quizService = {
  listQuizzes: async () => {
    try {
      const response = await apiClient.get('/quizzes');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to load quizzes.'));
    }
  },

  submitQuiz: async (quizId, answers) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Failed to submit quiz.'));
    }
  },
};
