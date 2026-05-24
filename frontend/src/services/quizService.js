import { apiClient } from "./apiClient";

const getDetailedError = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message) return error.message;
  return fallback;
};

export const quizService = {
  listQuizzes: async () => {
    try {
      const response = await apiClient.get("/quizzes");
      return response.data;
    } catch (error) {
      throw new Error(getDetailedError(error, "Failed to load quizzes."));
    }
  },

  submitQuiz: async (quizId, answers) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/submit`, {
        answers,
      });
      return response.data;
    } catch (error) {
      throw new Error(getDetailedError(error, "Failed to submit quiz."));
    }
  },
};
