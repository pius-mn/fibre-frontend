import axios from 'axios';

const Authapi = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // API URL from environment variables
});

Authapi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

Authapi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await Authapi.post('/auth/refresh', { refreshToken });
          localStorage.setItem('token', data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return Authapi(originalRequest);
        } catch (err) {
          localStorage.clear();
          console.log("axios error",err)
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default Authapi;
