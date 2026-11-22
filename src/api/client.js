import axios from 'axios';

export const TOKEN_KEY = 'mercatoiq_token';

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

export default client;