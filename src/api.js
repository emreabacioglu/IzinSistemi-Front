import axios from 'axios';

const api = axios.create({

  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:7095/api'
});

api.interceptors.request.use((config) => {
  window.dispatchEvent(new CustomEvent('global-loading', { detail: true }));
  return config;
}, (error) => {
  window.dispatchEvent(new CustomEvent('global-loading', { detail: false }));
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  window.dispatchEvent(new CustomEvent('global-loading', { detail: false }));
  return response;
}, (error) => {
  window.dispatchEvent(new CustomEvent('global-loading', { detail: false }));
  
  if (error.response) {
    const status = error.response.status;

    if (status === 401 || ((status === 404 || status === 400) && error.config.url.includes('/Auth/VerifySession'))) {
        window.dispatchEvent(new CustomEvent('force-logout', { detail: 'Hesabınız silinmiş veya yetkiniz değiştirilmiş olabilir.' }));
    }
  }
  
  return Promise.reject(error);
});

export default api;