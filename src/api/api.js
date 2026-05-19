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
            if (!originalRequest) return Promise.reject(error);

            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error || error.message || 'No message';
            
            console.error(`[API Error] ${originalRequest.url}`, {
                status: error.response?.status,
                message: errorMessage
            });

            // Detect expired token (both standard 401s and CORS-blocked Network Errors when a token exists)
            const isUnauthorized = error.response?.status === 401 || 
                (error.message === 'Network Error' && localStorage.getItem('token'));

            if (isUnauthorized && !originalRequest._retry) {
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
                            originalRequest.headers = originalRequest.headers || {};
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            
                            // Replay original request with new token
                            return instance(originalRequest);
                        }
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    
                    // If the refresh token request fails (either via 401/403/400 or because of a CORS/Network error),
                    // clear the expired tokens and redirect to the login screen to break the deadlock.
                    const isAuthFailure = !refreshError.response || 
                        (refreshError.response.status === 401 || refreshError.response.status === 403 || refreshError.response.status === 400);
                    
                    if (isAuthFailure) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        localStorage.setItem('currentPage', 'login');
                        window.location.reload();
                    }
                    return Promise.reject(refreshError);
                }
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
