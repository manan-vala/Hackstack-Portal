import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return token
    ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
    : {};
};

export const dashboardService = {
  getDashboard: async () => {
    const response = await axios.get(`${API_URL}/dashboard`, {
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        ...getAuthHeaders(),
      },
    });

    return response.data;
  },
};