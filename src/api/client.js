import axios from 'axios';

export const TOKEN_KEY = 'mercatoiq_token';
export const USER_KEY = 'mercatoiq_user';

export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // ex. http://localhost:3000/api/v1
    timeout: 10000,
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.startsWith('/auth/');

        if (error.response?.status === 401 && !isAuthRequest) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            // Rechargement complet : AuthProvider relit le localStorage (vide) et user redevient null
            window.location.assign('/login');
        }

        return Promise.reject(error);
    },
);

export default client;