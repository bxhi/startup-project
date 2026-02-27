import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    registerImportator: async (formData) => {
        const response = await api.post('/auth/register/importator', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        try {
            await api.post('/auth/logout', { refreshToken });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (email, otp, newPassword) => {
        const response = await api.post('/auth/reset-password', {
            email,
            otp,
            newPassword
        });
        return response.data;
    },

    sendOtp: async (userId) => {
        const response = await api.post('/auth/send-otp', { userId });
        return response.data;
    },

    verifyOtp: async (userId, code) => {
        const response = await api.post('/auth/verify-otp', { userId, code });
        return response.data;
    }
};

export default authService;
