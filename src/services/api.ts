import axios from 'axios';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// đảm bảo có /api ở cuối
const API_BASE_URL = RAW_BASE_URL.endsWith('/api')
    ? RAW_BASE_URL
    : `${RAW_BASE_URL}/api`;

// server url luôn là base (không /api)
export const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
