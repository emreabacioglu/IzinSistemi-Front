import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7095/api',
});

export default api;