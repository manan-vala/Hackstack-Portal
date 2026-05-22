import { apiClient } from "./apiClient";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const moduleService = {
  listModules: async () => {
    try {
      const response = await apiClient.get("/modules");
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load modules."));
    }
  },

  getModuleBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/modules/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to load module."));
    }
  },

  registerModule: async (moduleId) => {
    try {
      const response = await apiClient.post(`/modules/${moduleId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to register for module."));
    }
  },

  unregisterModule: async (moduleId) => {
    try {
      const response = await apiClient.delete(`/modules/${moduleId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(
        getErrorMessage(error, "Failed to unregister from module."),
      );
    }
  },
};
