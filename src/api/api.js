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
            if (token && token !== 'undefined' && token !== 'null') {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            console.log(`[API >>] ${config.method?.toUpperCase()} ${config.url}`, config.data);
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Add a response interceptor to handle errors
    instance.interceptors.response.use(
        (response) => {
            console.log(`[API <<] ${response.status} ${response.config.url}`, response.data);
            return response;
        },
        (error) => {
            const originalRequest = error.config;
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || error.message || 'No message';
            
            console.error(`[API Error] ${originalRequest?.url}`, {
                status: error.response?.status,
                message: errorMessage
            });
            
            if (error.response?.status === 401) {
                if (errorMessage.toLowerCase().includes('invalid token') || errorMessage.toLowerCase().includes('token expired')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.setItem('currentPage', 'login');
                    window.location.reload();
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// Auth Microservice (Port 5001)
export const authApi = createAPI('http://localhost:5001');

// Offers Microservice (Port 5002)
export const offersApi = createAPI('http://localhost:5002');

// Negotiation Microservice (Port 5004)
export const negotiationApi = createAPI('http://localhost:5004');

// Orders Microservice (Port 5003)
export const ordersApi = createAPI('http://localhost:5003');

// Wallet Microservice (Port 5005)
export const walletApi = createAPI('http://localhost:5005');

// Default export for backward compatibility (pointing to auth)
export default authApi;
