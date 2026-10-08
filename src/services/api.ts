import axios from 'axios';

const env = typeof process !== "undefined" ? process.env : {};
const viteEnv =
    typeof import.meta !== "undefined" && (import.meta as any).env
        ? (import.meta as any).env
        : {};

const RAW_BASE_URL =
    env.NEXT_PUBLIC_API_BASE_URL ||
    viteEnv.VITE_API_BASE_URL ||
    'https://api.couponzas.com';
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(RAW_BASE_URL);
const EFFECTIVE_BASE_URL =
    (env.NODE_ENV === "production" || viteEnv.PROD) && isLocalApiUrl
        ? "https://api.couponzas.com"
        : RAW_BASE_URL;

// đảm bảo có /api ở cuối
const API_BASE_URL = EFFECTIVE_BASE_URL.endsWith('/api')
    ? EFFECTIVE_BASE_URL
    : `${EFFECTIVE_BASE_URL}/api`;

// server url luôn là base (không /api)
export const SERVER_URL = API_BASE_URL.replace(/\/api$/, '');

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.withCredentials = true; // Always send cookies for refresh token support
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                const { token } = res.data;
                if (typeof window !== "undefined") localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return api(originalRequest);
            } catch (refreshError) {
                if (typeof window !== "undefined") {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
