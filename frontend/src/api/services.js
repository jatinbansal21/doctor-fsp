import api from './axiosInstance';

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
};

export const patientAPI = {
  getAll: (params) => api.get('/api/patients', { params }),
  getOne: (id) => api.get(`/api/patients/${id}`),
  create: (data) => api.post('/api/patients', data),
  update: (id, data) => api.put(`/api/patients/${id}`, data),
  delete: (id) => api.delete(`/api/patients/${id}`),
  restore: (id) => api.patch(`/api/patients/${id}/restore`),
  getHistory: (id) => api.get(`/api/patients/${id}/history`),
};

export const uploadAPI = {
  uploadExcel: (formData) =>
    api.post('/api/upload/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  exportExcel: (params) =>
    api.get('/api/upload/export', {
      params,
      responseType: 'blob',
    }),
};

export const analyticsAPI = {
  getStats: () => api.get('/api/analytics/stats'),
};
