import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour injecter le token
api.interceptors.request.use(
  (config) => {
    // Ne pas ajouter le token pour les routes d'authentification publiques
    const publicRoutes = ['login/', 'register/', 'faculties-public/', 'university-info/', 'universities-public/'];
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route));

    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const facultyService = {
  getAll: () => api.get('facultes/'),
  getById: (id) => api.get(`facultes/${id}/`),
  create: (data) => api.post('facultes/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`facultes/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`facultes/${id}/`),
};

export const universityAdminService = {
  getAll: () => api.get('universities/'),
  getById: (id) => api.get(`universities/${id}/`),
  create: (data) => api.post('universities/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`universities/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`universities/${id}/`),
};

export const roomService = {
  getAll: () => api.get('salles/'),
  getById: (id) => api.get(`salles/${id}/`),
  create: (data) => api.post('salles/', data),
  update: (id, data) => api.put(`salles/${id}/`, data),
  delete: (id) => api.delete(`salles/${id}/`),
};

export const departmentService = {
  getAll: () => api.get('departements/'),
  getById: (id) => api.get(`departements/${id}/`),
  create: (data) => api.post('departements/', data),
  update: (id, data) => api.put(`departements/${id}/`, data),
  delete: (id) => api.delete(`departements/${id}/`),
};

export const teacherService = {
  getAll: () => api.get('enseignants/'),
  getById: (id) => api.get(`enseignants/${id}/`),
  create: (data) => api.post('enseignants/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`enseignants/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`enseignants/${id}/`),
};

export const classService = {
  getAll: () => api.get('classes/'),
  getById: (id) => api.get(`classes/${id}/`),
  create: (data) => api.post('classes/', data),
  update: (id, data) => api.put(`classes/${id}/`, data),
  delete: (id) => api.delete(`classes/${id}/`),
};

export const subjectService = {
  getAll: () => api.get('matieres/'),
  getById: (id) => api.get(`matieres/${id}/`),
  create: (data) => api.post('matieres/', data),
  update: (id, data) => api.put(`matieres/${id}/`, data),
  delete: (id) => api.delete(`matieres/${id}/`),
};

export const academicYearService = {
  getAll: () => api.get('annees-academiques/'),
  create: (data) => api.post('annees-academiques/', data),
  update: (id, data) => api.put(`annees-academiques/${id}/`, data),
  delete: (id) => api.delete(`annees-academiques/${id}/`),
  setCurrent: (id) => api.post(`annees-academiques/${id}/set_current/`),
  deactivate: (id) => api.post(`annees-academiques/${id}/deactivate/`),
  getCurrent: () => api.get('annees-academiques/current/'),
};

export const semesterService = {
  getAll: () => api.get('semestres/'),
  getById: (id) => api.get(`semestres/${id}/`),
  create: (data) => api.post('semestres/', data),
  update: (id, data) => api.put(`semestres/${id}/`, data),
  delete: (id) => api.delete(`semestres/${id}/`),
};

export const teachingService = {
  getAll: () => api.get('enseignements/'),
  getById: (id) => api.get(`enseignements/${id}/`),
  create: (data) => api.post('enseignements/', data),
  update: (id, data) => api.put(`enseignements/${id}/`, data),
  delete: (id) => api.delete(`enseignements/${id}/`),
};

export const scheduleService = {
  getAll: () => api.get('emplois-du-temps/'),
  getById: (id) => api.get(`emplois-du-temps/${id}/`),
  create: (data) => api.post('emplois-du-temps/', data),
  update: (id, data) => api.put(`emplois-du-temps/${id}/`, data),
  delete: (id) => api.delete(`emplois-du-temps/${id}/`),
};

export const userService = {
  getAll: () => api.get('users/'),
  getById: (id) => api.get(`users/${id}/`),
  create: (data) => api.post('users/', data),
  update: (id, data) => api.put(`users/${id}/`, data),
  delete: (id) => api.delete(`users/${id}/`),
};

export const activityService = {
  getAll: () => api.get('activities/'),
  getStats: () => api.get('stats/'),
  archive: (id) => api.post(`activities/${id}/archive/`),
  restore: (id) => api.post(`activities/${id}/restore/`),
  archiveAll: () => api.post('activities/archive_all/'),
  getArchived: () => api.get('activities/archived/'),
  delete: (id) => api.delete(`activities/${id}/`),
};



export const profileService = {
  get: () => api.get('profile/'),
  update: (formData) => api.patch('profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const authService = {
  login: (data) => api.post('login/', data),
  getFacultiesPublic: (univId) => api.get(`faculties-public/${univId ? '?universite_id=' + univId : ''}`),
  getUniversityInfo: (id) => api.get(id ? `university-info/${id}/` : 'university-info/'),
  getUniversitiesPublic: () => api.get('universities-public/'),
  signup: (formData) => api.post('register/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
