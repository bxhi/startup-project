import { offersApi } from './api';

const offerService = {
    createOffer: async (formData) => {
        const response = await offersApi.post('/offers', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getOffers: async (params) => {
        const response = await offersApi.get('/offers', { params });
        return response.data;
    },

    getOfferById: async (id) => {
        const response = await offersApi.get(`/offers/${id}`);
        return response.data;
    },

    updateOffer: async (id, formData) => {
        const response = await offersApi.patch(`/offers/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    deleteOffer: async (id) => {
        const response = await offersApi.delete(`/offers/${id}`);
        return response.data;
    }
};

export default offerService;
