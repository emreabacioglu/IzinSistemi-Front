import axios from 'axios';

const api = axios.create({

  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:7095/api'
});

export default api;