import axios from 'axios';

// Em produção (Railway), VITE_API_BASE_URL aponta para a URL pública do backend
// Em desenvolvimento local, o fallback é http://localhost:8080/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: anexa JWT Bearer Token se presente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Resposta: logout e redirecionamento com aviso caso o token expire (401 ou 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login?expirado=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
