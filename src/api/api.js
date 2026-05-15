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
        async (error) => {
            const originalRequest = error.config;
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || error.message || 'No message';
            
            console.error(`[API Error] ${originalRequest?.url}`, {
                status: error.response?.status,
                message: errorMessage
            });
            
            if (error.response?.status === 401 && !originalRequest._retry) {
                // If the refresh token itself fails, logout
                if (originalRequest.url.includes('/auth/refresh-token')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    localStorage.setItem('currentPage', 'login');
                    window.location.reload();
                    return Promise.reject(error);
                }

                originalRequest._retry = true;
                
                try {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
                        // Use a clean axios instance to avoid interceptor loops
                        // Use the explicit auth service URL for refresh tokens
                        const authBaseURL = 'http://localhost:7777/ms-authentification';
                        const refreshResponse = await axios.post(`${authBaseURL}/auth/refresh-token`, {
                            refreshToken: refreshToken
                        });
                        
                        const newAccessToken = refreshResponse.data.accessToken || refreshResponse.data.accesstoken;
                        if (newAccessToken) {
                            localStorage.setItem('token', newAccessToken);
                            if (refreshResponse.data.refreshToken) {
                                localStorage.setItem('refreshToken', refreshResponse.data.refreshToken);
                            }
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return instance(originalRequest);
                        }
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed', refreshError);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    localStorage.setItem('currentPage', 'login');
                    window.location.reload();
                    return Promise.reject(refreshError);
                }

                // If no refresh token or other 401 error, logout
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.setItem('currentPage', 'login');
                window.location.reload();
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// Auth Microservice (Gateway Port 7777)
export const authApi = createAPI('http://localhost:7777/ms-authentification');

// Offers Microservice (Gateway Port 7777)
export const offersApi = createAPI('http://localhost:7777/ms-offers');

// Negotiation Microservice (Gateway Port 7777)
export const negotiationApi = createAPI('http://localhost:7777/ms-negotiation');

// Orders Microservice (Gateway Port 7777)
export const ordersApi = createAPI('http://localhost:7777/ms-orders');

// Wallet Microservice (Gateway Port 7777)
export const walletApi = createAPI('http://localhost:7777/ms-wallet');

// Default export for backward compatibility (pointing to auth)
export default authApi;
