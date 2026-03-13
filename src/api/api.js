import axios from 'axios';

// Base API configuration
const createAPI = (baseURL) => {
    const instance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Add a request interceptor to include the Bearer token
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return instance;
};

// Auth Microservice (Port 5001)
export const authApi = createAPI('http://localhost:5001');

// Offers Microservice (Port 5002)
export const offersApi = createAPI('http://localhost:5002');

// Default export for backward compatibility (pointing to auth)
export default authApi;
