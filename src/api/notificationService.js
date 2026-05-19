import { notificationApi } from './api';

const notificationService = {
    getUserNotifications: async (userId) => {
        try {
            // Try standard route /notifications or /notifications/user/{userId}
            const response = await notificationApi.get(`/notifications/user/${userId}`);
            return response.data;
        } catch (error) {
            console.warn('API fetch failed, trying fallback endpoint /notifications', error);
            try {
                const response = await notificationApi.get('/notifications');
                return response.data;
            } catch (fallbackError) {
                console.error('All notification endpoints failed. Returning mock data.', fallbackError);
                // Return creative mock notifications as requested
                return [
                    {
                        id: 'notif-1',
                        type: 'PROPOSAL',
                        title: 'New Negotiation Proposal Received',
                        titleAr: 'تم تلقي عرض تفاوض جديد',
                        message: 'You have received a new price/quantity offer for your active negotiation.',
                        messageAr: 'لقد تلقيت عرض سعر/كمية جديدًا للتفاوض النشط الخاص بك.',
                        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
                        read: false
                    },
                    {
                        id: 'notif-2',
                        type: 'BUY',
                        title: 'Points Purchased Successfully',
                        titleAr: 'تم شراء النقاط بنجاح',
                        message: 'Successfully purchased 1000 points. Your balance has been updated.',
                        messageAr: 'تم شراء 1000 نقطة بنجاح. تم تحديث رصيدك.',
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                        read: false
                    },
                    {
                        id: 'notif-3',
                        type: 'ORDER',
                        title: 'Escrow Order Finalized',
                        titleAr: 'تم إنهاء طلب الضمان',
                        message: 'The escrow order has been successfully created and finalized.',
                        messageAr: 'تم إنشاء طلب الضمان وإنهاؤه بنجاح.',
                        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                        read: true
                    }
                ];
            }
        }
    },

    markAsRead: async (notificationId) => {
        try {
            const response = await notificationApi.put(`/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            return null;
        }
    }
};

export default notificationService;
