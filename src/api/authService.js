import api from './api';

const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { accessToken, token, refreshToken, user, profileVerificationStatus } = response.data;
        const finalToken = accessToken || token;
        if (finalToken) {
            localStorage.setItem('token', finalToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            
            const statusToSave = profileVerificationStatus || user?.status || user?.verificationStatus;
            if (statusToSave) {
                localStorage.setItem('verificationStatus', statusToSave);
            }
            console.log('Login successful. Token saved:', finalToken.substring(0, 15) + '...');
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
    },

    verifyResetOtp: async (email, otp) => {
        const response = await api.post('/auth/verify-reset-otp', { email, otp });
        return response.data;
    }
};

export default authService;
