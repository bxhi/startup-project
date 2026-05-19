import React, { useState, useEffect } from 'react';
import './NotificationsPage.css';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import notificationService from '../../api/notificationService';
import { FiBell, FiCheck, FiMessageSquare, FiTrendingUp, FiBox, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const NotificationsPage = ({ onNavigate }) => {
    const { t, language, dir } = useLanguage();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationService.getUserNotifications(currentUser.userId);
            setNotifications(data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser.userId) {
            fetchNotifications();
        }
    }, [currentUser.userId]);

    const handleMarkAllRead = async () => {
        try {
            // Optimistically update UI
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success(language === 'ar' ? 'تم تحديد الكل كمقروء' : 'All notifications marked as read');
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'PROPOSAL':
                return <FiMessageSquare className="notif-type-icon proposal" />;
            case 'BUY':
                return <FiTrendingUp className="notif-type-icon buy" />;
            case 'ORDER':
                return <FiBox className="notif-type-icon order" />;
            default:
                return <FiBell className="notif-type-icon default" />;
        }
    };

    const labels = {
        title: language === 'ar' ? 'الإشعارات' : 'Notifications',
        subtitle: language === 'ar' ? 'تابع آخر التحديثات والعمليات الجارية' : 'Stay updated with your latest activities',
        markAllRead: language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read',
        noNotifications: language === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications available',
        justNow: language === 'ar' ? 'الآن' : 'Just now',
        emptyDesc: language === 'ar' ? 'سنقوم بإعلامك عندما يحدث شيء جديد!' : 'We will let you know when something new happens!'
    };

    return (
        <DashboardLayout onNavigate={onNavigate} activePage="notifications" contentClassName="notifications-page-layout">
            <div className="notifications-container-page animate-fade-in" style={{ direction: dir }}>
                <div className="notifications-header-row">
                    <div>
                        <h1>{labels.title}</h1>
                        <p>{labels.subtitle}</p>
                    </div>
                    {notifications.some(n => !n.read) && (
                        <button className="btn-mark-all-read" onClick={handleMarkAllRead}>
                            <FiCheck /> <span>{labels.markAllRead}</span>
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="notifications-loading">
                        <div className="spinner"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notifications-empty-slate">
                        <div className="empty-icon-wrapper">
                            <FiBell size={48} />
                        </div>
                        <h3>{labels.noNotifications}</h3>
                        <p>{labels.emptyDesc}</p>
                    </div>
                ) : (
                    <div className="notifications-list-wrapper">
                        {notifications.map((n) => (
                            <div key={n.id} className={`notification-item-card ${n.read ? 'read' : 'unread'}`} onClick={() => !n.read && handleMarkRead(n.id)}>
                                <div className="notif-icon-section">
                                    {getIcon(n.type)}
                                </div>
                                <div className="notif-content-section">
                                    <h3 className="notif-item-title">{language === 'ar' ? (n.titleAr || n.title) : n.title}</h3>
                                    <p className="notif-item-desc">{language === 'ar' ? (n.messageAr || n.message) : n.message}</p>
                                    <span className="notif-item-time">
                                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString(language === 'ar' ? 'ar-DZ' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : labels.justNow}
                                    </span>
                                </div>
                                {!n.read && (
                                    <button className="btn-mark-single-read" onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }} title="Mark as read">
                                        <FiCheckCircle />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default NotificationsPage;
